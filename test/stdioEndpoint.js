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


describe('stdout endpoint', function () {
  const endpoint = endpointImpl.createEndpoint('e1', {
    target: "stdout",
    direction: 'out'
  }, endpointImpl.implementations.stdout);

  let out = endpoint.initialize({}, {
    name: "myStep"
  })();

  it("should consume a request", function (done) {
    const fileName = path.join(__dirname, 'fixtures', 'file1.txt');

    out.next({
      info: {
        name: "aName"
      },
      stream: fs.createReadStream(fileName)
    });
  });
});
