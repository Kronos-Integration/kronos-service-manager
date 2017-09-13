/* global describe, it, xit */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const flow = require('kronos-flow'),
  {
    ReceiveEndpoint
  } = require('kronos-endpoint'),
  kronos = require('../dist/module.js'),
  someStepFactory = require('./fixtures/steps1/someStep');

const flowDecl = {
  name: 'flow1',
  type: 'kronos-flow',
  steps: {
    s1: {
      type: 'some-step'
    }
  }
};

describe('service manager', () => {
  describe('std attributes', () => {
    it('should have a name', done => {
      kronos.manager([{
        name: 'myName',
        logLevel: 'trace',
        id: 'myId'
      }]).then(manager => {
        try {
          assert.equal(manager.type, 'kronos');
          assert.equal(manager.name, 'myName');
          assert.equal(manager.id, 'myId');
          assert.equal(manager.services.logger.name, 'logger');
          assert.equal(manager.services.config.name, 'config');

          // test if there is a log level entry point
          manager.info(level => 'level');
          assert.equal(manager.logLevel, 'trace');
          done();
        } catch (e) {
          done(e);
        }
      }, done);
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
      }, () => done('Manager not created'));
    });

    it('with flows', done => {
      kronos.manager({
        logLevel: 'info'
      }, [flow]).then(manager => {
        try {
          Promise.all([
            manager.registerStep(someStepFactory)
          ]).then(() => {
            const aFlow = manager.createStepInstanceFromConfig(flowDecl, manager);
            manager.registerFlow(aFlow);
            aFlow.start().then(() => manager.stop().then(r => done(), done));
          }).catch(done);
        } catch (e) {
          done(e);
        }
      }, () => done('Manager not created'));
    });
  });

  describe('step registration', () => {
    it('registers steps present', done => {
      kronos.manager().then(manager => {
        try {
          let stepFromEvent;
          manager.addListener('stepRegistered', step => stepFromEvent = step);

          manager.registerStep(someStepFactory).then(() => {
            const myStep = manager.steps['some-step'];
            assert.equal(myStep.name, 'some-step');
            assert.equal(stepFromEvent, myStep);

            // do not fire a 2nd. time stepRegistered
            stepFromEvent = undefined;
            manager.registerStep(someStepFactory).then(() => {
              assert.equal(stepFromEvent, undefined);
              done();
            });
          }).catch(done);
        } catch (e) {
          done(e);
        }
      }, () => done('Manager not created'));
    });

    it('stepState endpoint', done => {
      kronos.manager().then(manager => {
        try {
          const te = new ReceiveEndpoint('test');
          let stateChangedRequest;

          te.receive = request => {
            stateChangedRequest = request;
            console.log(request);
          };
          manager.endpoints.stepState.connected = te;

          manager.registerStep(someStepFactory).then(f => {
            const flow = manager.createStepInstanceFromConfig({
              type: 'some-step',
              name: 'aName'
            }, manager);
            manager.registerFlow(flow).then(f => {
              f.start().then(() => {
                manager.endpoints.stepState.connected = undefined;
                assert.deepEqual(stateChangedRequest, {
                  type: 'stepStateChanged',
                  step: 'aName',
                  oldState: 'starting',
                  newState: 'running'
                });
                done();
              });
            });
          }).catch(done);

        } catch (e) {
          done(e);
        }
      }, () => done('Manager not created'));
    });

    describe('createStepInstanceFromConfig', () => {
      it('not registerd should throw', done => {
        kronos.manager().then(manager => {
          try {
            assert.throws(function () {
              manager.createStepInstanceFromConfig({
                type: 'not-already-registered'
              }, manager);
            });
            done();
          } catch (e) {
            done(e);
          }
        }, () => done('Manager not created'));
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
      kronos.manager({}, [flow]).then(myManager => {
        try {
          let flowFromEvent;
          myManager.addListener('flowRegistered', flow => flowFromEvent = flow);

          Promise.all([
            myManager.registerStep(someStepFactory)
          ]).then(() => myManager.registerFlow(myManager.createStepInstanceFromConfig(flowDecl,
            myManager))).then(
            () => {
              const aFlow = myManager.flows[flowName];
              should.exist(aFlow);
              expect(aFlow.name).to.equal(flowName);
              expect(aFlow.state).to.equal('stopped');

              assert.equal(flowFromEvent, aFlow);
              done();
            }).catch(done);
        } catch (e) {
          done(e);
        }
      }, () => done('Manager not created'));
    });

    it('can be removed again', done => {
      kronos.manager({}, [flow]).then(myManager => {
        try {
          let removedStepFromEventDone = false;

          myManager.addListener('stepStateChanged', (step, oldState, newState) => {
            if (newState === 'removed' && step.name === 'flow1') {
              removedStepFromEventDone = true;
            }
          });

          Promise.all([
            myManager.registerStep(someStepFactory)
          ]).then(() =>
            myManager.registerFlow(myManager.createStepInstanceFromConfig(flowDecl, myManager))).then(
            () => {
              myManager.unregisterFlow(flowName).then(() => {
                try {
                  assert.equal(myManager.flows.flow1, undefined);

                  // stepStateChanged may get fired late ??
                  setTimeout(() => {
                    assert.isTrue(removedStepFromEventDone);
                    done();
                  }, 10);
                } catch (e) {
                  done(e);
                }
              }, done);
            }).catch(done);
        } catch (e) {
          done(e);
        }
      }, () => done('Manager not created'));
    });

    it('deleting unknown flow rejects', done => {
      kronos.manager().then(myManager => {
        try {
          myManager.unregisterFlow('unknownFlow').then(() =>
            done(new Error('should not fullfill: deletion of an unknown flow')), reject => done());
        } catch (e) {
          done(e);
        }
      }, () => done('Manager not created'));
    });
  });
});
