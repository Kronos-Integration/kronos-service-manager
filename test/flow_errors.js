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
      scopeReporter: scopeReporter.createReporter(undefined, function (reporter) {
        //console.log(`push ${JSON.stringify(reporter.toJSON())}`);
        scopeReports.push(reporter.toJSON());
      })
    }).then(function (manager) {
      require('kronos-service-manager-addon').registerWithManager(manager);
      return manager.registerFlows(flowDecls);
    });
  }

  describe('Mandatory endpoint not defined', function () {
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

    it('scopeReports filled', function (done) {
      let scopeReports = [];
      makePromise(flowDecls, scopeReports).then(function (manager) {
        try {
          assert.lengthOf(scopeReports, 3);
          assert.deepEqual(scopeReports[0], {
            "scopes": [{
              "name": "flow",
              "properties": {
                "name": "flow1"
              }
            }, {
              "name": "step",
              "properties": {
                "name": "s1"
              }
            }, {
              "name": "endpoint",
              "properties": {
                "name": "in"
              }
            }, {
              "name": "severity",
              "properties": {
                "severity": "error",
                "message": "Mandatory endpoint not defined"
              }
            }]
          });
          //console.log(`SC: ${JSON.stringify(scopeReports)}`);

          done();
        } catch (e) {
          done(e);
        }
      }, done);
    });
  });

  describe('Step implementation not found', function () {
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

    it('scopeReports filled', function (done) {
      let scopeReports = [];

      makePromise(flowDecls, scopeReports).then(function (manager) {
        try {
          assert.lengthOf(scopeReports, 1);
          //console.log(`SC: ${JSON.stringify(scopeReports)}`);
          assert.deepEqual(scopeReports[0], {
            "scopes": [{
              "name": "flow",
              "properties": {
                "name": "myFlow"
              }
            }, {
              "name": "step",
              "properties": {
                "name": "s1"
              }
            }, {
              "name": "step-type",
              "properties": {
                "name": "copy2"
              }
            }, {
              "name": "severity",
              "properties": {
                "severity": "error",
                "message": "Step implementation not found"
              }
            }]
          });
          done();
        } catch (e) {
          done(e);
        }
      }, function (e) {
        done(e);
      });
    });
  });
});
