/* jslint node: true, esnext: true */

"use strict";

exports.stepImplementations = {
  "copy": {
    "description": "copies incoming (in) requests into output (out)",
    "endpoints": {
      "in": {
        "direction": "in"
      },
      "out": {
        "direction": "out"
      }
    },
    "initialize": function (manager, step) {

      /*
			      step.endpoints.in.on('request',function(request) {
			        out.next(request);
			      });
			*/

      const out = step.endpoints.out.implementation();

      out.next(); // advance to 1st. connection - TODO: needs to be move into service-manager

      const input = step.endpoints.in.implementation();

      for (let request of input) {
        out.next(request);
      }
    }
  }
};
