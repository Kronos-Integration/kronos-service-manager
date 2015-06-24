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
				"type": "kronos-copy",
				"endpoints": {
					"in": "stdin",
					"out": "file:/tmp/c",
					"out1": "stdout"
				}
			}
		}
	}
};

kronos.manager({
	flows: floDecls
}).then(function (manager) {
	manager.intializeFlow('flow1');
}, function (error) {
	console.log(error);
});
