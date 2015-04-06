/* jslint node: true, esnext: true */

"use strict";

let flow = require('../lib/flow');

/*
let stepImpl = require('../lib/stepImplementation');
let endpointImpl = require('../lib/endpointImplementation');
*/

var assert = require('assert');

describe('service declaration', function () {
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

});
