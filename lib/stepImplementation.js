/* jslint node: true, esnext: true */

"use strict";

const fs = require("fs");
const path = require("path");
const endpointImpl = require("./endpointImplementation");

/*
 * registered step imlementations by name
 */
const implementations = {};


const RootStepImplementation = {
  toString: function () {
    return this.name;
  }
};

/*
 * registers a step implementation
 */
function register(impls) {
  for (let sin in impls) {
    const si = impls[sin];
    const initialize = si.initialize;
    const description = si.description;
    const endpoints = endpointImpl.createEndpointsFromDefinition(si
      .endpoints);

    implementations[sin] = Object.create(RootStepImplementation, {
      name: {
        value: sin
      },
      description: {
        value: description
      },
      endpoints: {
        value: endpoints
      },
      initialize: {
        value: initialize
      }
    });
  }
}


const stepsSubdir = 'steps';

fs.readdirSync(path.join(__dirname, stepsSubdir)).forEach(function (
  filename) {
  if (!/\.js$/.test(filename)) return;
  const m = require('./' + path.join(stepsSubdir, filename));

  register(m.stepImplementations);
});

exports.register = register;
exports.implementations = implementations;
