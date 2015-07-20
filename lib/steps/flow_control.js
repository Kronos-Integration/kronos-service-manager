/* jslint node: true, esnext: true */

"use strict";

module.exports = {
	"description": "flow control step (load/unload)",
	"endpoints": {
		"in": {
			"direction": "in(active)",
			"uti": "org.kronos.flow"
		}
	},
	initialize(manager, step) {
		const input = step.endpoints.in.initialize(manager);
		for (let request of input) {
			let data = request.stream.read();
			manager.declareFlows(JSON.parse(data));
		}
	}
};
