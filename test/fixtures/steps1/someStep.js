/* jslint node: true, esnext: true */

"use strict";

const step = require('kronos-step');

class SomeStep extends step.Step {

};

SomeStep.configuration = {
	"name": "some-step",
	"endpoints": {
		"in": {
			"in": true
		}
	}
};

module.exports = SomeStep;
