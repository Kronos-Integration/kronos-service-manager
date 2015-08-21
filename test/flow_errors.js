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
const progressReporter = require('../lib/progressReporter');

describe('flow with errors', function () {

  function makePromise(flowDecls, progressEntries) {
    return kronos.manager({
      flows: flowDecls,
      progressReporter: progressReporter.defaultProgressReporter(function (entry) {
        progressEntries.push(entry);
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
      let progressEntries = [];
      makePromise(flowDecls, progressEntries).then(function (manager) {
        try {
          //console.log(`${JSON.stringify(progressEntries)}`);

          assert(progressEntries.length !== 0);
          const pe = progressEntries[0];
          assert.equal(pe.severity, 'error');
          assert.equal(pe.properties.endpoint, 'in');
          assert.equal(pe.message,
            'Mandatory ${endpoint} not defined');
          done();
        } catch (e) {
          done(e);
        }
      }, done);
    });


    it('error entry should have scope', function (done) {
      let progressEntries = [];

      makePromise(flowDecls, progressEntries).then(function (manager) {
        try {
          const pe = progressEntries[0];
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
      let progressEntries = [];

      makePromise(flowDecls, progressEntries).then(function (manager) {
        try {
          assert(progressEntries.length !== 0);
          const pe = progressEntries[0];
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
      let progressEntries = [];

      makePromise(flowDecls, progressEntries).then(function (manager) {
        try {
          const pe = progressEntries[0];
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
