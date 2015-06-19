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

const manager = {};

describe('http endpoint', function () {
  const url = "http://localhost:12346/";

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
    },200);

  it("should produce a request", function (done) {
    let in1 = endpoint.initialize(manager,function *() {
      const r = yield;
      console.log(`request: ${JSON.stringify(r.info)}`);
      assert(r.info.host === 'localhost:12346');
      done();
      });
  });
});
