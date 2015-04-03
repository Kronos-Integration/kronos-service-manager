/* jslint node: true, esnext: true */

"use strict";

const fs = require("fs");
const path = require("path");
const flow = require("./lib/flow");
const endpoint = require("./lib/endpoint");
const stepImplementation = require("./lib/stepImplementation");

const endpointsSubdir = 'lib/endpoints';

exports.stepImplementation = stepImplementation;

exports.manager = function () {

  let endpointImplementations = {};
  let flowDefinitions = {};

  function getFlow(flowId) {
    return flowDefinitions[flowId];
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

    stepImplementation: function (name) {
      return stepImplementation.stepImplementations[name];
    },

    declareFlow: function (sDefs) {
      const f = flow.create(this, sDefs);
      flowDefinitions[f.name] = f;
    },

    getFlow: getFlow
  };

  fs.readdirSync(path.join(__dirname, endpointsSubdir)).forEach(function (
    filename) {
    if (!/\.js$/.test(filename)) return;
    let endpointModule = require('./' + path.join(endpointsSubdir,
      filename));

    endpointModule.defineEndpointImplementations(manager);
  });


  return manager;
};
