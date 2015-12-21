/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

chai.use(require('chai-as-promised'));

const kronos = require('../lib/manager.js');

describe('service manager', function () {
  describe('services', function () {
    it('simple definition', function (done) {
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
    it('derived definition', function (done) {
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
});
