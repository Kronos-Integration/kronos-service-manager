/* jslint node: true, esnext: true */

"use strict";

const path = require('path'),
  events = require('events'),
  uti = require('uti'),
  scopeReporter = require('scope-reporter'),
  step = require('kronos-step');


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

  if (!options.scopeReporter) {
    options.scopeReporter = scopeReporter.createReporter(step.ScopeDefinitions, scopeReporter.createLoggingAdapter(
      logger));
  }

  const flows = {};
  const steps = {};

  // Create the manager object
  const manager = Object.create(new events.EventEmitter(), {
    toString: {
      value: function () {
        return this.name;
      }
    },
    name: {
      value: name
    },
    flows: {
      value: flows
    },
    steps: {
      value: steps
    }
  });


  /**
   * registers a step at the service manager. This is a step factory. The name used here
   * will be referenced from the flow. Then this stepFactory will be used to create a step instance
   * from the flow.
   *
   * @param step The step factory to be registered
   * Events:
   * 	emits 'stepRegistered' event for every newly registered step implementation
   */
  manager.registerStep = function (step) {

    // TODO burn configuration.name into class.name
    const name = step.configuration.name;

    steps[name] = step;
    manager.emit('stepRegistered', step);
  };

  /**
   * Stops execution and frees all used resources.
   * It will stop each running flow.
   * @return Promise
   */
  manager.shutdown = function () {
    const toBeStopped = [];

    for (let id in flows) {
      const flow = flows[id];
      toBeStopped.push(flow.stop());
    }

    return Promise.all(toBeStopped).then(Promise.resolve(manager));
  };

  /**
   * Register a new flow. If it is a new flow it will just be added. If there is
   * an existing flow with this name the flow will be replaced.
   * If the flow is cuurently running, it will be stopped first
   *
   * Events:
   * 	emits 'flowStateChanged' event for a newly registered flow which has to be replaced
   *        'flowRegistered' event for every newly registered flow
   *
   * @param  {type} flow The new flow to be registered
   * @return Promise fullfilling to an array of the newly created flows
   */
  manager.registerFlow = function (flowDef, scopeReporter) {
    if (!scopeReporter) {
      scopeReporter = options.scopeReporter;
    }

    const newFlow = step.createStep(manager, scopeReporter, flowDef);
    const oldFlow = flows[newFlow.name];

    flows[newFlow.name] = newFlow;

    if (oldFlow) {
      return oldFlow.remove().then(Promise.resolve(newFlow));
    }

    return Promise.resolve(newFlow);
  };

  /**
   * Deletes a flow from the stored flow defenitions. If the flow
   * is currently running, it will be stopped first. After it
   * could be stopped, it will be deleted.
   * @param <string> flowName the name of the flow
   * @return returns a promise tha is fullfilled when the flow is removed
   */
  manager.deleteFlow = function (flowName) {
    const flow = flows[flowName];
    return flow.stop().then(flow.remove());
  };

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
