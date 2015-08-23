/* jslint node: true, esnext: true */

"use strict";
const log4js = require('log4js');
const logger = log4js.getLogger('kronos-service-manager:manager');
logger.setLevel(log4js.levels.ERROR);

const path = require("path");
const events = require('events');

const flow = require("./flow");
const scopeReporter = require("scope-reporter");

const uti = require("uti");


const flowDefinition = require('kronos-flow');
const flowValidator = flowDefinition.validator;
const flowSchema = flowDefinition.schema;

const kronosStep = require('kronos-step');
const stepValidator = kronosStep.validator;
const stepSchema = kronosStep.schema;


function registerBuildinFeatures(manager) {
  manager.registerStepImplementation('kronos-flow-control', require('./steps/flow_control'));
  manager.registerStepImplementation('kronos-group', require('./steps/group'));
  require('kronos-service-manager-addon').registerWithManager(manager);
}

/*
 * creates a kronos service manager.
 * Options:
 *    name  - name of the manager defaults to 'kronos'
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

  const name = options.name || "kronos";

  if (!options.hasOwnProperty("validateSchema")) {
    options.validateSchema = false;
  }

  if (!options.scopeReporter) {
    options.scopeReporter = scopeReporter.createReporter();
  }

  const flowDefinitions = {};
  const stepImplementations = {};
  const endpointSchemeImplementations = {};

  const manager = Object.create(new events.EventEmitter(), {
    toString: {
      value: function () {
        return this.name;
      }
    },
    name: {
      value: name
    },
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
   * registerFlows function - registers new flows
   * Events:
   * 	emits 'flowStateChanged' event for every newly registered flow
   * @param  {type} flowDef          A JSON Object which describes the flows
   * @param  {type} scopeReporter Optional: A scope reporter.
   * @return Promise fullfilling to an array of the newly created flows
   */
  manager.registerFlows = function (flowDef, scopeReporter) {
    if (!scopeReporter) {
      scopeReporter = options.scopeReporter;
    }

    function _declare() {
      const newFlows = flow.create(manager, flowDef, scopeReporter);

      const toBeReplaced = [];

      newFlows.forEach(function (f) {
        const oldFlow = flowDefinitions[f.name];
        if (oldFlow) {
          toBeReplaced.push(oldFlow.delete());
        }
        flowDefinitions[f.name] = f;
        manager.emit('flowStateChanged', f);
      });

      return Promise.all(toBeReplaced).then(function () {
        return newFlows;
      });
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
   * Deletes a flow from the stored flow defenitions. If the flow
   * is currently running, it will be stopped first. After it
   * could be stopped, it will be deleted.
   * @param <string> flowName the name of the flow
   * @return returns a promise
   */
  manager.deleteFlow = function (flowName) {
    return flowDefinitions[flowName].stop().then(function (flow) {
      delete flowDefinitions[flowName];
      manager.emit('flowDeleted', flow);
    });
  };

  return new Promise(function (resolve, reject) {
    registerBuildinFeatures(manager);

    return uti.initialize({
        definitionFileName: path.join(__dirname, '..', 'uti.json')
      })
      .then(function (resloved) {
        if (options.flows) {
          manager.registerFlows(options.flows, options.scopeReporter);
        }

        resolve(manager);
      }, reject);
  });
};
