/* jslint node: true, esnext: true */

"use strict";

let endpoints = require("./endpoint");
let flow = require("./lib/flow");

/*
function createService(manager, serviceId, serviceConfig, service) {
}
*/


exports.manager = function () {

	let endpointTypes = {};
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
		defineEndpointTypes: function (types) {
			for (let tid in types) {
				const td = types[tid];
				endpointTypes[tid] = td;
			}
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

	endpoints.defineEndpointTypes(manager);

	return manager;
};
