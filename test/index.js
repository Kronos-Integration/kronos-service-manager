/* jslint node: true, esnext: true */

"use strict";

let manager = require('../index.js').manager;
var assert = require('assert');

describe('service declaration', function () {
	let myManager = manager();
	myManager.declareServices({
		'service1': {
			'config': {
				"key1": "value1"
			},
			'endpoints': {
				'in1': 'stdin',
				'out1': function (info, stream, cb) {}
			}
		}
	});
	it('declared services should be present', function () {
		let cfg = myManager.getServiceConfiguration('service1');
		assert(cfg.key1 === "value1");
	});
});



// service.shutdown();
