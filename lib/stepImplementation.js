/* jslint node: true, esnext: true */

"use strict";

const fs = require("fs");
const path = require("path");
const endpointImpl = require("./endpointImplementation");
const attributes = require('./attributes');

/*
 * registered step imlementations by name
 */
const implementations = {};


const RootStepImplementation = {
	toString: function () {
		return this.name;
	}
};

/*
 * registers a step implementation
 */
function register(impls) {
	for (let sin in impls) {
		const si = impls[sin];
		const initialize = si.initialize;
		const config = si.config;
		const endpoints = endpointImpl.createEndpointsFromDefinition(si
			.endpoints);

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

		if (si.config) {
			const atts = attributes.createAttributesFromDefinition(si.config);
			properties.config = {
				value: atts
			};
		}

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
