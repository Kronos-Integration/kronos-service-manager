/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const uti = require('uti');

const kronos = require('../lib/manager.js');

describe('service manager', function () {
  const flowDecl = {
    "flow1": {
      "type": "kronos-flow",
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
          manager.registerStep(require('./fixtures/steps1/someStep'));
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
          myManager.registerFlow(flowDecl);
          const flowName = 'flow1';
          const flow = myManager.flows[flowName];
          should.exist(flow);
          expect(flow.name).to.equal(flowName);
          expect(flow.state).to.equal("registered");
          done();
        } catch (e) {
          done(e);
        }
      }, done);
    });

    it('returned flows is array', function (done) {
      kronos.manager().then(function (myManager) {
        try {
          const f = myManager.registerFlow(flowDecl).then(function (flows) {
            assert.isArray(flows);
            expect(flows[0]).to.equal(myManager.flows.flow1);
            done();
          });
        } catch (e) {
          done(e);
        }
      }, done);
    });

    it('can be removed again', function (done) {
      kronos.manager().then(function (myManager) {
        myManager.registerFlow(flowDecl);
        try {
          myManager.deleteFlow('flow1').then(function () {
            assert(myManager.flows['flow1'] === undefined);
            done();
          }, done);
        } catch (e) {
          done(e);
        }
      }, done);
    });
  });
});
