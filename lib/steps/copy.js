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
			const input = step.endpoints.in.initialize(manager);

			if (step.endpoints.out.canPull) {
				step.endpoints.out.initialize(manager,function* () {
					yield * input;
				});
			} else {
				const ouput = step.endpoints.out.initialize(manager,input);
				for (let request of input) {
					ouput.next(request);
				}
			}
		}
	}
};
