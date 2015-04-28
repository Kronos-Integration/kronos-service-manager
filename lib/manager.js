/* jslint node: true, esnext: true */

"use strict";

const path = require("path");
const events = require('events');

const Promise = require("Promise");

const flow = require("./flow");

const progressReporter = require("./progressReporter");
const stepImplementation = require("./stepImplementation");
const endpointImplementation = require("./endpointImplementation");

exports.stepImplementation = stepImplementation;
exports.endpointImplementation = endpointImplementation;


/*
 * creates a kronos service manager.
 * Options:
 *    stepDirectories - addittional directories to consult for step implementations
 *    flows - flow declaration to load
 *
 * @param {Object} options
 * @return {Promise} a promise with the service manager as its value
 */
exports.manager = function (options) {
	if (!options) {
		options = {};
	}
	if (!options.progressReporter) {
		options.progressReporter = progressReporter.defaultProgressReporter();
	}

	const flowDefinitions = {};

	const manager = new events.EventEmitter();

	/**
	 * declareFlows function - declares new flows
	 * Emits a 'flowDeclard' event for every newly created flow
	 * @param  {type} flowDef          A JSON Object which describes the flows
	 * @param  {type} progressReporter Optional: A Progresss reporter.
	 * @return {type}                  dictionary of the newly created flows
	 */
	manager.declareFlows = function (flowDef, progressReporter) {
		const flows = flow.create(flowDef, progressReporter);
		for (let fn in flows) {
			flowDefinitions[fn] = flows[fn];
			this.emit('flowDeclared', flows[fn]);
		}
		return flows;
	};

	/**
	 * getFlow function - returns a declared flow with the given name
	 *
	 * @param  {type} flowName The name of the flow to retrieve
	 * @return {type}          The flow if exists
	 */
	manager.getFlow = function (flowName) {
		return flowDefinitions[flowName];
	};

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
	manager.declareSteps = function (step) {
		stepImplementation.register(step.stepImplementations);
	};

	// create list of all directories to load step definitions from
	const stepDirs = [path.join(__dirname, 'steps')];
	if (options.stepDirectories) {
		if (Array.isArray(options.stepDirectories)) {
			options.stepDirectories.each(function (d) {
				stepDirs.push(d);
			});
		} else {
			stepDirs.push(options.stepDirectories);
		}
	}

	return exports.stepImplementation.registerStepsFromDirs(stepDirs)
		.then(function (steps) {
			return new Promise(function (resolve) {
				if (options.flows) {
					manager.declareFlows(options.flows, options.progressReporter);
				}

				resolve(manager);
			});
		});
};
