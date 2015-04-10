/* jslint node: true, esnext: true */

"use strict";

const fs = require("fs");
const path = require("path");
const endpointImpl = require("./endpointImplementation");
const attributes = require('./attributes');

/*
 * stores a registered step imlementations by name
 */
const implementations = {};

// Template object
const RootStepImplementation = {
	toString: function () {
		return this.name;
	}
};

/**
 * register - registers a step implementation
 *
 * @param  {type} impls a hash of step implementations
 * @return {type}       nothing
 */
function register(impls) {

	// iterate over the given implementations
	for (let sin in impls) {

		// get an implementation for the stepName
		const si = impls[sin];

		// get the initialize function
		const initialize = si.initialize;

		// get the sonfig description for the step
		const config = si.config;

		const endpoints = endpointImpl.createEndpointsFromDefinition(si.endpoints);

		// store the data as real properties to build an object
		const properties = {
			name: {
				value: sin
			},
			endpoints: {
				value: endpoints
			},
			initialize: {
				value: initialize
			}
		};

		if (si.description) {
			const description = si.description;
			properties.description = {
				value: description
			};
		}

		if (config) {
			const atts = attributes.createAttributesFromDefinition(config);
			properties.config = {
				value: atts
			};
		}

		// create a step object
		implementations[sin] = Object.create(RootStepImplementation, properties);
	}
}

const stepsSubdir = 'steps';

fs.readdirSync(path.join(__dirname, stepsSubdir)).forEach(function (
	filename) {
	if (!/\.js$/.test(filename)) return;
	const m = require('./' + path.join(stepsSubdir, filename));

	register(m.stepImplementations);
});

exports.register = register;
exports.implementations = implementations;
