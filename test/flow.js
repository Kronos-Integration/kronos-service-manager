/* global describe, it, xit*/
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
chai.use(require("chai-as-promised"));
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const kronos = require('../lib/manager.js');

function makePromise(flowDecls) {
  return kronos.manager({
    validateSchema: false,
    flows: flowDecls
  });
}

describe('declaration', function () {
  describe('plain', function () {
    const flowDecls = {
      "flow1": {
        "description": "the flow description",
        "steps": {
          "s1": {
            "type": "kronos-copy",
            "endpoints": {
              "in": "stdin",
              "out": {
                "connect": {
                  "target": "step:s2/in"
                },
                "contentInfoProcessing": {
                  "fileName": "${name}"
                }
              },
              "log": "stderr"
            }
          },
          "s2": {
            "type": "kronos-copy",
            "endpoints": {
              "out": "file:/tmp/somefile",
              "log": "stderr"
            }
          }
        }
      }
    };

    it('can be initialized', function (done) {
      makePromise(flowDecls).then(function (manager) {
        try {
          const flow1 = manager.flowDefinitions.flow1;
          flow1.initialize();
          assert(flow1, "flow object missing");
          done();
        } catch (e) {
          done(e);
        }
      }, done);
    });

    it('common attributes', function (done) {
      makePromise(flowDecls).then(function (manager) {
        try {
          const flow1 = manager.flowDefinitions.flow1;
          assert(flow1.description === 'the flow description');
          done();
        } catch (e) {
          done(e);
        }
      }, done);
    });

    it('contentInfoProcessing', function (done) {
      makePromise(flowDecls).then(function (manager) {
        try {
          const flow1 = manager.flowDefinitions.flow1;
          assert(flow1.steps.s1.endpoints.out.contentInfoProcessing.fileName === '${name}');
          done();
        } catch (e) {
          done(e);
        }
      }, done);
    });
  });
});
