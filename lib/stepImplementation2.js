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
	for (let stepName in impls) {

		const si = impls[stepName];

		// get the initialize function of the step implementation
		const initialize = si.initialize;

		// get the meta info of this stpe
		const metaInfo = si.metaInfo;

		const endpoints = endpointImpl.createEndpointsFromDefinition(metaInfo.endpoints);

		const properties = {
			name: {
				value: stepName
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

		implementations[stepName] = Object.create(RootStepImplementation, properties);
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
