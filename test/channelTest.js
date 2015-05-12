/* global describe, it, beforeEach */
/* jslint node: true, esnext: true */

"use strict";

const channel = require('../lib/channel');
const endpointImpls = require('../lib/endpointImplementation');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

describe('channel creation', function () {
  let es;
  let chl;

  beforeEach(function () {
    es = {
      "input": endpointImpls.createEndpoint("input", {}),
      "output": endpointImpls.createEndpoint("output", {})
    };

    chl = channel.create({
      name: "a"
    }, es.input, {
      name: "b"
    }, es.output);
  });

  it('endpoints created', function () {
    assert(chl.endpointA);
    assert(chl.endpointB);
  });

  it('has a name', function () {
    assert(chl.name === 'a/input->b/output');
  });

  it('requests passing through channel', function () {


    const output = chl.endpointA.implementation();
    output.next();

    //  const output = chl.endpointA.initialize();

    output.next({
      info: {
        name: "send from output #1"
      },
      stream: "a stream 1"
    });

    output.next({
      info: {
        name: "send from output #2"
      },
      stream: "a stream 2"
    });

    const input = chl.endpointB.implementation();

    let value = input.next();
    let request = value.value;
    //console.log(`got: ${JSON.stringify(request)}`);

    assert(request.info.name === "send from output #1", "info attributes present");
    assert(request.stream === "a stream 1", "stream present");

    value = input.next();
    request = value.value;
    //console.log(`got: ${JSON.stringify(request)}`);

    assert(request.info.name === "send from output #2", "info attributes present");
    assert(request.stream === "a stream 2", "stream present");
  });

});
