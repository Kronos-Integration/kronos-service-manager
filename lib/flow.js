/* jslint node: true, esnext: true */

"use strict";

const RootStepOrFlow = {
  toString: function () {
    return this.name;
  }
};

const RootEndpoint = {
  toString: function () {
    return this.name;
  }
};


exports.create = function (manager, definition) {

  const name = definition.name;
  const steps = {};

  for (let sid in definition.steps) {
    let sd = definition.steps[sid];
    const config = sd.config;
    const stepImplementation = manager.stepImplementation(sd.type);

    if (!stepImplementation) {
      console.log(`stepImplementation not found: ${sd.type}`);
    }
    console.log(`stepImplementation : ${JSON.stringify(stepImplementation)}`);

    const endpoints = {};
    for (let eid in sd.endpoints) {
      let ed = sd.endpoints[eid];
      let ied = stepImplementation.endpoints[eid];

      console.log("implementation endpoint: " + JSON.stringify(ied));

      let properties = {
        name: {
          value: eid
        }
      };

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

      let e = Object.create(RootEndpoint, properties);

      endpoints[eid] = e;
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
        value: stepImplementation
      }
    });

    steps[sid] = myStep;
  }

  for (let sid in steps) {
    let step = steps[sid];
    for (let e in step.endpoints) {
      let ed = step.endpoints[e];

      if (ed.implementation) {
        break;
      }

      let m = ed.value.match(/^([a-z][a-z0-9_]*):?(.*)/);

      if (m) {
        const scheme = m[1];
        console.log(`scheme: ${scheme} ${m[2]}`);
      } else {

      }

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
            c = Object.create(RootEndpoint, {
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

          //console.log(ed.counterpart + " " + csid + " " + ceid + " -> " + c);
        } else {
          // TODO ERROR
          console.log(`Unknown step: ${csid} in flow ${name}`);
        }
      } else {
        // search implementation

        let ei = manager.endpointImplementation(ed.value);
        if (!ei) {
          // TODO ERROR
          console.log(`Endpoint not known step: ${ed.value} in flow ${name}`);
          break;
        }

        console.log(`got endpoint implementation ${ed.value}`);

        step.endpoints[e] = Object.create(ed, {
          implementation: {
            value: ei
          }
        });
      }
    }
  }

  const myFlow = Object.create(RootStepOrFlow, {
    name: {
      value: name
    },
    steps: {
      value: steps
    }
  });

  return myFlow;
};
