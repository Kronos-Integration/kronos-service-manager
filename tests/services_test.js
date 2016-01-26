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

  get autostart() {
    return true;
  }

  constructor(config) {
    super(config);

    Object.defineProperty(this, 'key1', {
      value: config.key1
    });

    Object.defineProperty(this, 'port', {
      value: config.port
    });

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
          const myService = manager.declareService('service1', 'abstract', {
            key1: value1
          });

          assert.equal(manager.services.service1.key1, value1);
          assert.equal(manager.services.service1.state, 'starting');
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

          manager.declareService('derived', 'abstract', {
            key1: 'derivedValue'
          });

          const derived = manager.services.derived;
          assert.equal(derived.name, 'derived');
          assert.equal(derived.key1, 'derivedValue');
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
          manager.registerService(ServiceAbstract);

          const myService = manager.declareService('myService', 'abstract', {
            "port": 4711
          });

          assert.equal(myService.name, 'myService');
          assert.equal(myService.port, 4711);
          assert.equal(myService.logLevel, "info");
          done();
        } catch (e) {
          done(e);
        }
      }, () => done("Manager not created"));
    });
  });
});
