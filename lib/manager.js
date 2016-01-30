/* jslint node: true, esnext: true */

"use strict";

const step = require('kronos-step'),
  util = require('./util'),
  service = require('kronos-service');

class ServiceManager extends util.FlowSupportMixin(service.ServiceProviderMixin(service.Service)) {

  static get name() {
    return "kronos";
  }
  get type() {
    return ServiceManager.name;
  }

  constructor(config) {
    super(config);

    service.defineRegistryProperties(this, 'interceptor', {
      withCreateInstance: true,
      factoryType: 'new'
    });

    service.defineRegistryProperties(this, 'step', {
      withCreateInstance: true,
      factoryType: 'object',
      factoryMethod: 'createInstance'
    });

    service.defineRegistryProperties(this, 'flow', {
      hasBeenRegistered(flow) {
          if (flow.autostart) {
            return flow.start();
          }
          return Promise.resolve();
        },

        /**
         * Deletes a flow from the stored flow definitions. If the flow
         * is currently running, it will be stopped first. After it
         * could be stopped, it will be deleted.
         * @return {Promise} returns a promise that is fullfilled when the flow is removed
         *         or one that rejects if there is no flow for the given flowName
         */
        willBeUnregistered(flow) {
          return flow.stop().then(flow.remove());
        }
    });

  }

  /**
   * Stops execution and frees all used resources.
   * It will stop each flow.
   * Then stop all services
   * @return {Promise} that fullfils to the manager
   */
  _stop() {
    return Promise.all(Object.keys(this.flows).map(name => this.flows[name].stop())).
    then(Promise.all(Object.keys(this.services).map(name => this.services[name].stop())));
  }



  // DEPRECATED
  getStepInstance(configuration) {
    console.error(`DEPRECATED getStepInstance(name) use createStepInstanceFromConfig(name)`);
    return this.createStepInstanceFromConfig(configuration);
  }

  // DEPRECATED
  shutdown() {
    return this.stop();
  }

  // DEPRECATED
  deleteFlow(name) {
    console.error(`DEPRECATED deleteFlow(name) use unregisterFlow(name)`);
    return this.unregisterFlow(name);
  }

  // DEPRECATED
  serviceGet(name) {
    console.error(`DEPRECATED serviceGet(name) use services[name]`);
    return this.services[name];
  }

  // DEPRECATED
  registerStepImplementation(arg1) {
    console.error(`DEPRECATED registerStepImplementation() use registerStep()`);
    this.registerStep(arg1);
  }
}

/*
 * creates a kronos service manager.
 * Options:
 *    name  - name of the manager defaults to 'kronos'
 *    services - configuration for services
 * @param {Object} options
 * @return {Promise} a promise with the service manager as its value
 */
exports.manager = function (config) {
  const sm = new ServiceManager(config);
  return sm.start().then(() => Promise.resolve(sm));
}
