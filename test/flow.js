/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

let flow = require('../lib/flow');
let progressReporter = require('../lib/progressReporter');

/*
let stepImpl = require('../lib/stepImplementation');
let endpointImpl = require('../lib/endpointImplementation');
*/

var assert = require('assert');

describe('flow declaration', function () {
	let myFlow = flow.create({
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
					"in": "step:s1/out",
					"out": "stdout"
				}
			}
		}
	});

	it('can be initialized', function () {
		myFlow.initialize();
		assert(myFlow);
	});

});

describe('flow declaration', function () {
	let myFlow = flow.create({
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
					"in": "step:s1/out",
					"out": "file:/tmp/sample1.txt"
				}
			}
		}
	});

	it('flow name should be present', function () {
		assert(myFlow.name === "myFlow");
	});

	it('steps should be present', function () {
		assert(myFlow.steps.s1.name === "s1");
	});

	it('steps should have a implementation', function () {
		assert(myFlow.steps.s1.implementation.name === "copy");
	});

	it('steps config should be present', function () {
		assert(myFlow.steps.s1.config.port === 77);
	});

	it('endpoints should be present', function () {
		assert(myFlow.steps.s1.endpoints.out.name === "out");
	});

});
