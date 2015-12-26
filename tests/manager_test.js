/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

chai.use(require('chai-as-promised'));

const uti = require('uti'),
  flow = require('kronos-flow'),
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

describe('service manager', function () {
  describe('std attributes', function () {
    it('should have a name', function (done) {
      kronos.manager({
        name: 'myName',
        logLevel: 'trace'
      }).then(function (manager) {
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
      }, function () {
        done("Manager not created");
      });
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
      }, function () {
        done("Manager not created");
      });
    });
  });

  describe('shutdown', function () {
    it('empty', function (done) {
      kronos.manager().then(function (manager) {
        try {
          manager.shutdown().then(
            function (manager) {
              done();
            }, done
          );
        } catch (e) {
          done(e);
        }
      }, function () {
        done("Manager not created");
      });
    });

    it('with flows', function (done) {
      kronos.manager().then(function (manager) {
        try {
          manager.registerStep(someStepFactory);
          flow.registerWithManager(manager);
          const aFlow = manager.getStepInstance(flowDecl);
          manager.registerFlow(aFlow);
          aFlow.start().then(function () {
            manager.shutdown().then(
              function (manager) {
                done();
              }, done
            );
          });
        } catch (e) {
          done(e);
        }
      }, function () {
        done("Manager not created");
      });
    });

  });

  describe('step registration', function () {
    it('registers steps present', function (done) {
      kronos.manager().then(function (manager) {
        try {
          let stepFromEvent;
          manager.addListener('stepRegistered', step => stepFromEvent = step);

          manager.registerStep(someStepFactory);
          const myStep = manager.steps['some-step'];
          expect(myStep.name, 'step name').to.equal('some-step');
          assert.equal(stepFromEvent, myStep);

          // do not fire a 2nd. time stepRegistered
          stepFromEvent = undefined;
          manager.registerStep(someStepFactory);
          assert.equal(stepFromEvent, undefined);

          done();
        } catch (e) {
          done(e);
        }
      }, function () {
        done("Manager not created");
      });
    });

    describe('getStepInstance', function () {
      it('not registerd should throw', function (done) {
        kronos.manager().then(function (manager) {
          try {
            assert.throws(function () {
              manager.getStepInstance({
                type: "not-already-registered"
              })
            });
            done();
          } catch (e) {
            done(e);
          }
        }, function () {
          done("Manager not created");
        });
      });
    });
  });

  describe('flows', function () {
    const flowName = 'flow1';

    it('registered should be present', function (done) {
      kronos.manager().then(function (myManager) {
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
      }, function () {
        done("Manager not created");
      });
    });

    it('can be removed again', function (done) {
      kronos.manager().then(function (myManager) {
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

          myManager.deleteFlow(flowName).then(function () {
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
      }, function () {
        done("Manager not created");
      });
    });

    it('deleting unknown flow rejects', function (done) {
      kronos.manager().then(function (myManager) {
        try {
          myManager.deleteFlow("unknownFlow").then(function () {
            done(new Error("shouldn fullfill: deletion of an unknown flow"));
          }, function (reject) {
            done();
          });
        } catch (e) {
          done(e);
        }
      }, function () {
        done("Manager not created");
      });
    });
  });
});
