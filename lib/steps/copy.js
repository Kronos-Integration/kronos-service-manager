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
				"direction": "out(pull,push)"
			}
		},
		initialize(manager, step) {
			const input = step.endpoints.in.initialize();

			if (step.endpoints.out.canPull && false) { // TODO enable pull
				step.endpoints.out.initialize(function* () {
					yield * input;
				});
			} else {
				const ouput = step.endpoints.out.initialize(input);
				for (let request of input) {
					ouput.next(request);
				}
			}
		}
	}
};
