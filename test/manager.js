/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
chai.use(require("chai-as-promised"));
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const uti = require('uti');

const kronos = require('../lib/manager.js');

describe('service manager', function () {
  const flowDecl = {
    "flow1": {
      "steps": {
        "s1": {
          "type": "kronos-flow-control",
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
        assert(uti.conformsTo('org.kronos.flow', 'public.json'),
          'org.kronos.flow conformsTo public.json');
        done();
      });
    });
  });

  describe('buildin step implementations', function () {
    it('should be present', function (done) {
      kronos.manager().then(function (manager) {
        const c = manager.stepImplementations['kronos-flow-control'];
        should.exist(c);
        expect(c.name, 'step name').to.equal('kronos-flow-control');
        done();
      });
    });
  });

  describe('step registration', function () {
    it('additional steps', function (done) {
      kronos.manager().then(function (manager) {
        manager.registerStepImplementation('step1', require('./fixtures/steps1/someStep'));
        const c = manager.stepImplementations['step1'];
        expect(c.name, 'step name').to.equal('step1');

        done();
      });
    });
  });

  describe('register flow', function () {
    it('should be present', function (done) {
      kronos.manager().then(function (myManager) {
        try {
          myManager.declareFlows(flowDecl);
          const flowName = 'flow1';
          const flow = myManager.flowDefinitions[flowName];
          should.exist(flow);
          expect(flow.name).to.equal(flowName);
        } catch (e) {
          assert(false);
          console.log(e);
        }
        done();
      });
    });

    it('should be the returned one', function (done) {
      kronos.manager().then(function (myManager) {
        try {
          const f = myManager.declareFlows(flowDecl).flow1;
          expect(f).to.equal(myManager.flowDefinitions.flow1);
        } catch (e) {
          assert(false);
          console.log(e);
        }
        done();
      });
    });

/*
    it('can be removed again', function (done) {
      kronos.manager().then(function (myManager) {
        myManager.declareFlows(flowDecl);

        try {
          myManager.deleteFlow('flow1').then(function () {
            console.log(`flow: ${myManager.flowDefinitions[flowName]}`);
            assert(myManager.flowDefinitions[flowName] === undefined);
            done();
          }, function (reject) {
            console.log(`delete: ${reject}`);
          });
        } catch (e) {
          console.log(`delete catch: ${e}`);
        }
      });
    });
    */
  });
});
