/* jslint node: true, esnext: true */

"use strict";

const RootEndpoint = {
  toString: function () {
    return this.name;
  }
};

exports.createEndpointsFromDefinition = function (endpointDefinitions) {
  const endpoints = {};

  for (let eid in endpointDefinitions) {
    let ed = endpointDefinitions[eid];
    let direction = ed.direction;
    let mandatory = ed.mandatory;
    let description = ed.description;
    let uti = ed.uti; // Uniform Type Identifier

    endpoints[eid] = Object.create(RootEndpoint, {
      name: {
        value: eid
      },
      description: {
        value: description
      },
      direction: {
        value: direction
      },
      mandatory: {
        value: mandatory
      },
      uti: {
        value: uti
      }
    });
  }
  return endpoints;
};
