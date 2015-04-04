/* jslint node: true, esnext: true */

"use strict";

const fs = require("fs");
const path = require("path");

const endpointImpl = require("./endpointImplementation");

const implementations = {};


const RootStepImplementation = {
	toString: function () {
		return this.name;
	}
};

function register(impls) {
	for (let sin in impls) {
		const si = impls[sin];
		const implementation = si.implementation;
		const description = si.description;
		const endpoints = endpointImpl.createEndpointsFromDefinition(si
			.endpoints);

		implementations[sin] = Object.create(RootStepImplementation, {
			name: {
				value: sin
			},
			description: {
				value: description
			},
			endpoints: {
				value: endpoints
			},
			implementation: {
				value: implementation
			}
		});
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
