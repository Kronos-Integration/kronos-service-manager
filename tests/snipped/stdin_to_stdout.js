/* global describe, it */
/* jslint node: true, esnext: true */

/*

iojs test/stdin_to_stdout.js <test/stdin_to_stdout.js

*/

"use strict";

const kronos = require('../../lib/manager.js');

const floDecls = {
	"flow1": {
		"description": "Test",
		"steps": {
			"s1": {
				"type": "kronos-copy",
				"endpoints": {
					"in": "stdin",
					"out": "step:s2/in"
				}
			},
			"s2": {
				"type": "kronos-copy",
				"endpoints": {
					"out": "step:s3/in"
				}
			},
			"s3": {
				"type": "kronos-copy",
				"endpoints": {
					"out": "step:s4/in"
				}
			},
			"s4": {
				"type": "kronos-copy",
				"endpoints": {
					"out": "stdout"
				}
			}
		}
	}
};

kronos.manager({
	flows: floDecls
}).then(function (manager) {
	manager.flowDefinitions.flow1.start().then(function (flow) {
		console.log("Started");
	}, function (error) {
		console.log(error);
	});
}, function (error) {
	console.log(error);
});
