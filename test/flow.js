/* jslint node: true, esnext: true */

"use strict";

let flow = require('../lib/flow');
let progressReporter = require('../lib/progressReporter');

/*
let stepImpl = require('../lib/stepImplementation');
let endpointImpl = require('../lib/endpointImplementation');
*/

var assert = require('assert');

describe('flow declaration error handling', function () {

  let progressEntries = [];

  let myFlow = flow.create({
    "name": "myFlow",
    "steps": {
      "s1": {
        "type": "copy2",
        "endpoints": {
          "in": "stdin",
          "out": "stdout"
        }
      }
    }
  }, progressReporter.defaultProgressReporter(function (entry) {
    progressEntries.push(entry);
  }));

  it('progress entries should be filled with error', function () {
    assert(progressEntries.length !== 0);
    const pe = progressEntries[0];
    assert(pe.severity === 'error');
  });

  it('error entry should have scope', function () {
    const pe = progressEntries[0];
    assert(pe.scope[0].name === 'flow');
    assert(pe.scope[0].properties.flow === 'myFlow');
    assert(pe.scope[1].name === 'step');
    assert(pe.scope[1].properties.step === 's1');
  });
});

describe('flow declaration', function () {
  let myFlow = flow.create({
    "name": "myFlow",
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
        "type": "copy",
        "endpoints": {
          "in": "step:s1/out",
          "out": "file:/tmp/sample1.txt"
        }
      }
    }
  });

  it('flow name shoud be present', function () {
    assert(myFlow.name === "myFlow");
  });

  it('steps shoud be present', function () {
    assert(myFlow.steps.s1.name === "s1");
  });

  it('steps shoud have a implementation', function () {
    assert(myFlow.steps.s1.implementation.name === "copy");
  });

  it('steps config shoud be present', function () {
    assert(myFlow.steps.s1.config.port === 77);
  });

  it('endpoints shoud be present', function () {
    assert(myFlow.steps.s1.endpoints.out.name === "out");
  });

  it('endpoints counterparts shoud be linked', function () {
    assert(myFlow.steps.s1.endpoints.out.counterpart.name === 'in');
    assert(myFlow.steps.s2.endpoints.in.counterpart.name === 'out');

    /*	assert(myFlow.steps.s1.endpoints.out.counterpart === myFlow.steps.s2
			.endpoints.in);
    console.log("myFlow.steps.s2.endpoints.in.counterpart : " + myFlow.steps
      .s2.endpoints.in.counterpart);
    console.log("myFlow.steps.s2.endpoints.in.value : " + myFlow.steps
      .s2.endpoints.in.value);
    assert(myFlow.steps.s2.endpoints.in.counterpart === myFlow.steps.s1
      .endpoints.out);
			*/
  });

  it('can be initialized', function () {
    myFlow.initialize();
    assert(myFlow);
  });

});
