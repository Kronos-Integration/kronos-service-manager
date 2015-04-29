/* global describe, it*/
/* jslint node: true, esnext: true */

/*

iojs test/stdin_to_stdout.js <test/stdin_to_stdout.js

*/

"use strict";

const kronos = require('../lib/manager.js');

const floDecls = {
	"flow1": {
		"steps": {
			"s1": {
				"type": "copy",
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
				"type": "copy",
				"endpoints": {
					"out": "step:s4/in"
				}
			},
			"s4": {
				"type": "copy",
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
	manager.intializeFlow('flow1');
	//const flow = manager.flowDefinitions.flow1.initialize(manager);
});
