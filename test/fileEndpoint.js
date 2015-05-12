/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const fs = require('fs');
const path = require('path');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const endpointImpl = require('../lib/endpointImplementation');

describe('file endpoint implementation', function () {

  const fileImpl = endpointImpl.implementations.file;
  const fileName = path.join(__dirname, 'fixtures', 'file1.txt');

  const endpoint = endpointImpl.createEndpoint('e1', {
    target: "file:" + fileName,
    direction: 'in'
  }, fileImpl);

  it("should have an implementation", function () {
    assert(fileImpl !== undefined);
    assert(endpoint.implementation === fileImpl.implementation, "file endpoint implementation");
  });

  let g = endpoint.initialize({}, {
    name: "myStep"
  });

  it("should have a request", function () {
    let number = 0;

    for (let request in g) {
      number++;
      assert(request.info.name === fileName + "ss");
      console.log(`request: ${request}`);
    }
    assert(number === 1, "exactly one request");
  });
});
