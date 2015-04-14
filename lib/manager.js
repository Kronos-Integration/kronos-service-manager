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

/**
 * registerStep function - Registers a new step.
 * It will check if there is already a step with the given name.
 *
 * @param  {object} stepDefinition   The step definition (not the implementation)
 * @param  {string} stepName Optional: A new name under which the step should be registered
 * @param  {string} config Optional: A new config to overwrite the existing config in the step definition
 * @param  {boolean} overwrite Optional: If set to true, an exsiting step with the same name will be overwritten
 * @return {boolean} true if the step could be registered. False if there is a step with the same name
 */

/**
 * registerFlow function - Registers a new flow.
 * It will check if there is already a flow with the given name.
 *
 * @param  {type} flowDefinition   The flow definition (JSON object)
 * @param  {string} flowName Optional: A new name under which the flow should be registered
 * @param  {string} config Optional: A new config to overwrite the existing config in the flow definition
 * @param  {boolean} overwrite Optional: If set to true, an exsiting flow with the same name will be overwritten
 * @return {boolean} true if the step could be registered. False if there is a step with the same name
 */

/**
 * execute function - Executes an existing flow
 *
 * @param  {string} flowName   The name the flow was registered
 * @param  {object} config Optional: The config for executing the flow
 * @param  {callback} A callback function with the result object as parameter
 * @return {object}
 */


/**
 * getConfiguration function - Returns the global configuration the framework was started with
 *
 * @param  {callback} A callback function with the result object as parameter
 * @return {object} The configuration
 */
