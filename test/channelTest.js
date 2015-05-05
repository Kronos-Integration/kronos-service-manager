/* global describe, it, beforeEach */
/* jslint node: true, esnext: true */

"use strict";

const channel = require('../lib/channel');
const endpointImpls = require('../lib/endpointImplementation');
const assert = require('assert');

describe('channel creation', function () {
  let es;
  let chl;

  beforeEach(function () {
    es = {
      "input": endpointImpls.createEndpoint("input", endpointImpls.defaultEndpoint),
      "output": endpointImpls.createEndpoint("output", endpointImpls.defaultEndpoint)
    };

    chl = channel.create(es.input, es.output);
  });

  it('endpoints created', function () {
    assert(chl.endpointA);
    assert(chl.endpointB);
  });

  it('has a name', function () {
    assert(chl.name === 'input-output');
  });

  it('requests passing through channel', function () {
    const output = chl.endpointA.implementation();

    output.next();

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

    assert(request.info.name === "send from output #1");
    assert(request.stream === "a stream 1");

    value = input.next();
    request = value.value;
    //console.log(`got: ${JSON.stringify(request)}`);

    assert(request.info.name === "send from output #2");
    assert(request.stream === "a stream 2");
  });

});
