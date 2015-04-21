/* jslint node: true, esnext: true */

"use strict";

const stepImpls = require("./stepImplementation");
const endpointImpls = require("./endpointImplementation");
const progressReporter = require("./progressReporter");
const channel = require("./channel");

/**
 * The template object
 */
const RootStep = {
  toString: function () {
    return this.name;
  },
  toJSON: function () {
    return {
      name: this.name,
      steps: this.steps
    };
  }
};


function createSteps(definition, pr) {
  const steps = {};
  const channels = {};

  for (let stepName in definition) {
    pr.pushScope('step', {
      step: stepName
    });

    const stepDef = definition[stepName];
    const stepImpl = stepImpls.implementations[stepDef.type || 'group'];

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
      },
      log: {
        value: function (data, level, formater) {
          // TODO level formater ?
          /*
             endpoints.log.next({
               info: data
             });
             */
          console.log(`${level} ${formater} : ${JSON.stringify(data)}`);
        }
      }
    };

    if (stepDef.steps) {
      const o = createSteps(stepDef.steps, pr);
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
        const eImpl = stepImpl.endpoints[endpointName];
        const eDef = stepDef.endpoints[endpointName];
        const properties = {};

        if (eDef) {
          if (typeof (eDef) === "function") {
            properties.implementation = {
              value: eDef
            };
          } else {
            properties.value = {
              value: eDef
            };
          }
        }

        endpoints[endpointName] = Object.create(eImpl, properties);
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
        let m = endpoint.value.match(/^([a-z][a-z0-9_]*):?(.*)/);

        if (m) {
          const scheme = m[1];
          const suffix = m[2];
          const ei = endpointImpls.implementations[scheme];
          if (ei) {
            const eimpl = ei.implementation(endpoint);

            step.endpoints[endpointName] = Object.create(endpoint, {
              implementation: {
                value: eimpl
              }
            });
          } else {
            if (scheme === 'step') {
              // TODO how to differenciate steps in same level from embedded steps ?
              if ((m = suffix.match(/^([^\/]+)\/(.+)/))) {
                const targetStepName = m[1];
                const targetEndpointName = m[2];
                const targetStep = steps[targetStepName];

                if (targetStep) {
                  let targetEndpoint = targetStep.endpoints[targetEndpointName];

                  if (!targetEndpoint) {
                    /*
                              pr.warn('Counterpart endpoint not automatically created: ${endpoint}', {
                                endpoint: targetEndpointName
                              });*/

                    targetEndpoint = Object.create(endpoint, {});
                    targetStep.endpoints[targetEndpointName] = targetEndpoint;
                  }

                  if (targetEndpoint) {
                    const chl = channel.create(endpoint, targetEndpoint);
                    channels[chl.name] = channel;
                    step.endpoints[endpointName] = chl.endpointA;
                    targetStep.endpoints[targetEndpointName] = chl.endpointB;
                  }
                  break;
                } else {
                  pr.error('Unknown target step: ${step}', {
                    step: targetStepName
                  });
                }
              }
            }
            pr.error('No implementation for endpoint ${endpoint}', {
              endpoint: endpoint.value
            });
          }
        }
      }
    }

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
    steps: steps,
    channels: channels
  };
}

exports.create = function (flowDefinitions, pr) {
  if (!pr) {
    pr = progressReporter.defaultProgressReporter();
  }

  const newFlows = [];

  for (let flowName in flowDefinitions) {
    const definition = flowDefinitions[flowName];

    pr.pushScope('flow', {
      flow: flowName
    });

    const o = createSteps(definition.steps, pr);
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
      initialize: {
        value: function (manager, parentStep) {
          for (let sid in this.steps) {
            const step = this.steps[sid];

            //  try {
            step.meta.initialize(manager, step);
            /*    } catch (e) {
					      console.log(`${step.name}: ${e}`);
					    }*/
          }
        }
      }
    });
  }
  return newFlows;
};
