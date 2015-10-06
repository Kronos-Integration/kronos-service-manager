/* jslint node: true, esnext: true */

"use strict";

const path = require('path');
const events = require('events');

const uti = require('uti');


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
    steps[step.name] = step;
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
  manager.registerFlow = function (flow) {

    let eventName;
    if (flows[flow.name]) {
      eventName = 'flowRegistered';
    } else {
      eventName = 'flowStateChanged';
    }


    // Check if this flow already exists
    if (flows[flow.name] && !flows[flow.name].isStopped()) {

      const oldFlow = flows[flow.name];


      return manager.deleteFlow(oldFlow.name).then(function () {
        return new Promise(function (fulfill, reject) {
          manager.emit(eventName, flow);
          flows[flow.name] = flow;
          fulfill(flow);
        });
      });

      // the flow exists and is running. It must be stopped first
    } else {
      // as the flow is NOT running just replace it
      return new Promise(function (fulfill, reject) {
        manager.emit(eventName, flow);
        flows[flow.name] = flow;
        fulfill(flow);
      });
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
    return flows[flowName].stop().then(flow => {
      delete flows[flowName];
      manager.emit('flowDeleted', flow);
    });
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
