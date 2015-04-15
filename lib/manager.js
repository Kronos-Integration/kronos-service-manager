/* jslint node: true, esnext: true */

"use strict";

const flow = require("./flow");

exports.stepImplementation = require("./stepImplementation");
exports.endpointImplementation = require("./endpointImplementation");

exports.manager = function () {
  const flowDefinitions = {};

  const manager = {
    /**
     *
     * @return
     */

    /**
     * declareFlow function - declares a new flow
     *
     * @param  {type} flowDef          A JSON Object which describes a flow
     * @param  {type} progressReporter Optional: A Progresss reporter.
     * @return {type}                  newly created flow
     */
    declareFlow: function (flowDef, progressReporter) {
      const f = flow.create(flowDef, progressReporter);
      flowDefinitions[f.name] = f;
      return f;
    },


    /**
     * getFlow function - returns a declared flow with the given name
     *
     * @param  {type} flowName The name of the flow to retrieve
     * @return {type}          The flow if exists
     */
    getFlow: function (flowName) {
      return flowDefinitions[flowName];
    }
  };

  return manager;
};
