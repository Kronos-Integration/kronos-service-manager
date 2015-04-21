/* jslint node: true, esnext: true */

"use strict";

const flow = require("./flow");

exports.stepImplementation = require("./stepImplementation");
exports.endpointImplementation = require("./endpointImplementation");

exports.manager = function () {
	const flowDefinitions = {};

	const manager = {

		/**
		 * declareFlow function - declares new flows
		 *
		 * @param  {type} flowDef          A JSON Object which describes the flows
		 * @param  {type} progressReporter Optional: A Progresss reporter.
		 * @return {type}                  newly created flows
		 */
		declareFlows: function (flowDef, progressReporter) {
			const flows = flow.create(flowDef, progressReporter);
			for (let fn in flows) {
				flowDefinitions[fn] = flows[fn];
			}
			return flows;
		},


		/**
		 * getFlow function - returns a declared flow with the given name
		 *
		 * @param  {type} flowName The name of the flow to retrieve
		 * @return {type}          The flow if exists
		 */
		getFlow: function (flowName) {
			return flowDefinitions[flowName];
		}
	};

	return manager;
};
