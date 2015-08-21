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
  describe('std attributes', function () {
    it('should have a name', function (done) {
      kronos.manager({
        name: 'myName'
      }).then(function (manager) {
        try {
          assert.equal(manager.name, 'myName');
          assert.equal(manager.toString(), 'myName');
          done();
        } catch (e) {
          done(e);
        }
      }, done);
    });
  });

  describe('uti definitions', function () {
    it('should be present', function (done) {
      kronos.manager().then(function (manager) {
        try {
          //console.log(`** ${manager.uti.conformsTo('org.kronos.flow','public.json')}`);
          assert(uti.conformsTo('org.kronos.flow', 'public.json'),
            'org.kronos.flow conformsTo public.json');
          done();
        } catch (e) {
          done(e);
        }
      }, done);
    });
  });

  describe('buildin step implementations', function () {
    it('should be present', function (done) {
      kronos.manager().then(function (manager) {
        const c = manager.stepImplementations['kronos-flow-control'];
        should.exist(c);
        expect(c.name, 'step name').to.equal('kronos-flow-control');
        done();
      }, done);
    });
  });

  describe('step registration', function () {
    it('additional steps', function (done) {
      kronos.manager().then(function (manager) {
        manager.registerStepImplementation('step1', require('./fixtures/steps1/someStep'));
        const c = manager.stepImplementations['step1'];
        expect(c.name, 'step name').to.equal('step1');
        done();
      }, done);
    });
  });

  describe('register flow', function () {
    it('should be present', function (done) {
      kronos.manager().then(function (myManager) {
        try {
          myManager.registerFlows(flowDecl);
          const flowName = 'flow1';
          const flow = myManager.flowDefinitions[flowName];
          should.exist(flow);
          expect(flow.name).to.equal(flowName);
          expect(flow.state).to.equal("registered");
          done();
        } catch (e) {
          done(e);
        }
      }, done);
    });

    it('should be the returned one', function (done) {
      kronos.manager().then(function (myManager) {
        try {
          const f = myManager.registerFlows(flowDecl).then(function (flows) {
            expect(flows[0]).to.equal(myManager.flowDefinitions.flow1);
            done();
          });
        } catch (e) {
          done(e);
        }
      }, done);
    });

    it('can be removed again', function (done) {
      kronos.manager().then(function (myManager) {
        myManager.registerFlows(flowDecl);
        try {
          myManager.deleteFlow('flow1').then(function () {
            assert(myManager.flowDefinitions['flow1'] === undefined);
            done();
          }, done);
        } catch (e) {
          done(e);
        }
      }, done);
    });
  });
});
