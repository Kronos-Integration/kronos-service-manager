/* jslint node: true, esnext: true */

"use strict";

let endpoints = require("./endpoint");

/*
function createService(manager, serviceId, serviceConfig, service) {

}
*/

exports.manager = function () {

	let endpointTypes = {};
	let serviceDefinitions = {};

	function getService(serviceId) {
		return serviceDefinitions[serviceId];
	}

	function getServiceConfiguration(serviceId) {
		return getService(serviceId).config;
	}

	function getEndpointConfiguration(serviceId, endpointId) {
		const service = getService(serviceId);
		if (service) {
			return service.endpoints[endpointId];
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

		declareServices: function (sDefs) {
			for (let sid in sDefs) {
				const sd = sDefs[sid];

				sd.id = sid;
				if (sd.config === undefined) {
					sd.config = {};
				}
				if (sd.endpoints === undefined) {
					sd.endpoints = {};
				}

				serviceDefinitions[sid] = sd;
			}
		},

		instantiateService: function (serviceId, factory) {
			let sd = getService(serviceId);
			let service = factory(manager, serviceId, sd.config);
			sd.instance = service;
			return service;
		},

		getServiceConfiguration: getServiceConfiguration,
		getService: getService,

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
