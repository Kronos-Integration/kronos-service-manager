/* jslint node: true, esnext: true */

"use strict";

const fs = require("fs");
const path = require("path");

const endpoint = require("./endpoint");

const stepImplementations = {};

exports.stepImplementations = stepImplementations;

const RootStepImplementation = {
	toString: function () {
		return this.name;
	}
};

exports.registerImplementation = function (si) {
	const implementation = si.implementation;
	const name = si.name;
	const description = si.description;
	const endpoints = endpoint.createEndpointsFromDefinition(si.endpoints);

	stepImplementations[name] = Object.create(RootStepImplementation, {
		name: {
			value: name
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
};


const stepsSubdir = 'steps';

fs.readdirSync(path.join(__dirname, stepsSubdir)).forEach(function (
	filename) {
	if (!/\.js$/.test(filename)) return;
	const stepModule = require('./' + path.join(stepsSubdir, filename));

	//console.log("register step: " + stepModule.stepImplementation.name);
	exports.registerImplementation(stepModule.stepImplementation);
});
