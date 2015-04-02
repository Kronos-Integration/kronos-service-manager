/* jslint node: true, esnext: true */

"use strict";

exports.stepImplementation = {
  "name": "copy",
  "definition": {
    "description": "copies incomping requests into output",
    "endpoints": {
      "in": {
        "direction": "in",
        "mandatory": true
      },
      "out": {
        "direction": "out",
        "mandatory": true
      }
    }
  },
  "initialize": function (manager, step) {

    let out = step.endpoints.out.implementation();

    out.next(); // advance to 1st. connection - TODO: needs to be move into service-manager

    let in1 = step.endpoints.in.implementation();

    for (let request of in1) {
      out.next(request);
    }
  }
};
