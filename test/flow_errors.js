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

describe('flow declaration with errors', function () {

  function makePromise(flowDecls, progressEntries) {
    return kronos.manager({
      flows: flowDecls,
      progressReporter: progressReporter.defaultProgressReporter(function (entry) {
        progressEntries.push(entry);
      })
    });
  }

  describe('endpoint missing error handling', function () {
    const flowDecls = {
      "flow1": {
        "description": "Test",
        "steps": {
          "s1": {
            "type": "copy"
          }
        }
      }
    };

    it('progress entries should be filled with error', function (done) {
      let progressEntries = [];
      makePromise(flowDecls, progressEntries).then(function (manager) {
        //console.log(`${JSON.stringify(progressEntries)}`);

        assert(progressEntries.length !== 0);
        const pe = progressEntries[0];
        assert(pe.severity === 'error');
        assert(pe.properties.endpoint === 'in');
        assert(pe.message === 'Mandatory ${endpoint} not defined');
        done();
      });
    });


    it('error entry should have scope', function (done) {
      let progressEntries = [];

      makePromise(flowDecls, progressEntries).then(function (manager) {
        const pe = progressEntries[0];
        assert(pe.scope[0].name === 'flow');
        assert(pe.scope[0].properties.flow === 'flow1');
        //assert(pe.scope[1].name === 'step');
        //assert(pe.scope[1].properties.step === 's1');
        done();
      });
    });

  });

  describe('step type error handling', function () {
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
        assert(progressEntries.length !== 0);
        const pe = progressEntries[0];
        assert(pe.severity === 'error');
        assert(pe.properties.type === 'copy2');
        assert(pe.message === 'Step ${type} implementation not found');
        done();
      });
    });

    it('error entry should have scope', function (done) {
      let progressEntries = [];

      makePromise(flowDecls, progressEntries).then(function (manager) {
        const pe = progressEntries[0];
        assert(pe.scope[0].name === 'flow');
        assert(pe.scope[0].properties.flow === 'myFlow');
        assert(pe.scope[1].name === 'step');
        assert(pe.scope[1].properties.step === 's1');
        done();
      });
    });
  });
});
