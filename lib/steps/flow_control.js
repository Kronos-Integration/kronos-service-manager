/* jslint node: true, esnext: true */

"use strict";

exports.stepImplementations = {
	"flow_control": {
		"description": "flow control step (load/unload)",
		"endpoints": {
			"in": {
				"direction": "in(pull)",
				"uti": "org.kronos.flow"
			}
		},
		initialize(manager, step) {
			const input = step.endpoints.in.initialize();
			for (let request of input) {
				let data = request.stream.read();
				manager.declareFlows(JSON.parse(data));
			}
		}
	}
};
