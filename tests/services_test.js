/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

chai.use(require('chai-as-promised'));

const kronos = require('../lib/manager.js');


const servicesDefaults = {
  service1: {
    key2: "default value 1"
  },
  service2: {
    key2: "default value 2",
    logLevel: "trace"
  },
  myService: {
    fromDefault: "default value 3",
    logLevel: "error"
  }
};

describe('service manager', function () {
  describe('services', function () {
    it('simple registration', function (done) {
      kronos.manager().then(function (manager) {
          try {
            const value1 = 4711;

            assert.equal(manager.serviceGet('service1'), undefined);
            assert.equal(manager.serviceGet('service1', serviceName => {
              return {
                key1: value1
              };
            }).key1, value1);
            assert.equal(manager.serviceGet('service1').key1, value1);
            assert.equal(manager.serviceGet('service1').state, 'stopped');
            done();
          } catch (e) {
            done(e);
          }
        },
        function () {
          done("Manager not created");
        });
    });

    it('derived registration', function (done) {
      kronos.manager().then(function (manager) {
          try {
            const returnedService = manager.serviceRegister('abstract', {
              _start() {
                  return Promise.resolve(this);
                },
                abstractKey: 'abstractValue'
            });

            const abstract = manager.serviceGet('abstract');
            assert.equal(abstract, returnedService);

            assert.equal(abstract.name, 'abstract');
            assert.equal(abstract.abstractKey, 'abstractValue');

            manager.serviceRegister('derived', {
              name: 'abstract',
              derivedKey: 'derivedValue'
            });

            const derived = manager.serviceGet('derived');
            assert.equal(derived.name, 'derived');
            assert.equal(derived.abstractKey, 'abstractValue');

            assert.equal(derived.derivedKey, 'derivedValue');

            done();
          } catch (e) {
            done(e);
          }
        },
        function () {
          done("Manager not created");
        });
    });
  });

  it('simple declaration', function (done) {
    kronos.manager({
      services: servicesDefaults
    }).then(function (manager) {
        try {
          const abstract = manager.serviceRegister('abstract', {
            _start() {
                return Promise.resolve(this);
              },
              abstractKey: 'abstractValue'
          });

          const myService = manager.serviceDeclare('abstract', {
            "name": "myService",
            "port": 4711,
            //logLevel: "trace"
          });

          assert.equal(myService.abstractKey, 'abstractValue');
          assert.equal(myService.name, 'myService');
          assert.equal(myService.port, 4711);
          assert.equal(myService.logLevel, "error");
          assert.equal(myService.fromDefault, "default value 3");
          done();
        } catch (e) {
          done(e);
        }
      },
      function () {
        done("Manager not created");
      });
  });

  it('default values', function (done) {
    kronos.manager({
      services: servicesDefaults
    }).then(function (manager) {
        try {
          const service1 = manager.serviceRegister('service1');
          assert.equal(service1.key2, 'default value 1');

          const service2 = manager.serviceRegister('service2', {
            key1: "special value"
          });

          assert.equal(service2.key1, 'special value');
          assert.equal(service2.key2, 'default value 2');
          assert.equal(service2.logLevel, 'trace');

          done();
        } catch (e) {
          done(e);
        }
      },
      function () {
        done("Manager not created");
      });
  });

});
