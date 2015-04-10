/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const channel = require('../lib/channel');
const endpointImpls = require('../lib/endpointImplementation');
const assert = require('assert');

describe('channel creation', function () {
	const es = endpointImpls.createEndpointsFromDefinition({
		"input": {
			"implementation": function () {
				return function* () {
					do {
						const request =
							yield {
								info: {
									name: "input"
								},
								stream: "a stream"
							};
					}
					while (true);
				};
			}
		},
		"output": {
			"implementation": function () {
				return function* () {
					do {
						const request =
							yield;
						console.log(`output got: ${JSON.stringify(request)}`);
					}
					while (true);
				};
			}
		}
	});

	const ecs = channel.create(es.output, es.input);

	it('endpoints created', function () {
		assert(ecs.length === 2);
	});


	it('input connected', function () {

		const input = ecs[0].implementation();

		const request = input.next();
		console.log(`got: ${JSON.stringify(request)}`);

		assert(request);
	});

});
