/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  service = require('kronos-service');

const kronos = require('../lib/manager.js');


class ServiceAbstract extends service.Service {
  static get name() {
    return "abstract";
  }
  get type() {
    return "abstract";
  }
}

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

describe('service manager', () => {
  describe('services', () => {
    it('simple registration', done => {
      kronos.manager().then(manager => {
        try {
          const value1 = 4711;

          assert.equal(manager.services.service1, undefined);

          manager.registerService(ServiceAbstract);
          manager.declareService('service1', 'abstract', {
            key1: value1
          });

          assert.equal(manager.services.service1.key1, value1);
          assert.equal(manager.services.service1.state, 'stopped');
          done();
        } catch (e) {
          done(e);
        }
      }, () => done("Manager not created"));
    });

    it('derived registration', done => {
      kronos.manager().then(manager => {
        try {
          manager.registerService(ServiceAbstract);

          const abstract = manager.services.abstract;

          assert.equal(abstract, ServiceAbstract);

          assert.equal(abstract.name, 'abstract');
          assert.equal(abstract.abstractKey, 'abstractValue');

          manager.declareService('derived', 'abstract', {
            derivedKey: 'derivedValue'
          });

          const derived = manager.serviceGet('derived');
          assert.equal(derived.name, 'derived');
          assert.equal(derived.abstractKey, 'abstractValue');

          assert.equal(derived.derivedKey, 'derivedValue');
          assert.equal(derived.state, 'starting');

          done();
        } catch (e) {
          done(e);
        }
      }, () => done("Manager not created"));
    });

    it('simple declaration', done => {
      kronos.manager(servicesDefaults).then(manager => {
        try {
          const abstract = manager.registerService(ServiceAbstract);

          const myService = manager.declareService('abstract', {
            "name": "myService",
            "port": 4711,
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
      }, () => done("Manager not created"));
    });

    it('default values', done => {
      kronos.manager({
        services: servicesDefaults
      }).then(manager => {
        try {
          const service1 = manager.registerService('service1');
          assert.equal(service1.key2, 'default value 1');

          const service2 = manager.registerService('service2', {
            key1: "special value"
          });

          assert.equal(service2.key1, 'special value');
          assert.equal(service2.key2, 'default value 2');
          assert.equal(service2.logLevel, 'trace');

          done();
        } catch (e) {
          done(e);
        }
      }, () => done("Manager not created"));
    });
  });
});
