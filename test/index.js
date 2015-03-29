/* jslint node: true, esnext: true */

"use strict";

let manager = require('../index.js').manager;
var assert = require('assert');

describe('service declaration', function () {
	let myManager = manager();
	myManager.declareServices({
		"service1": {
			"module": "dummy",
			"config": {
				"key1": "value1"
			},
			"endpoints": {
				"in1": "stdin",
				"out1": function (info, stream, cb) {}
			}
		}
	});
	it('service should be present', function () {
		let service = myManager.getService('service1');
		assert(service.id === "service1");
	});

	it('service config should be present', function () {
		let config = myManager.getServiceConfiguration('service1');
		assert(config.key1 === "value1");
	});

	it('service endpoint should be present', function () {
		let out1 = myManager.getServiceEndpoint('service1', 'out1');
		assert(out1);
	});

});



// service.shutdown();
