/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

let attributes = require('../lib/attributes');

var assert = require('assert');

describe('attributes', function () {

  const atts = attributes.createAttributesFromDefinition({
    "a1": {
      "description": "the description",
      "defaultValue": 0,
      "mandatory": false
    },
    "a2": {
      "mandatory": true
    },
    "a3": {
      "type": "number"
    }
  });

  it('attribute present', function () {
    assert(atts.a1.name === "a1");
  });

  it('attribute toString is name', function () {
    assert(atts.a1.toString() === "a1");
  });

  it('default attribute type present', function () {
    assert(atts.a1.type === "string");
  });

  it('attribute type present', function () {
    assert(atts.a3.type === "number");
  });

  it('attribute defaultValue present', function () {
    assert(atts.a1.defaultValue === 0);
  });

  it('attribute description present', function () {
    assert(atts.a1.description === "the description");
  });

  it('default attribute description present', function () {
    assert(atts.a3.description === "no description given");
  });

  it('attribute mandatority', function () {
    assert(atts.a1.mandatory === false);
    assert(atts.a2.mandatory === true);
    assert(atts.a3.mandatory === true);
  });

});
