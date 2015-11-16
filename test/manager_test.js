/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const uti = require('uti'),
  flow = require('kronos-flow'),
  kronos = require('../lib/manager.js'),
  someStepFactory = require('./fixtures/steps1/someStep');


describe('service manager', function () {
  const flowDecl = {
    "flow1": {
      "type": "kronos-flow",
      "steps": {
        "s1": {
          "type": "some-step",
          "endpoints": {
            "in": "stdin"
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

  /*
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
  */

  describe('step registration', function () {
    it('registers steps present', function (done) {
      kronos.manager().then(function (manager) {
        try {
          manager.registerStep(someStepFactory);
          const c = manager.steps['some-step'];
          expect(c.name, 'step name').to.equal('some-step');
          done();
        } catch (e) {
          done(e);
        }
      }, done);
    });
  });

  describe('register flow', function () {
    it('should be present', function (done) {
      kronos.manager().then(function (myManager) {
        try {
          flow.registerWithManager(myManager);
          myManager.registerStep(someStepFactory);
          flow.loadFlows(myManager, myManager.scopeReporter, flowDecl);

          const flowName = 'flow1';
          const flowFactory = myManager.flows[flowName];
          should.exist(flowFactory);
          expect(flowFactory.name).to.equal(flowName);
          expect(flowFactory.state).to.equal("registered");
          done();
        } catch (e) {
          done(e);
        }
      }, done);
    });

    it('can be removed again', function (done) {
      kronos.manager().then(function (myManager) {
        flow.registerWithManager(myManager);
        myManager.registerStep(someStepFactory);
        flow.loadFlows(myManager, myManager.scopeReporter, flowDecl);

        try {
          myManager.deleteFlow('flow1').then(function () {
            assert(myManager.flows.flow1 === undefined);
            done();
          }, done);
        } catch (e) {
          done(e);
        }
      }, done);
    });
  });
});
