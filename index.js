/* jslint node: true, esnext: true */

"use strict";


/*
function createService(manager, serviceId, serviceConfig) {

}
*/


let serviceDefinitions = {};

exports.manager = {

	declareServices: function (sDefs) {
		serviceDefinitions = sDefs;
	},

	getServiceConfiguration: function (serviceId) {
		return serviceDefinitions[serviceId];
	},

	getEndpointConfiguration: function (serviceId, endpointId) {
		return serviceDefinitions[serviceId].endpoints[endpointId];
	},

	/*
	   service interface used by a service
	*/
	getEndpoint: function (serviceId, endpointId) {
		return serviceDefinitions[serviceId].endpoints[endpointId];
	}

};
