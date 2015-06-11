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
    target: url,
    direction: 'in'
  }, endpointImpl.implementations.http);

  const flowStream = fs.createReadStream(path.join(__dirname,'fixtures','sample.flow'),{ encoding: 'utf8' });

  setTimeout(function() {
    request.post({
        url: url,
        formData: {
          content: flowStream,
        }
      },
      function optionalCallback(err, httpResponse, body) {
      //console.log(`http post done: ${body}`);
      });
    },10);

  it("should produce a request", function (done) {

    let in1 = endpoint.initialize(function *() {
      const r = yield;
//      console.log(`request: ${JSON.stringify(r.info)}`);
      assert(r.info.host === 'localhost:12345');
      done();
      });
/*
    let gen = in1.next();
    let request = gen.value;
    assert(request.info.name === 'stdin');
    assert(request.stream !== undefined);
    */
  });
});
