/* jslint node: true, esnext: true */

"use strict";

module.exports = {
	"description": "flow control step (load/unload)",
	"endpoints": {
		"in": {
			"direction": "in(active,passive)",
			"uti": "org.kronos.flow"
		}
	},
	initialize(manager, step) {
		if (step.endpoints.in.isPassive) {
			const input = step.endpoints.in.initialize(manager, function *() {
				const request = yield;
				const data = request.stream.read();
				manager.declareFlows(JSON.parse(data));
			});
		} else {
			const input = step.endpoints.in.initialize(manager);
			for (let request of input) {
				const data = request.stream.read();
				manager.declareFlows(JSON.parse(data));
			}
		}
	}
};
