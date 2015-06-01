/* jslint node: true, esnext: true */

"use strict";

exports.stepImplementations = {
	"copy": {
		"description": "copies incoming (in) requests into output (out)",
		"endpoints": {
			"in": {
				"direction": "in(pull)"
			},
			"out": {
				"direction": "out(pull,push)"
			}
		},
		initialize(manager, step) {
			const input = step.endpoints.in.initialize();

			if (step.endpoints.out.canPull) {
				//console.log(`A canPull ${input}`);
				step.endpoints.out.initialize(function* () {
					//console.log(`A1 canPull ${input}`);

					yield * input;
				});
				//console.log(`B canPull ${input}`);
			} else {
				const ouput = step.endpoints.out.initialize(input);
				for (let request of input) {
					ouput.next(request);
				}
			}
		}
	}
};
