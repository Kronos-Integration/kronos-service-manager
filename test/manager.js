/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
chai.use(require("chai-as-promised"));
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const kronos = require('../lib/manager.js');

describe('service manager', function () {
  const flowDecl = {
    "flow1": {
      "steps": {
        "s1": {
          "type": "copy",
          "config": {
            "key1": "value1"
          },
          "endpoints": {
            "in": "stdin",
            "out": function* () {
              do {
                let request =
                  yield;
              } while (true);
            }
          }
        }
      }
    }
  };

  describe('buildin step implementations', function () {
    it('should be present', function (done) {
      kronos.manager().then(function (manager) {
        const c = manager.stepImplementations.copy;
        should.exist(c);
        expect(c.name, 'step name').to.equal('copy');
        done();
      });
    });
  });

  describe('step registration', function () {
    xit('should fail with bad step dir', function (done) {
      try {
        const promise = kronos.manager({
          stepDirectories: 'some missing dir'
        });

        promise.then(function (result) {
            console.log(`Result: ${result}`);
            assert(false);
            done();
          },
          function (error) {
            console.log(`Error: ${error}`);
            assert(true);
            done();
          });
      } catch (e) {
        console.log(e);
        done();
      }
    });
  });

  describe('register flow', function () {
    it('should be present', function (done) {
      kronos.manager().then(function (myManager) {
        myManager.declareFlows(flowDecl);
        const flowName = 'flow1';
        const flow = myManager.flowDefinitions[flowName];
        should.exist(flow);
        expect(flow.name).to.equal(flowName);
        done();
      });
    });

    it('should be the returned one', function (done) {
      kronos.manager().then(function (myManager) {
        const f = myManager.declareFlows(flowDecl).flow1;
        expect(f).to.equal(myManager.flowDefinitions.flow1);
        done();
      });
    });
  });
});
