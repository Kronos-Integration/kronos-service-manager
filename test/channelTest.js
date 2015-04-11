/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const channel = require('../lib/channel');
const endpointImpls = require('../lib/endpointImplementation');
const assert = require('assert');

describe('channel creation', function () {
  const es = endpointImpls.createEndpointsFromDefinition({
    "input": {
      /*	"implementation": function () {
					return function* () {
						do {
							yield {
								info: {
									name: "input"
								},
								stream: "a stream"
							};
							console.log(`input delivered`);
						}
						while (true);
					};
				}*/
    },
    "output": {
      /*	"implementation": function () {
					return function* () {
						do {
							const request =
								yield;
							console.log(`output got: ${JSON.stringify(request)}`);
						}
						while (true);
					};
				}*/
    }
  });

  const ecs = channel.create(es.input, es.output);

  it('endpoints created', function () {
    assert(ecs.length === 2);
  });


  it('request passes through channel', function () {
    const output = ecs[0].implementation();

    output.next();

    output.next({
      info: {
        name: "send from output #1"
      },
      stream: "a stream 1"
    });

    /*
        output.next({
          info: {
            name: "send from output #2"
          },
          stream: "a stream 2"
        });
    */

    const input = ecs[1].implementation();

    const value = input.next();
    const request = value.value;
    console.log(`got: ${JSON.stringify(request)}`);

    assert(request.info.name === "send from output #1");
  });

});
