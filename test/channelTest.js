/* global describe, it, beforeEach */
/* jslint node: true, esnext: true */

"use strict";

const channel = require('../lib/channel');
const endpointImpls = require('../lib/endpointImplementation');
const assert = require('assert');

describe('channel creation', function () {
  let es;
  let ecs;

  beforeEach(function () {
    es = endpointImpls.createEndpointsFromDefinition({
      "input": {},
      "output": {}
    });

    ecs = channel.create(es.input, es.output);
  });

  it('endpoints created', function () {
    assert(ecs.length === 2);
  });

  it('requests passing through channel', function () {
    const output = ecs[0].implementation();

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

    const input = ecs[1].implementation();

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
