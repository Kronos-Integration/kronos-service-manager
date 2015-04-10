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
    }
  });

  it('attribute present', function () {
    assert(atts.a1.name === "a1");
  });

  it('attribute type present', function () {
    assert(atts.a1.type === "string");
  });

  it('attribute defaultValue present', function () {
    assert(atts.a1.defaultValue === 0);
  });

  it('attribute description present', function () {
    assert(atts.a1.description === "the description");
  });

  it('attribute mandatority', function () {
    assert(atts.a1.mandatory === false);
    assert(atts.a2.mandatory === true);
  });

});
