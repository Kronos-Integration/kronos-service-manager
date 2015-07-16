/* jslint node: true, esnext: true */

"use strict";
const log4js = require('log4js');
const logger = log4js.getLogger('kronos-service-manager:manager');
//logger.setLevel(log4js.levels.ERROR);

const path = require("path");
const events = require('events');

const flow = require("./flow");
const progressReporter = require("./progressReporter");

const uti = require("uti");


const flowDefinition = {}; //require('kronos-flow');
const flowValidator = flowDefinition.validator;
const flowSchema = flowDefinition.schema;

const kronosStep = require('kronos-step');
const stepValidator = kronosStep.validator;
const stepSchema = kronosStep.schema;

/*
 * creates a kronos service manager.
 * Options:
 *    flows - flow declaration to load
 *    validateSchema - do schema validation; defaults to false
 *
 * @param {Object} options
 * @return {Promise} a promise with the service manager as its value
 */
exports.manager = function (options) {
  logger.debug(`Create a new kronos-service-manager instance`);

  if (!options) {
    options = {};
  }

  if (!options.hasOwnProperty("validateSchema")) {
    options.validateSchema = false;
  }

  if (!options.progressReporter) {
    options.progressReporter = progressReporter.defaultProgressReporter();
  }

  const flowDefinitions = {};
  const stepImplementations = {};
  const endpointSchemeImplementations = {};

  const manager = Object.create(new events.EventEmitter(), {
    flowDefinitions: {
      value: flowDefinitions
    },
    stepImplementations: {
      value: stepImplementations
    },
    endpointSchemeImplementations: {
      value: endpointSchemeImplementations
    }
  });

  /**
   * Events:
   * 	emits 'endpointSchemeRegistered' event for every newly registered endpoint schema
   */
  manager.registerEndpointScheme = function (name, endpointScheme) {
    endpointSchemeImplementations[name] = endpointScheme;
    manager.emit('endpointSchemeRegistered', endpointScheme);
  };

  /**
   * Events:
   * 	emits 'stepImplementationRegistered' event for every newly registered step implementation
   */
  manager.registerStepImplementation = function (name, aStep) {
    const si = kronosStep.createStepImplementation(name, aStep);
    stepImplementations[name] = si;
    manager.emit('stepImplementationRegistered', si);
  };

  /**
   * stops exectution and frees all used resources.
   * @return Promise
   */
  manager.shutdown = function () {
    logger.debug(`Shutdown the kronos-service-manager instance`);
    return new Promise(function (resolve, reject) {
      // TODO stop running flows
      resolve(manager);
    });
  };

  /**
   * declareFlows function - declares new flows
   * Events:
   * 	emits 'flowDeclard' event for every newly created flow
   * @param  {type} flowDef          A JSON Object which describes the flows
   * @param  {type} progressReporter Optional: A Progresss reporter.
   * @return {type}                  dictionary of the newly created flows
   */
  manager.declareFlows = function (flowDef, progressReporter) {
    logger.debug(`declareFlows`);

    if (!progressReporter) {
      progressReporter = options.progressReporter;
    }

    function _declare() {
      const flows = flow.create(manager, flowDef, progressReporter);

      for (let fn in flows) {
        flowDefinitions[fn] = flows[fn];
        manager.emit('flowDeclared', flows[fn]);
      }

      return flows;
    }

    if (options.validateSchema) {
      // Check if the given flow matches the flow schema
      if (flowValidator.validate(flowDef, flowSchema)) {
        // The given flow matches the schema
        return _declare();
      } else {
        // The schema validator got an error
        const errors = flowValidator.getLastErrors();
        logger.error(errors);
        throw (errors);
      }
    } else {
      return _declare();
    }
  };

  /**
   * brings a declared flow to live state
   */
  manager.intializeFlow = function (flowName) {
    logger.debug(`Intialize Flow '${flowName}'`);

    const flow = flowDefinitions[flowName];
    //flow.initialize.apply(flow, manager);
    flow.initialize(manager);
  };

  /**
   * Stops a flow.
   *
   */
  manager.stopFlow = function (flowName) {
    logger.debug(`Stop Flow '${flowName}'`);

    return new Promise(function (resolve, reject) {
      const flow = flowDefinitions[flowName];
      resolve(flow);
    });
  };

  /**
   * Deletes a from from the stored flow defenitions. If the flow
   * is currently active, it will be stopped first. After it
   * could be stopped, it will be deleted.
   * @param flowName the name of the flow
   * @return returns a promise
   */
  manager.deleteFlow = function (flowName) {
    logger.debug(`Delete Flow '${flowName}'`);

    const p = manager.stopFlow(flowName).then(function (flow) {
      console.log(`A delete ${flow}`);

      //const flow = flowDefinitions[flowName];
      delete flowDefinitions[flowName];
      manager.emit('flowDeleted', flow);
    });

    console.log(`P: ${p}`);
    return p;
  };

  return new Promise(function (resolve, reject) {
    require('kronos-service-manager-addon').registerWithManager(manager);

    return uti.initialize({
        definitionFileName: path.join(__dirname, '..', 'uti.json')
      })
      .then(function (resloved) {
        logger.debug(`Manager Promise: 'Then'`);

        if (options.flows) {
          logger.debug(`Manager Promise: 'Then': declareFlows`);
          manager.declareFlows(options.flows, options.progressReporter);
        }

        resolve(manager);
      }, reject);
  });
};
