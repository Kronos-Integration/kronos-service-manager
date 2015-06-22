/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
chai.use(require("chai-as-promised"));
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const path = require('path');
const uti = require('uti');

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
                let request = yield;
              } while (true);
            }
          }
        }
      }
    }
  };

  describe('uti definitions', function () {
    it('should be present', function (done) {
      kronos.manager().then(function (manager) {
        //console.log(`** ${manager.uti.conformsTo('org.kronos.flow','public.json')}`);
        assert(uti.conformsTo('org.kronos.flow','public.json'), 'org.kronos.flow conformsTo public.json');
        done();
      });
    });
  });

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
    it('should register from additional dirs', function (done) {
      const promise = kronos.manager({
        stepDirectories: [path.join(__dirname, 'fixtures', 'steps1'), path.join(__dirname, 'fixtures',
          'steps2')]
      });

      promise.then(function (manager) {
        assert(manager.stepImplementations.someStep.name == 'someStep');
        assert(manager.stepImplementations.anotherStep.name == 'anotherStep');
        done();
      });
    });

    it('should fail with bad step dir', function (done) {
      const promise = kronos.manager({
        stepDirectories: 'some missing dir'
      });

      promise.then(function (result) {
          assert(false);
          done();
        },
        function (error) {
          // expect Error: ENOENT: no such file or directory, scandir 'some missing dir'
          assert(error.toString().match(/ENOENT/));
          done();
        });
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
