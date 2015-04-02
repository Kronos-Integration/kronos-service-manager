/* jslint node: true, esnext: true */

"use strict";

const fs = require("fs");
const path = require("path");
const flow = require("./lib/flow");

/*
function createService(manager, serviceId, serviceConfig, service) {
}
*/

const endpointsSubdir = 'lib/endpoints';

exports.manager = function () {

	let endpointImplementations = {};
	let flowDefinitions = {};

	function getFlow(flowId) {
		return flowDefinitions[flowId];
	}

	function getServiceConfiguration(serviceId) {
		return getService(serviceId).config;
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

		declareFlow: function (sDefs) {
			const f = flow.create(this, sDefs);
			flowDefinitions[f.name] = f;
		},

		instantiateService: function (flowId, serviceId, factory) {
			let flow = getFlow(flowId);
			let service = factory(manager, serviceId, sd.config);
			sd.instance = service;
			return service;
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
