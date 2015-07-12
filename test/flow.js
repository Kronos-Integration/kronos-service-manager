/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
chai.use(require("chai-as-promised"));
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const kronos = require('../lib/manager.js');

function makePromise(flowDecls) {
  return kronos.manager({
    validateSchema: false,
    flows: flowDecls
  });
}

describe('declaration', function () {
  const flowDecls = {
    "flow1": {
      "description": "the flow description",
      "steps": {
        "s1": {
          "type": "kronos-copy",
          "endpoints": {
            "in": "stdin",
            "out": "step:s2/in",
            "log": "stderr"
          }
        },
        "s2": {
          "type": "kronos-copy",
          "endpoints": {
            "out": "file:/tmp/somefile",
            "log": "stderr"
          }
        }
      }
    }
  };

  it('can be initialized', function (done) {
    makePromise(flowDecls).then(function (manager) {
      manager.registerEndpointScheme();

      const flow1 = manager.flowDefinitions.flow1;
      flow1.initialize();
      assert(flow1, "flow object missing");
      done();
    }, function (error) {
      console.log("**** " + error);
      //assert(false, "error during initialization: " + error);
      done();
    });
  });

  it('common attributes', function (done) {
    makePromise(flowDecls).then(function (manager) {
      const flow1 = manager.flowDefinitions.flow1;
      console.log(`description: ${flow1.description}`);
      assert(flow1.description === 'the flow description');

      done();
    });
  });

  describe('declaration with substeps', function () {
    const flowDecls = {
      "flow2": {
        "description": "Test",
        "steps": {
          "s1": {
            "type": "kronos-copy",
            "config": {
              "port": 77
            },
            "endpoints": {
              "in": "stdin",
              "out": "step:s2/in",
              "log": "stderr"
            }
          },
          "s2": {
            "type": "kronos-group",
            "endpoints": {
              "in": {
                "connect": {
                  "connector": {
                    "type": "round-robin-connector",
                    "max_parallel": 10
                  },
                  "target": "step:steps/s2_1/in",
                  "transform": {
                    "element": "fileName"
                  }
                }
              },
              "out": "step:steps/s2_2/out"
            },
            "steps": {
              "s2_1": {
                "endpoints": {
                  "out": "step:s2_2/in",
                  "log": "stderr"
                },
                "type": "kronos-copy"
              },
              "s2_2": {
                "type": "kronos-copy",
                "endpoints": {
                  "log": "stderr"
                }
              }
            }
          }
        }
      }
    };

    it('steps should be present', function (done) {
      makePromise(flowDecls).then(function (manager) {
        const flow2 = manager.flowDefinitions.flow2;
        assert(flow2.steps.s1.name === "s1");
        done();
      });
    });

    it('steps should have a mata object', function (done) {
      makePromise(flowDecls).then(function (manager) {
        const flow2 = manager.flowDefinitions.flow2;
        assert(flow2.steps.s1.meta.name === "kronos-copy");

        assert(`${flow2.steps.s1}` === "s1");

        const json = flow2.steps.s1.toJSON();
        assert(json.name === "s1");
        done();
      });
    });

    it('steps config should be present', function (done) {
      makePromise(flowDecls).then(function (manager) {
        const flow2 = manager.flowDefinitions.flow2;
        assert(flow2.steps.s1.config.port === 77);
        done();
      });
    });

    it('endpoints should be present', function (done) {
      makePromise(flowDecls).then(function (manager) {
        const flow2 = manager.flowDefinitions.flow2;

        assert(flow2.steps.s1.endpoints.out.name === "out");
        done();
      });
    });

    it('substeps are present', function (done) {
      makePromise(flowDecls).then(function (manager) {
        const flow2 = manager.flowDefinitions.flow2;

        assert(flow2.steps.s2.steps.s2_1.name === "s2_1");
        done();
      });
    });

    it('substeps endpoint linking is present', function (done) {
      makePromise(flowDecls).then(function (manager) {
        const flow2 = manager.flowDefinitions.flow2;

        assert(flow2.steps.s2.endpoints.in.name === 'in');
        assert(flow2.steps.s2.endpoints.in.target === 'step:steps/s2_1/in', 'target present');
        assert(flow2.steps.s2.endpoints.in.transform.element === 'fileName', 'transform present');
        assert(flow2.steps.s2.endpoints.out.name === 'out');
        console.log(`${JSON.stringify(flow2.steps.s2.endpoints.out.direction)}`);
        assert(flow2.steps.s2.endpoints.out.direction === 'out(active,passive)');
        done();
      });
    });
  });
});
