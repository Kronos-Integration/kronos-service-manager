/* global describe, it, xit*/
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
  describe('with substeps', function () {
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
                },
                "contentInfoProcessing": {
                  "fileName": "${name}"
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
      }, done);
    });

    it('steps should have a mata object', function (done) {
      makePromise(flowDecls).then(function (manager) {
        const flow2 = manager.flowDefinitions.flow2;
        assert(flow2.steps.s1.meta.name === "kronos-copy");

        assert(`${flow2.steps.s1}` === "s1");

        const json = flow2.steps.s1.toJSON();
        assert(json.name === "s1");
        done();
      }, done);
    });

    it('steps config should be present', function (done) {
      makePromise(flowDecls).then(function (manager) {
        const flow2 = manager.flowDefinitions.flow2;
        assert(flow2.steps.s1.config.port === 77);
        done();
      }, done);
    });

    it('endpoints should be present', function (done) {
      makePromise(flowDecls).then(function (manager) {
        const flow2 = manager.flowDefinitions.flow2;

        assert(flow2.steps.s1.endpoints.out.name === "out");
        done();
      }, done);
    });

    it('substeps are present', function (done) {
      makePromise(flowDecls).then(function (manager) {
        const flow2 = manager.flowDefinitions.flow2;

        assert(flow2.steps.s2.steps.s2_1.name === "s2_1");
        done();
      }, done);
    });

    it('substeps endpoint linking is present', function (done) {
      makePromise(flowDecls).then(function (manager) {
        try {
          const flow2 = manager.flowDefinitions.flow2;
          assert(flow2.steps.s2.endpoints.in.name === 'in');
          assert(flow2.steps.s2.endpoints.in.target === 'step:steps/s2_1/in', 'target present');
          assert(flow2.steps.s2.endpoints.out.name === 'out');
          assert(flow2.steps.s2.endpoints.out.direction === 'out(active,passive)');
          done();
        } catch (e) {
          done(e);
        }
      }, done);
    });

    it('json', function (done) {
      makePromise(flowDecls).then(function (manager) {
        const flow2 = manager.flowDefinitions.flow2;
        const json = flow2.toJSON();
        //console.log(`${JSON.stringify(json,undefined,' ')}`);
        assert(json.name === 'flow2');

        //console.log(`${JSON.stringify(json.steps.s1,undefined,' ')}`);
        //  assert(json.steps.s1.type === 'kronos-copy');
        done();
      }, done);
    });
  });
});
