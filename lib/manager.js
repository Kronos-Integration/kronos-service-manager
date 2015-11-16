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

  // stores all the available flows
  const flows = {};

  // stores all the available steps
  const steps = {};

  // this is a general module registry. This could be used by steps to share objects/modules. Just a key value store
  const modules = {};

  // this is a general service registry.
  const services = {};

  // this is a general config registry.
  const configs = {};

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
    },
    modules: {
      value: modules
    },
    services: {
      value: services
    },
    configs: {
      value: configs
    }
  });

  /**
   * Registers a service at the service manager. Usually this would be a service
   * provided by a remote reachable inboundStep.
   *
   * @param serviceId A unique id for the service. This id must be unique per node.
   * @param description A text describing this service
   * @param options Any options. For an http service this my be the URL, the port and host name.
   */
  manager.serviceRegister = function (serviceId, description, options) {
    services[serviceId] = {
      "id": serviceId,
      "description": description,
      "options": options
    };
    manager.emit('serviceRegistered', serviceId);
  };

  /**
   * Deletes the service with the given serviceId from the registry
   * @param serviceId The unique id for the service.
   */
  manager.serviceDelete = function (serviceId) {
    if (services[serviceId]) {
      delete services[serviceId];
    }
    manager.emit('serviceDeleted', serviceId);
  };

  /**
   * Return the complete service object.
   * @param serviceId The unique id of the service.
   * @return service The service object
   */
  manager.serviceGet = function (serviceId) {
    // TODO
  };

  /**
   * Checks if a service with the given ID exists
   * @param serviceId The unique id of the service.
   * @return status True or False
   */
  manager.serviceExists = function (serviceId) {
    // TODO
  };

  /**
   * Lists all the available services
   * @return serviceList A list of the available service objects
   */
  manager.serviceList = function () {
    // TODO
  };

  /**
   * Returns a configuration object for the given key.
   * If the config does not exists it will return undefined.
   * @param key The key under the configuration was registered.
   * @return The registered configuration for the given key
   */
  manager.configGet = function (key) {
    return configs[key];
  };

  /**
   * Registers an configuration object in the service manager.
   * If there is already registered under this key, it will be overwritten.
   * @param key A key used to identify the configuration.
   * @param config The configuration object to be stored.
   */
  manager.configRegister = function (key, config) {
    configs[key] = config;
    manager.emit('configRegistered', key);
  };

  /**
   * Deletes the configuration registered under the given key
   * @param key The key identifying the config to be deleted
   */
  manager.configDelete = function (key) {
    if (configs[key]) {
      delete configs[key];
    }
    manager.emit('configDeleted', key);
  };


  /**
   * Returns a registered module for the given key.
   * If the module does not exists it will return undefined.
   * @param key The key under the object was registered.
   * @return The registered module for the given key
   */
  manager.moduleGet = function (key) {
    return modules[key];
  };


  /**
   * Registers an object/module in the module store of the service manager.
   * If there is already somthing store under this key, it will be overwritten.
   * @param key A key used to identify the object.
   * @param module The object/module to be stored.
   */
  manager.moduleRegister = function (key, module) {
    modules[key] = module;
    manager.emit('moduleRegistered', key);
  };

  /**
   * Deletes a registered object from the module registry.
   * @param key The key used to identify the object.
   */
  manager.moduleDelete = function (key) {
    if (modules[key]) {
      delete modules[key];
    }
    manager.emit('moduleDeleted', key);
  };

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

  return manager;
  // return new Promise(function (resolve, reject) {
  //   return uti.initialize({
  //       definitionFileName: path.join(__dirname, '..', 'uti.json')
  //     })
  //     .then(function () {
  //       resolve(manager);
  //       return manager;
  //     }, reject);
  // });
};
