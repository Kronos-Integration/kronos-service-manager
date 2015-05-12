/* jslint node: true, esnext: true */

"use strict";

const endpointImpls = require("./endpointImplementation");
const progressReporter = require("./progressReporter");
const channel = require("./channel");

/**
 * The template object
 */
const RootStep = {
  toString() {
      return this.name;
    },
    toJSON() {
      return {
        name: this.name,
        type: this.type,
        endpoints: this.endpoints,
        config: this.config,
        steps: this.steps
      };
    },
    initialize(manager, parentStep) {
      for (let sid in this.steps) {
        const step = this.steps[sid];

        try {
          step.meta.initialize(manager, step);
        } catch (e) {
          console.log(`${step.name}: ${e}`);
        }
      }
    }
};

/*
 * creates a series of steps from a json definition
 * @param manager the manager we belong to
 * @param definition the step definition
 * @param pr progress reporter to use
 * @return {object} object with channels and steps
 */
function createSteps(manager, definition, pr) {
  const steps = {};
  const channels = {};

  for (let stepName in definition) {
    pr.pushScope('step', {
      step: stepName
    });

    const stepDef = definition[stepName];
    const stepImpl = manager.stepImplementations[stepDef.type || 'group'];

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
        endpoints[endpointName] = endpointImpls.createEndpoint(endpointName,
          stepDef.endpoints[endpointName],
          stepImpl.endpoints[endpointName]
        );
      }

      // declared but not listed in implementation
      for (let endpointName in stepDef.endpoints) {
        if (endpoints[endpointName]) continue;
        endpoints[endpointName] = endpointImpls.createEndpoint(endpointName,
          stepDef.endpoints[endpointName]);
      }
    }

    steps[stepName] = Object.create(stepImpl, stepProperties);

    pr.popScope();
  }

  for (let stepName in steps) {
    const step = steps[stepName];

    pr.pushScope('step', {
      step: stepName
    });

    for (let endpointName in step.endpoints) {
      const endpoint = step.endpoints[endpointName];

      // code already assigned -> nothing more to do
      if (!endpoint.implementation) {
        let m = endpoint.target.match(/^([a-z][a-z0-9_]*):?(.*)/);

        if (m) {
          const scheme = m[1];
          const suffix = m[2];
          const ei = endpointImpls.implementations[scheme];
          if (ei) {
            step.addEndpoint(endpointImpls.createEndpoint(endpointName, ei.implementation(endpoint), endpoint));
          } else {
            if (scheme === 'step') {
              if ((m = suffix.match(/^([^\/]+)\/([^\/]+)(\/(.+))?/))) {
                let targetEndpointName;
                let targetStep;

                if (m[1] === 'steps') { // alias
                  let targetStepName = m[2];
                  targetEndpointName = m[4];
                  targetStep = step.steps[targetStepName];

                  if (targetStep) {
                    step.addEndpoint(endpointImpls.createEndpoint(endpointName, targetStep.endpoints[
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
                      /*
																pr.warn('Counterpart endpoint not automatically created: ${endpoint}', {
																	endpoint: targetEndpointName
																});*/

                      targetStep.addEndpoint(endpointImpls.createEndpoint(targetEndpointName,
                        endpoint));
                    }

                    if (targetEndpoint) {
                      const chl = channel.create(step, endpoint, targetStep, targetEndpoint);
                      channels[chl.name] = channel;
                      step.endpoints[endpointName] = chl.endpointA;
                      targetStep.endpoints[targetEndpointName] = chl.endpointB;
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

  return {
    steps,
    channels
  };
}


/**
 * function - Creates flows from the JSON object
 *
 * @param  {object} flowDefinitions The Json object describing the flows
 * @param  {object} pr              The progress reporter
 * @return {array}                  The created flows
 */
exports.create = function (manager, flowDefinitions, pr) {
  if (!pr) {
    pr = progressReporter.defaultProgressReporter();
  }

  const newFlows = [];

  for (let flowName in flowDefinitions) {
    const definition = flowDefinitions[flowName];

    pr.pushScope('flow', {
      flow: flowName
    });

    const o = createSteps(manager, definition.steps, pr);
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
      }
    });
    // TODO belongs here: pr.popScope();
  }
  return newFlows;
};
