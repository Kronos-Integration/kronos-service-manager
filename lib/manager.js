/* jslint node: true, esnext: true */

"use strict";

const path = require('path');
const events = require('events');

const scopeReporter = require('scope-reporter');
const uti = require('uti');

const kronosStep = require('kronos-step');


function registerBuildinFeatures(manager) {
  manager.registerStepImplementation(require('./steps/flow_control'));
}

/*
 * creates a kronos service manager.
 * Options:
 *    name  - name of the manager defaults to 'kronos'
 *    logger - logger to use
 *
 * @param {Object} options
 * @return {Promise} a promise with the service manager as its value
 */
exports.manager = function (options) {
  if (!options) {
    options = {};
  }

  const logger = options.logger || console;

  const name = options.name || "kronos";

  if (!options.hasOwnProperty("validateSchema")) {
    options.validateSchema = false;
  }

  if (!options.scopeReporter) {
    options.scopeReporter = scopeReporter.createReporter(undefined, scopeReporter.createLoggingAdapter(logger));
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
  manager.registerStepImplementation = function (aStep) {
    const si = kronosStep.createStepImplementation(aStep);
    stepImplementations[si.name] = si;
    manager.emit('stepImplementationRegistered', si);
  };

  /**
   * stops execution and frees all used resources.
   * @return Promise
   */
  manager.shutdown = function () {
    const toBeStopped = [];

    for (let id in flowDefinitions) {
      const flow = flowDefinitions[id];
      toBeStopped.push(flow.stop());
    }

    return Promise.all(toBeStopped).then(Promise.resolve(manager));
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
      const newFlows = kronosStep.createFlow(manager, flowDef, scopeReporter);

      const toBeReplaced = [];

      newFlows.forEach(f => {
        const oldFlow = flowDefinitions[f.name];
        if (oldFlow) {
          toBeReplaced.push(oldFlow.delete());
        }
        flowDefinitions[f.name] = f;
        manager.emit('flowStateChanged', f);
      });

      return Promise.all(toBeReplaced).then(() => newFlows);
    }

    return _declare();
  };

  /**
   * Deletes a flow from the stored flow defenitions. If the flow
   * is currently running, it will be stopped first. After it
   * could be stopped, it will be deleted.
   * @param <string> flowName the name of the flow
   * @return returns a promise
   */
  manager.deleteFlow = function (flowName) {
    return flowDefinitions[flowName].stop().then(flow => {
      delete flowDefinitions[flowName];
      manager.emit('flowDeleted', flow);
    });
  };

  registerBuildinFeatures(manager);

  return new Promise(function (resolve, reject) {
    return uti.initialize({
        definitionFileName: path.join(__dirname, '..', 'uti.json')
      })
      .then(function () {
        resolve(manager);
        return manager;
      }, reject);
  });
};
