/* jslint node: true, esnext: true */

"use strict";

let stepImplementation = require('../lib/stepImplementation');

var assert = require('assert');

describe('step implementation', function () {

  it('buildin copy step present', function () {
    const si = stepImplementation.stepImplementations.copy;
    assert(si.name === "copy");
    assert(si.endpoints.in.name === "in");
  });

});
