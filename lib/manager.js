/* jslint node: true, esnext: true */

"use strict";

const flow = require("./flow");

exports.stepImplementation = require("./stepImplementation");
exports.endpointImplementation = require("./endpointImplementation");

exports.manager = function () {
  const flowDefinitions = {};

  const manager = {
    /**
     * declares a new flow
     * @return newly created flow
     */
    declareFlow: function (flowDef, progressReporter) {
      const f = flow.create(flowDef, progressReporter);
      flowDefinitions[f.name] = f;
      return f;
    },

    getFlow: function (flowName) {
      return flowDefinitions[flowName];
    }
  };

  return manager;
};
