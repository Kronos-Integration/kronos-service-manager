/* jslint node: true, esnext: true */

"use strict";


/*
function createService(manager, serviceId, serviceConfig) {

}
*/

exports.manager = function () {

  let serviceDefinitions = {};
  let instantiatedServices = {};

  function getEndpointConfiguration(serviceId, endpointId) {
    return serviceDefinitions[serviceId].endpoints[endpointId];
  }

  let manager = {
    instantiateService: function (serviceId, factory) {
      let service = factory(manager, serviceId, {});
      instantiatedServices[serviceId] = service;
      return service;
    },

    declareServices: function (sDefs) {
      serviceDefinitions = sDefs;
    },

    getServiceConfiguration: function (serviceId) {
      return serviceDefinitions[serviceId].config;
    },

    getEndpointConfiguration: getEndpointConfiguration,

    /*
		   service interface used by a service
		*/
    getEndpoint: function (serviceId, endpointId) {
      return getEndpointConfiguration(serviceId, endpointId);
    }
  };

  return manager;
};
