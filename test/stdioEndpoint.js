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

describe('stdin endpoint', function () {
  const endpoint = endpointImpl.createEndpoint('e1', {
    target: "stdin"
  }, endpointImpl.implementations.stdin);

  let in1 = endpoint.initialize({}, {
    name: "myStep"
  });

  it("should produce a request", function () {
    let gen = in1.next();
    let request = gen.value;
    assert(request.info.name === 'stdin');
    assert(request.stream !== undefined);
  });
});

describe('stdout endpoint', function () {
  const endpoint = endpointImpl.createEndpoint('e1', {
    target: "stdout"
  }, endpointImpl.implementations.stdout);

  let out = endpoint.initialize({}, {
    name: "myStep"
  });

  it("should consume a request", function () {
    const fileName = path.join(__dirname, 'fixtures', 'file1.txt');

    out.next({
      info: {
        name: "aName"
      },
      stream: fs.createReadStream(fileName)
    });
  });
});
