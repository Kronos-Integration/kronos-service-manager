/* global describe, it, xit */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  {
    Service
  } = require('kronos-service');

const kronos = require('../dist/module.js');


class ServiceAbstract extends Service {
  static get name() {
    return 'abstract';
  }
  get type() {
    return 'abstract';
  }

  get autostart() {
    return true;
  }

  constructor(config, owner) {
    super(config, owner);

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
    key2: 'default value 1'
  },
  service2: {
    key2: 'default value 2',
    logLevel: 'trace'
  },
  myService: {
    fromDefault: 'default value 3',
    logLevel: 'error'
  }
};

describe('service manager', () => {
  describe('services', () => {
    it('simple registration', done => {
      kronos.manager({
        name: 's1',
        key: 33
      }).then(manager => {
        try {
          const value1 = 4711;

          assert.equal(manager.services.service1, undefined);

          manager.registerServiceFactory(ServiceAbstract).then(
            () => {
              return manager.declareService({
                name: 'service1',
                type: 'abstract',
                key1: value1
              }).then(service => {
                const service1 = manager.services.service1;
                assert.equal(service, service1);
                assert.equal(service.key1, value1);
                assert.equal(service.state, 'running');
                done();
              });
            }, done).catch(done);
        } catch (e) {
          done(e);
        }
      }, () => done('Manager not created'));
    });

    it('derived registration', done => {
      kronos.manager().then(manager => {
        try {
          manager.registerServiceFactory(ServiceAbstract).then(() => {
            const abstract = manager.serviceFactories.abstract;

            assert.equal(abstract, ServiceAbstract);
            assert.equal(abstract.name, 'abstract');

            manager.declareService({
              name: 'derived',
              type: 'abstract',
              key1: 'derivedValue'
            }).then(service => {
              const derived = manager.services.derived;
              assert.equal(service, derived);
              assert.equal(service.name, 'derived');
              assert.equal(service.key1, 'derivedValue');
              assert.equal(service.state, 'running');
              done();
            }).catch(done);
          }, done).catch(done);
        } catch (e) {
          done(e);
        }
      }, () => done('Manager not created'));
    });

    it('simple declaration', done => {
      kronos.manager(servicesDefaults).then(manager => {
        try {
          manager.registerServiceFactory(ServiceAbstract).then(() => {
            const myService = manager.declareService({
              name: 'myService',
              type: 'abstract',
              port: 4711
            }).then(service => {
              assert.equal(service, manager.services.myService);
              assert.equal(service.name, 'myService');
              assert.equal(service.port, 4711);
              assert.equal(service.logLevel, 'info');
              done();
            }).catch(done);
          }, done).catch(done);
        } catch (e) {
          done(e);
        }
      }, () => done('Manager not created'));
    });
  });
});
