/* global describe, it, xit*/
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
chai.use(require("chai-as-promised"));
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const kronos = require('../lib/manager.js');

function runFlowTest(flowDecls, flowName, done, test) {
  return kronos.manager({
    name: "myManager",
    validateSchema: false,
    flows: flowDecls
  }).then(function (manager) {
    try {
      const flow = manager.flowDefinitions[flowName];
      assert.equal(flow.manager, manager);
      assert(flow, "flow object missing");
      test(flow);
    } catch (e) {
      done(e);
    }
  },done);
}

describe('flow', function () {
  describe('simple', function () {
    const flowDecls = {
      "flow1": {
        "description": "the flow description",
        "steps": {
          "s1": {
            "type": "kronos-copy",
            "endpoints": {
              "in": "stdin",
              "out": {
                "connect": {
                  "target": "stdout"
                },
                "contentInfoProcessing": {
                  "fileName": "${name}"
                }
              }
            }
          }
        }
      }
    };
    describe('attributes', function () {
      it('has a description', function (done) {
        runFlowTest(flowDecls, 'flow1', done, function (flow) {
          assert.equal(flow.description,'the flow description');
          done();
        });
      });

      it('has some endpoints', function (done) {
        runFlowTest(flowDecls, 'flow1', done, function (flow) {
          assert.equal(flow.steps.s1.endpoints.out.contentInfoProcessing.fileName,'${name}');
          done();
        });
      });

      it('has a manager', function (done) {
        runFlowTest(flowDecls, 'flow1', done, function (flow) {
          assert.equal(flow.manager.name,'myManager');
          done();
        });
      });

      it('has a state', function (done) {
        runFlowTest(flowDecls, 'flow1', done, function (flow) {
          assert.equal(flow.state,'registered');
          done();
        });
      });
    });

    describe('lifecycle', function () {
      it('can`t be paused from registered', function (done) {
        runFlowTest(flowDecls, 'flow1', done, function (flow) {
          flow.pause().then(function (flow) {
            try {
              done(new Error('registered flows cannot be paused'));
            }
            catch(e) { done(e); }
          },function(e) { done(); });
        });
      });

      it('can be started', function (done) {
        runFlowTest(flowDecls, 'flow1', done, function (flow) {
          flow.start().then(function (flow) {
            try {
              assert.equal(flow.state, 'running');
              done();
            }
            catch(e) { done(e); }
          },done);
        });
      });
      it('can be started and stopped again', function (done) {
        runFlowTest(flowDecls, 'flow1', done, function (flow) {
          flow.start().then(function (flow) {
            flow.stop().then(function (flow) {
              try {
                assert.equal(flow.state, 'stopped');
                done();
              }
              catch(e) { done(e); }
            },done);
          });
        });
      });
    });
  });
});
