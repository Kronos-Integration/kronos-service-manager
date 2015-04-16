/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const flow = require('../lib/flow');

const assert = require('assert');

describe('flow declaration', function () {
  const flows = flow.create({
    "myFlow": {
      "steps": {
        "s1": {
          "type": "copy",
          "endpoints": {
            "in": "stdin",
            "out": "step:s2/in"
          }
        },
        "s2": {
          "type": "copy",
          "endpoints": {
            "out": "stdout"
          }
        }
      }
    }
  });

  const myFlow = flows.myFlow;

  it('can be initialized', function () {
    myFlow.initialize();
    assert(myFlow);
  });
});


describe('flow declaration', function () {
  const flows = flow.create({
    "myFlow": {
      "steps": {
        "s1": {
          "type": "copy",
          "config": {
            "port": 77
          },
          "endpoints": {
            "in": "stdin",
            "out": "step:s2/in"
          }
        },
        "s2": {
          "type": "group",
          "endpoints": {
            "in": "steps:s2/s1/in"
          },
          "steps": {
            "s1": {
              "type": "copy"
            },
            "s2": {
              "type": "copy",
              "endpoints": {
                "out": "file:/tmp/sample1.txt"
              }
            }
          }
        }
      }
    }
  });

  const myFlow = flows.myFlow;

  it('flow name should be present', function () {
    assert(myFlow.name === "myFlow");
  });

  it('steps should be present', function () {
    assert(myFlow.steps.s1.name === "s1");
  });

  it('steps should have a mata object', function () {
    assert(myFlow.steps.s1.meta.name === "copy");
  });

  it('steps config should be present', function () {
    assert(myFlow.steps.s1.config.port === 77);
  });

  it('endpoints should be present', function () {
    assert(myFlow.steps.s1.endpoints.out.name === "out");
  });

  it('substeps are present', function () {
    assert(myFlow.steps.s2.steps.s1.name === "s1");
  });

});
