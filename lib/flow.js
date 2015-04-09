/* jslint node: true, esnext: true */

"use strict";

const stepImpl = require("./stepImplementation");
const endpointImpl = require("./endpointImplementation");
const progressReporter = require("./progressReporter");

const RootStepOrFlow = {
  toString: function () {
    return this.name;
  }
};

exports.create = function (definition, pr) {
  if (!pr) {
    pr = progressReporter.defaultProgressReporter();
  }

  const name = definition.name;
  const steps = {};

  pr.pushScope('flow', {
    flow: name
  });

  for (let sid in definition.steps) {
    pr.pushScope('step', {
      step: sid
    });

    let sd = definition.steps[sid];
    const config = sd.config;
    const si = stepImpl.implementations[sd.type];

    if (!si) {
      pr.error('Step ${type} implementation not found', {
        type: sd.type
      });
      break;
    }

    const endpoints = {};
    for (let eid in si.endpoints) {
      const eImpl = si.endpoints[eid];
      const eDef = sd.endpoints[eid];

      let properties = {};

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
            endpoint: eid
          });
        }
      }

      endpoints[eid] = Object.create(eImpl, properties);
    }

    steps[sid] = Object.create(RootStepOrFlow, {
      name: {
        value: sid
      },
      endpoints: {
        value: endpoints
      },
      config: {
        value: config
      },
      implementation: {
        value: si
      }
    });

    pr.popScope();
  }

  for (let sid in steps) {
    let step = steps[sid];
    for (let e in step.endpoints) {
      let ed = step.endpoints[e];

      // code already assigned -> nothing more to do
      if (ed.implementation) {
        break;
      }

      let m;

      if ((m = ed.value.match(/step:([^\/]+)\/(.+)/))) {
        let csid = m[1];
        let ceid = m[2];
        let cs = steps[csid];
        if (cs) {
          let c = cs.endpoints[ceid];
          if (c) {
            cs.endpoints[ceid] = Object.create(c, {
              implementation: {
                value: function* () {
                  yield {};
                }
              }
            });
          } else {
            cs.endpoints[ceid] = Object.create(endpointImpl.defaultEndpoint, {
              implementation: {
                value: function* () {
                  yield {};
                }
              },
              name: {
                value: ceid
              },
              value: {
                value: `xstep:${step.name}/${ed.name}`
              }
            });
          }
          break;
        } else {
          pr.error('Unknown step: ${step}', {
            step: csid
          });
        }
      }

      m = ed.value.match(/^([a-z][a-z0-9_]*):?(.*)/);

      if (m) {
        const scheme = m[1];

        let ei = endpointImpl.implementations[scheme];
        if (ei) {
          const eimpl = ei.implementation(ed);

          step.endpoints[e] = Object.create(ed, {
            implementation: {
              value: eimpl
            }
          });

        } else {
          pr.error('No implementation for endpoint ${endpoint}', {
            endpoint: ed.value
          });
        }
      }
    }
  }

  const myFlow = Object.create(RootStepOrFlow, {
    name: {
      value: name
    },
    steps: {
      value: steps
    },
    initialize: {
      value: function (manager, parentStep) {
        for (let sid in this.steps) {
          let step = this.steps[sid];

          const en = [];
          for (let e in step.endpoints) {
            const ep = step.endpoints[e];
            en.push(
              `${JSON.stringify(ep)} ${ep.implementation ? true : false}`
            );
          }

          console.log(
            `initialize step: ${step.name} ${step.implementation.name} ${en.join(',')}`
          );

          //step.implementation.initialize(manager, step);
        }
      }
    }
  });

  return myFlow;
};
