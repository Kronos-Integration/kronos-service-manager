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
      let implEd = si.endpoints[eid];

      let ed = sd.endpoints[eid];
      if (!ed) {
        pr.error('no endpoint for ${endpoint}', {
          endpoint: eid
        });
      }

      let properties = {};

      if (typeof (ed) === "function") {
        properties.implementation = {
          value: ed
        };
      } else {
        properties.value = {
          value: ed
        };
        properties.counterpart = {
          value: ed
        };
      }

      endpoints[eid] = Object.create(implEd, properties);
    }

    const myStep = Object.create(RootStepOrFlow, {
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

    steps[sid] = myStep;
    pr.popScope();
  }

  for (let sid in steps) {
    let step = steps[sid];
    for (let e in step.endpoints) {
      let ed = step.endpoints[e];

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
            c = Object.create(c, {
              counterpart: {
                value: ed
              }
            });
            cs.endpoints[ceid] = c;
          } else {
            c = Object.create(endpointImpl.defaultEndpoint, {
              name: {
                value: ceid
              },
              counterpart: {
                value: ed
              },
              value: {
                value: `step:${step.name}/${ed.name}`
              }
            });
            cs.endpoints[ceid] = c;
          }
          break;
          //console.log(ed.counterpart + " " + csid + " " + ceid + " -> " + c);
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
          pr.error('no implementation for endpoint ${endpoint}', {
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
        console.log(`initialize flow: ${this.name}`);

        for (let sid in this.steps) {
          let step = this.steps[sid];
          console.log(
            `initialize step: ${step.name} ${step.implementation.name} ${step.implementation.initialize}`
          );

          //step.implementation.initialize(manager, step);
        }
      }
    }
  });

  return myFlow;
};
