/* jslint node: true, esnext: true */

"use strict";

const BaseStep = require('kronos-step').Step;

const SomeStep = {
	"name": "some-step",
	"endpoints": {
		"in": {
			"in": true,
			"passive": true
		}
	}
};

module.exports = Object.assign({}, BaseStep, SomeStep);
