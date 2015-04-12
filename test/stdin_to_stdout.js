/* global describe, it*/
/* jslint node: true, esnext: true */

/*

iojs test/stdin_to_stdout.js <test/stdin_to_stdout.js

*/

"use strict";

const flow = require('../lib/flow');

const myFlow = flow.create({
	"name": "myFlow",
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
});

myFlow.initialize();
