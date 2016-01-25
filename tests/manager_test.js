/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const flow = require('kronos-flow'),
  kronos = require('../lib/manager.js'),
  someStepFactory = require('./fixtures/steps1/someStep');

const flowDecl = {
  "name": "flow1",
  "type": "kronos-flow",
  "steps": {
    "s1": {
      "type": "some-step"
    }
  }
};

describe('service manager', () => {
  describe('std attributes', () => {
    it('should have a name', done => {
      kronos.manager({
        name: 'myName',
        logLevel: 'trace'
      }).then(manager => {
        try {
          assert.equal(manager.name, 'myName');
          assert.equal(manager.toString(), 'myName');

          // test if there is a log level entry point
          manager.info(level => 'level ');
          assert.equal(manager.logLevel, 'trace');
          done();
        } catch (e) {
          done(e);
        }
      }, () => done("Manager not created"));
    });
  });

  describe('stop', () => {
    it('empty', done => {
      kronos.manager().then(manager => {
        try {
          manager.stop().then(
            () => done(), done
          );
        } catch (e) {
          done(e);
        }
      }, () => done("Manager not created"));
    });

    it('with flows', done => {
      kronos.manager().then(manager => {
        try {
          manager.registerStep(someStepFactory);
          flow.registerWithManager(manager);
          const aFlow = manager.getStepInstance(flowDecl);
          manager.registerFlow(aFlow);
          aFlow.start().then(() => manager.stop().then(r => done(), done));
        } catch (e) {
          done(e);
        }
      }, () => done("Manager not created"));
    });
  });

  describe('step registration', () => {
    it('registers steps present', done => {
      kronos.manager().then(manager => {
        try {
          let stepFromEvent;
          manager.addListener('stepRegistered', step => stepFromEvent = step);

          manager.registerStep(someStepFactory);
          const myStep = manager.steps['some-step'];
          assert.equal(myStep.name, 'some-step');
          assert.equal(stepFromEvent, myStep);

          // do not fire a 2nd. time stepRegistered
          stepFromEvent = undefined;
          manager.registerStep(someStepFactory);
          assert.equal(stepFromEvent, undefined);

          done();
        } catch (e) {
          done(e);
        }
      }, () => done("Manager not created"));
    });

    describe('getStepInstance', () => {
      it('not registerd should throw', done => {
        kronos.manager().then(manager => {
          try {
            assert.throws(function () {
              manager.getStepInstance({
                type: "not-already-registered"
              });
            });
            done();
          } catch (e) {
            done(e);
          }
        }, () => done("Manager not created"));
      });
    });
  });

  describe('interceptors', () => {
    it('has interceptors', done => {
      kronos.manager().then(myManager => {
        assert.isDefined(myManager.interceptors);
        done();
      });
    });
  });

  describe('flows', () => {
    const flowName = 'flow1';

    it('registered should be present', done => {
      kronos.manager().then(myManager => {
        try {
          let flowFromEvent;
          myManager.addListener('flowRegistered', flow => flowFromEvent = flow);

          flow.registerWithManager(myManager);
          myManager.registerStep(someStepFactory);
          myManager.registerFlow(myManager.getStepInstance(flowDecl));

          const aFlow = myManager.flows[flowName];
          should.exist(aFlow);
          expect(aFlow.name).to.equal(flowName);
          expect(aFlow.state).to.equal("stopped");

          assert.equal(flowFromEvent, aFlow);
          done();
        } catch (e) {
          done(e);
        }
      }, () => done("Manager not created"));
    });

    it('can be removed again', done => {
      kronos.manager().then(myManager => {
        try {
          let removedStepFromEventDone = false;

          myManager.addListener('stepStateChanged', (step, oldState, newState) => {
            if (newState === 'removed' && step.name === 'flow1') {
              removedStepFromEventDone = true;
            }
          });

          flow.registerWithManager(myManager);
          myManager.registerStep(someStepFactory);
          myManager.registerFlow(myManager.getStepInstance(flowDecl));

          myManager.deleteFlow(flowName).then(() => {
            try {
              assert.equal(myManager.flows.flow1, undefined);

              // stepStateChanged may get fired late ??
              setTimeout(function () {
                assert.isTrue(removedStepFromEventDone);
                done();
              }, 10);
            } catch (e) {
              done(e);
            }
          }, done);
        } catch (e) {
          done(e);
        }
      }, () => done("Manager not created"));
    });

    it('deleting unknown flow rejects', done => {
      kronos.manager().then(myManager => {
        try {
          myManager.deleteFlow("unknownFlow").then(function () {
            done(new Error("should not fullfill: deletion of an unknown flow"));
          }, reject => done());
        } catch (e) {
          done(e);
        }
      }, () => done("Manager not created"));
    });
  });
});
