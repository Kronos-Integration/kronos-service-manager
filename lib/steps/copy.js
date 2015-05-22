/* jslint node: true, esnext: true */

"use strict";

exports.stepImplementations = {
	"copy": {
		"description": "copies incoming (in) requests into output (out)",
		"endpoints": {
			"in": {
				"direction": "in"
			},
			"out": {
				"direction": "out"
			}
		},
		initialize(manager, step) {
			const input = step.endpoints.in.initialize();
			const ouput = step.endpoints.out.initialize(
				/*
								function* () {
									yield * input;
								} */
			);

			for (let request of input) {
				ouput.next(request);
			}
		}
	}
};
