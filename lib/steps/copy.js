/* jslint node: true, esnext: true */

"use strict";

exports.stepImplementations = {
	"kronos-copy": {
		"description": "copies incoming (in) requests into output (out)",
		"endpoints": {
			"in": {
				"direction": "in(active)"
			},
			"out": {
				"direction": "out(active,passive)"
			}
		},
		initialize(manager, step) {
			const input = step.endpoints.in.initialize(manager);

			if (step.endpoints.out.cenBePassive) {
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
