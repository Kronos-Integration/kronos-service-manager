/* jslint node: true, esnext: true */

"use strict";

const fs = require("fs");
const path = require("path");
const flow = require("./lib/flow");

const stepImplementations = {};

exports.registerStepImplementation = function (si) {
	stepImplementations[si.name] = si;
};


const stepsSubdir = 'lib/steps';


fs.readdirSync(path.join(__dirname, stepsSubdir)).forEach(function (
	filename) {
	if (!/\.js$/.test(filename)) return;
	const stepModule = require('./' + path.join(stepsSubdir, filename));

	console.log("register step: " + stepModule.stepImplementation.name);
	exports.registerStepImplementation(stepModule.stepImplementation);
});


const endpointsSubdir = 'lib/endpoints';

exports.manager = function () {

	let endpointImplementations = {};
	let flowDefinitions = {};

	function getFlow(flowId) {
		return flowDefinitions[flowId];
	}

	function getEndpointConfiguration(flowId, stepId, endpointId) {
		const flow = getFlow(flowId);
		if (flow) {
			return flow.endpoints[endpointId];
		}
		return undefined;
	}

	let manager = {
		defineEndpointImplementations: function (implementations) {
			for (let ein in implementations) {
				const ei = implementations[ein];
				endpointImplementations[ein] = ei;
			}
		},
		endpointImplementation: function (name) {
			return endpointImplementations[name];
		},

		stepImplementation: function (name) {
			return stepImplementations[name];
		},

		declareFlow: function (sDefs) {
			const f = flow.create(this, sDefs);
			flowDefinitions[f.name] = f;
		},

		getFlow: getFlow,

		/*
		   service interface used by a service
		*/
		getServiceEndpoint: function (serviceId, endpointId) {
			return getEndpointConfiguration(serviceId, endpointId);
		}
	};

	fs.readdirSync(path.join(__dirname, endpointsSubdir)).forEach(function (
		filename) {
		if (!/\.js$/.test(filename)) return;
		let endpointModule = require('./' + path.join(endpointsSubdir, filename));

		endpointModule.defineEndpointImplementations(manager);
	});


	return manager;
};
