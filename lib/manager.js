/* jslint node: true, esnext: true */

"use strict";

const flow = require("./flow");

const stepImplementation = require("./stepImplementation");
const endpointImplementation = require("./endpointImplementation");

exports.stepImplementation = stepImplementation;
exports.endpointImplementation = endpointImplementation;

exports.manager = function () {
	return manager;
};

const flowDefinitions = {};

var manager = {
	/**
	 * declareFlows function - declares new flows
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
	},


	/**
	 * declareSteps function - Declare new steps.
	 * If there is already a step with the given name, it will be overwritten
	 *
	 * @param  {object} stepDefinition   The step definition (not the implementation)
	 * @param  {string} stepName Optional: A new name under which the step should be registered
	 * @param  {string} config Optional: A new config to overwrite the existing config in the step definition
	 * @param  {boolean} overwrite Optional: If set to true, an exsiting step with the same name will be overwritten
	 * @return {boolean} true if the step could be registered. False if there is a step with the same name
	 */
	declareSteps: function (step) {
		stepImplementation.register(step.stepImplementations);
	}

};
