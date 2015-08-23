/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
chai.use(require("chai-as-promised"));
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const kronos = require('../lib/manager.js');
const flow = require('../lib/flow');
const scopeReporter = require("scope-reporter");

describe('flow with errors', function () {
  function makePromise(flowDecls, scopeReports) {
    return kronos.manager({
      flows: flowDecls,
      scopeReporter: scopeReporter.createReporter(undefined,function (reporter) {
        //console.log(`push ${JSON.stringify(reporter)}`);
        scopeReports.push(reporter);
      })
    });
  }

  describe('endpoint missing', function () {
    const flowDecls = {
      "flow1": {
        "description": "Test",
        "steps": {
          "s1": {
            "type": "kronos-copy"
          }
        }
      }
    };

    it('progress entries should be filled with error', function (done) {
      let scopeReports = [];
      makePromise(flowDecls, scopeReports).then(function (manager) {
        try {

          assert.lengthOf(scopeReports, 3);
          const sc = scopeReports[0];

          console.log(`SC: ${JSON.stringify(sc)}`);

          //assert.equal(sc.scope('severity').values.severity, 'error');
          //assert.equal(sc.scope('endpoint').values.endpoint, 'in');
          assert.equal(sc.scope('severty').values.message,
            'Mandatory ${endpoint} not defined');
          done();
        } catch (e) {
          done(e);
        }
      }, done);
    });


    it('error entry should have scope', function (done) {
      let scopeReports = [];

      makePromise(flowDecls, scopeReports).then(function (manager) {
        try {
          const pe = scopeReports[0];
          assert.equal(pe.scope[0].name, 'flow');
          assert.equal(pe.scope[0].properties.flow, 'flow1');
          //assert(pe.scope[1].name === 'step');
          //assert(pe.scope[1].properties.step === 's1');
          done();
        } catch (e) {
          done(e);
        }
      }, done);
    });

  });

  describe('step type', function () {
    const flowDecls = {
      "myFlow": {
        "description": "Test",
        "steps": {
          "s1": {
            "type": "copy2",
            "endpoints": {
              "in": "stdin",
              "out": "stdout"
            }
          }
        }
      }
    };

    it('progress entries should be filled with error', function (done) {
      let scopeReports = [];

      makePromise(flowDecls, scopeReports).then(function (manager) {
        try {
          assert(scopeReports.length !== 0);
          const pe = scopeReports[0];
          assert.equal(pe.severity, 'error');
          assert.equal(pe.properties.type, 'copy2');
          assert.equal(pe.message, 'Step ${type} implementation not found');
          done();
        } catch (e) {
          done(e);
        }
      }, done);
    });

    it('error entry should have scope', function (done) {
      let scopeReports = [];

      makePromise(flowDecls, scopeReports).then(function (manager) {
        try {
          const pe = scopeReports[0];
          assert.equal(pe.scope[0].name, 'flow');
          assert.equal(pe.scope[0].properties.flow, 'myFlow');
          assert.equal(pe.scope[1].name, 'step');
          assert.equal(pe.scope[1].properties.step, 's1');
          done();
        } catch (e) {
          done(e);
        }
      }, done);
    });
  });
});
