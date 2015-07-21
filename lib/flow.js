/* jslint node: true, esnext: true */

"use strict";

const log4js = require('log4js');
const logger = log4js.getLogger('kronos-service-manager:flow');
logger.setLevel(log4js.levels.ERROR);

const channel = require("./channel");

const kronosStep = require('kronos-step');

/**
 * The template object
 */
const RootStep = {
  toString() {
      return this.name;
    },
    toJSON() {
      const json = {
        name: this.name,
        description: this.description,
        endpoints: this.endpoints,
        config: this.config,
        steps: this.steps
      };

      return json;
    },
    initialize(manager, parentStep) {
      for (let sid in this.steps) {
        const step = this.steps[sid];

        try {
          step.meta.initialize(manager, step);
        } catch (e) {
          // TODO
          logger.error(`error: ${e} ${step.meta.name}`);
          logger.error(`initialize ${this}/${step.name}: ${e}`);
        }
      }
    }
};

/*
 * Creates a series of steps from a json definition
 * @param manager the manager we belong to
 * @param definition the step definition
 * @param pr progress reporter to use
 * @return {object} object with channels and steps
 */
function createSteps(manager, definition, pr) {
  const steps = {};
  const channels = {};

  try {
    for (let stepName in definition) {
      logger.debug(`Iterate step definition to create steps : ${stepName}`);

      pr.pushScope('step', {
        step: stepName
      });

      const stepDef = definition[stepName];
      const stepImpl = manager.stepImplementations[stepDef.type || 'kronos-group'];

      if (!stepImpl) {
        pr.error('Step ${type} implementation not found', {
          type: stepDef.type
        });
        continue;
      }

      const endpoints = {};
      const config = stepDef.config;
      const stepProperties = {
        name: {
          value: stepName
        },
        endpoints: {
          value: endpoints
        },
        config: {
          value: config
        },
        meta: {
          value: stepImpl
        }
      };

      if (stepDef.steps) {
        const o = createSteps(manager, stepDef.steps, pr);
        const subSteps = o.steps;
        const subChannels = o.channels;

        stepProperties.steps = {
          value: subSteps
        };
        stepProperties.channels = {
          value: subChannels
        };
      }

      if (stepDef.endpoints) {
        for (let endpointName in stepImpl.endpoints) {
          logger.debug(`Step : '${stepName}' implemented endpoints '${endpointName}'`);
          endpoints[endpointName] = kronosStep.createEndpoint(endpointName,
            stepDef.endpoints[endpointName],
            stepImpl.endpoints[endpointName]
          );
        }

        // declared but not listed in implementation
        for (let endpointName in stepDef.endpoints) {
          if (endpoints[endpointName]) continue;
          logger.debug(`Step : '${stepName}' declared endpoints '${endpointName}' not implemented`);
          endpoints[endpointName] = kronosStep.createEndpoint(endpointName,
            stepDef.endpoints[endpointName]);
        }
      }

      steps[stepName] = Object.create(stepImpl, stepProperties);
      logger.debug(`Step '${stepName}' created`);

      pr.popScope();
    }

    for (let stepName in steps) {
      const step = steps[stepName];

      logger.debug(`Iterate created steps : ${stepName}`);

      pr.pushScope('step', {
        step: stepName
      });

      for (let endpointName in step.endpoints) {
        logger.debug(`Iterate endpoint '${endpointName}' of step '${stepName}'`);

        const endpoint = step.endpoints[endpointName];

        // code already assigned -> nothing more to do
        if (!endpoint.implementation) {
          let m = endpoint.target.match(/^([a-z][a-z0-9_]*):?(.*)/);

          if (m) {
            const scheme = m[1];
            const suffix = m[2];
            const ei = manager.endpointSchemeImplementations[scheme];
            if (ei) {
              step.addEndpoint(kronosStep.createEndpoint(endpointName, ei.implementation, endpoint));
            } else {
              if (scheme === 'step') {
                if ((m = suffix.match(/^([^\/]+)\/([^\/]+)(\/(.+))?/))) {
                  let targetEndpointName;
                  let targetStep;

                  if (m[1] === 'steps') { // alias
                    // The endpoint links to sub steps
                    let targetStepName = m[2];
                    targetEndpointName = m[4];
                    targetStep = step.steps[targetStepName];

                    if (targetStep) {
                      step.addEndpoint(kronosStep.createEndpoint(endpointName, targetStep.endpoints[
                        targetEndpointName]));
                    } else {
                      pr.error('Unknown target step: steps/${step}', {
                        step: targetStepName
                      });
                    }
                  } else {
                    let targetStepName = m[1];
                    targetEndpointName = m[2];
                    targetStep = steps[targetStepName];

                    if (targetStep) {
                      let targetEndpoint = targetStep.endpoints[targetEndpointName];

                      if (!targetEndpoint) {
                        targetStep.addEndpoint(kronosStep.createEndpoint(targetEndpointName,
                          endpoint));
                      }

                      if (targetEndpoint) {
                        try {
                          const chl = channel.create(step, endpoint, targetStep, targetEndpoint);
                          channels[chl.name] = channel;
                          step.endpoints[endpointName] = chl.endpointA;
                          targetStep.endpoints[targetEndpointName] = chl.endpointB;
                        } catch (e) {
                          pr.error(
                            'Unable to create channel: ${error} ${step}/${endpointA}<>${targetStep}/${endpointB}', {
                              targetStep: targetStepName,
                              endpointA: endpoint.name,
                              endpointB: targetEndpoint.name,
                              error: e
                            });
                        }
                      }
                    } else {
                      pr.error('Unknown target step: ${step}', {
                        step: targetStepName
                      });
                    }
                  }
                }
              }
              /*pr.error('No implementation for endpoint ${endpoint}', {
						  endpoint: endpoint.target
						});*/
            }
          }
        }
      }

      // finally report mandatory but missing endpoints
      for (let endpointName in step.meta.endpoints) {
        const metaEndpoint = step.meta.endpoints[endpointName];

        if (metaEndpoint.mandatory && !step.endpoints[endpointName]) {
          pr.error('Mandatory ${endpoint} not defined', {
            endpoint: endpointName
          });
        }
      }

      pr.popScope();
    }
  } catch (e) {
    pr.error('Mandatory ${error} not defined', {
      error: error
    });
  }

  return {
    steps,
    channels
  };
}


/**
 * function - Creates flows from the JSON object
 *
 * @param  {object} manager         The service manager
 * @param  {object} flowDefinitions The Json object describing the flows
 * @param  {object} progressReporter The progress reporter
 * @return {array}                  The created flows
 */
exports.create = function (manager, flowDefinitions, progressReporter) {

  if (!progressReporter) {
    throw ("No Prgress reporter given.");
  }

  const newFlows = [];

  for (let flowName in flowDefinitions) {
    logger.debug(`Create new flow '${flowName}'`);

    const definition = flowDefinitions[flowName];

    progressReporter.pushScope('flow', {
      flow: flowName
    });

    const o = createSteps(manager, definition.steps, progressReporter);
    const steps = o.steps;
    const channels = o.channels;

    newFlows[flowName] = Object.create(RootStep, {
      name: {
        value: flowName
      },
      steps: {
        value: steps
      },
      channels: {
        value: channels,
      },
      description: {
        value: definition.description
      }
    });
    // TODO belongs here: progressReporter.popScope();
  }
  return newFlows;
};
