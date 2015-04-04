/* jslint node: true, esnext: true */

"use strict";

const flow = require("./flow");

exports.stepImplementation = require("./stepImplementation");
exports.endpointImplementation = require("./endpointImplementation");

exports.manager = function () {

	let flowDefinitions = {};

	function getFlow(flowId) {
		return flowDefinitions[flowId];
	}

	let manager = {
		declareFlow: function (sDefs) {
			const f = flow.create(sDefs);
			flowDefinitions[f.name] = f;
		},

		getFlow: getFlow
	};

	return manager;
};
