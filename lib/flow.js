/* jslint node: true, esnext: true */

"use strict";

const stepImpls = require("./stepImplementation");
const endpointImpls = require("./endpointImplementation");
const progressReporter = require("./progressReporter");

const RootStepOrFlow = {
  toString: function () {
    return this.name;
  },
  toJSON: function () {
    return {
      name: this.name
    };
  }
};


/*
const theChain = function* () {
	let request;

	while (true) {
		if (request) {
			console.log(
				`provide: ${JSON.stringify(request.info)} ${request.stream ? true : false}`
			);
			yield request;
		} else {
			request =
				yield;

			if (request) {
				console.log(
					`got: ${JSON.stringify(request.info)} ${request.stream ? true : false}`
				);
			} else {
				console.log(
					`got: EMPTY`
				);
			}
		}
	}
};
*/

/*
 * create two endpoints glued together to form a channel
 */
function channel(ep1, ep2) {

  // currenlty only on request at a time can be passed
  let request;

  return [Object.create(ep1, {
      description: {
        value: `Channel from ${ep1.name} to ${ep2.name}`
      },
      implementation: {
        value: function* () {
          request =
            yield;
          console.log(
            `got: ${JSON.stringify(request.info)} ${request.stream ? true : false}`
          );
        }
      }
    }),
    Object.create(ep2, {
      description: {
        value: `Channel from ${ep2.name} to ${ep1.name}`
      },
      implementation: {
        value: function* () {

          yield request;
          console.log(
            `provide: ${JSON.stringify(request.info)} ${request.stream ? true : false}`
          );
        }
      }
    })
  ];
}

exports.create = function (definition, pr) {
  if (!pr) {
    pr = progressReporter.defaultProgressReporter();
  }

  const flowName = definition.name;
  const steps = {};

  pr.pushScope('flow', {
    flow: flowName
  });

  for (let stepName in definition.steps) {
    pr.pushScope('step', {
      step: stepName
    });

    const stepDef = definition.steps[stepName];
    const stepImpl = stepImpls.implementations[stepDef.type];

    if (!stepImpl) {
      pr.error('Step ${type} implementation not found', {
        type: stepDef.type
      });
      break;
    }

    const endpoints = {};
    for (let endpointName in stepImpl.endpoints) {
      //console.log(`Create: ${stepName}/${endpointName}`);

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
      } else {
        if (eImpl.mandatory) {
          pr.error('Mandatory ${endpoint} not defined', {
            endpoint: endpointName
          });
        }
      }

      endpoints[endpointName] = Object.create(eImpl, properties);
    }

    const config = stepDef.config;
    steps[stepName] = Object.create(RootStepOrFlow, {
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
    });

    pr.popScope();
  }

  for (let stepName in steps) {
    const step = steps[stepName];

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
              if ((m = suffix.match(/^([^\/]+)\/(.+)/))) {
                const targetStepName = m[1];
                const targetEndpointName = m[2];
                const targetStep = steps[targetStepName];

                if (targetStep) {
                  const targetEndpoint = targetStep.endpoints[targetEndpointName];

                  if (targetEndpoint) {
                    const eps = channel(endpoint, targetEndpoint);
                    step.endpoints[endpointName] = eps[0];
                    targetStep.endpoints[targetEndpointName] = eps[1];
                  } else {
                    console.log('new endpoint');
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
  }

  const myFlow = Object.create(RootStepOrFlow, {
    name: {
      value: flowName
    },
    steps: {
      value: steps
    },
    initialize: {
      value: function (manager, parentStep) {
        for (let sid in this.steps) {
          let step = this.steps[sid];

          /*
					          const en = [];
					          for (let e in step.endpoints) {
					            const ep = step.endpoints[e];
					            en.push(
					              `${JSON.stringify(ep)}`
					            );
					          }

					          console.log(
					            `initialize: ${step.name} ${en.join(',')}`
					          );
					*/

          //  try {
          step.meta.initialize(manager, step);
          /*    } catch (e) {
					      console.log(`${step.name}: ${e}`);
					    }*/
        }
      }
    }
  });

  return myFlow;
};
