/* jslint node: true, esnext: true */

"use strict";

let flow = require('../lib/flow');
var assert = require('assert');

describe('service declaration', function () {
	let myFlow = flow.create({
		getStep: function () {},
		stepImplementation: function (name) {
			return {
				name: name,
				definition: {
					endpoints: { in : {}, out: {}
					},
				}
			};
		},
		endpointImplementation: function (name) {
			return function* () {
				yield 77;
			};
		}
	}, {
		"name": "myFlow",
		"steps": {
			"s1": {
				"type": "copy",
				"config": {
					"port": 77
				},
				"endpoints": {
					"in": "stdin",
					"out": "step:s2/in"
				}
			},
			"s2": {
				"type": "copy",
				"endpoints": {
					"out": "step:s3/in"
				}
			},
			"s3": {
				"type": "copy"
			}
		}
	});

	it('flow name shoud be present', function () {
		assert(myFlow.name === "myFlow");
	});

	it('steps shoud be present', function () {
		assert(myFlow.steps.s1.name === "s1");
	});

	it('steps shoud have a implementation', function () {
		assert(myFlow.steps.s1.implementation.name === "copy");
	});

	it('steps config shoud be present', function () {
		assert(myFlow.steps.s1.config.port === 77);
	});

	it('endpoints shoud be present', function () {
		assert(myFlow.steps.s1.endpoints.out.name === "out");
	});

	it('endpoints counterparts shoud be linked', function () {
		assert(myFlow.steps.s1.endpoints.out.counterpart !== undefined);
		assert(myFlow.steps.s1.endpoints.out.counterpart === myFlow.steps.s2
			.endpoints.in);

		console.log("myFlow.steps.s2.endpoints.in.counterpart : " + myFlow.steps
			.s2.endpoints.in.counterpart);
		console.log("myFlow.steps.s2.endpoints.in.value : " + myFlow.steps
			.s2.endpoints.in.value);
		assert(myFlow.steps.s2.endpoints.in.counterpart === myFlow.steps.s1
			.endpoints.out);
	});

});

// service.shutdown();
