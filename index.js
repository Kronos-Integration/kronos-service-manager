/* jslint node: true, esnext: true */

"use strict";


/*
function createService(manager, serviceId, serviceConfig) {

}
*/

exports.manager = {


  getServiceConfiguration: function (serviceId) {},
  getEndpointConfiguration: function (serviceId, endpointId) {},


/*
   service interface used by a service
*/
  getEndpoint: function (serviceId, endpointId) {}

};
