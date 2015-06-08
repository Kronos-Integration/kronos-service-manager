/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const fs = require('fs');
const path = require('path');
const request = require('request');

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const endpointImpl = require('../lib/endpointImplementation');

describe('http endpoint', function () {
  const url = "http://localhost:12345/";

  const endpoint = endpointImpl.createEndpoint('e1', {
    target: url
  }, endpointImpl.implementations.stdin);

  let in1 = endpoint.initialize();

  const flowStream = fs.createReadStream(path.join(__dirname,'fixtures','sample.flow'),{ encoding: 'utf8' });

  request.post({
      url: url,
      formData: {
        content: flowStream,
      }
    },
    function optionalCallback(err, httpResponse, body) {
      console.log(`http post done: ${err}`);
    });

  it("should produce a request", function () {
    let gen = in1.next();
    let request = gen.value;
    assert(request.info.name === 'stdin');
    assert(request.stream !== undefined);
  });
});
