/* jslint node: true, esnext: true */

"use strict";

const util = require('./util'),
  rgm = require('registry-mixin'),
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

    rgm.defineRegistryProperties(this, 'interceptor', {
      withCreateInstance: true,
      factoryType: 'new'
    });

    /*
     * createStepInstance(type,...args);
     * createStepInstanceFromConfig({ type: "type name" },...args);
     *   calls: registeredStep.createInstance( config, ...args)
     */
    rgm.defineRegistryProperties(this, 'step', {
      withCreateInstance: true,
      withEvents: true,
      factoryType: 'object',
      factoryMethod: 'createInstance'
        // todo pass 'registry' as 2nd. argument
    });

    rgm.defineRegistryProperties(this, 'flow', {
      withEvents: true,
      hasBeenRegistered: flow => flow.autostart ? flow.start() : Promise.resolve(),

      /**
       * Deletes a flow from the stored flow definitions. If the flow
       * is currently running, it will be stopped first. After it
       * could be stopped, it will be deleted.
       * @return {Promise} returns a promise that is fullfilled when the flow is removed
       *         or one that rejects if there is no flow for the given flowName
       */
      willBeUnregistered: flow => flow.stop().then(flow.remove())
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
}

/*
 * creates a kronos service manager.
 * @param {Object} config separated for each service
 * @param {Array} modules optional array of modules to register
 * @return {Promise} a promise with the service manager as its value
 */
exports.manager = function (config, modules) {
  if (modules === undefined) {
    modules = [];
  }

  const sm = new ServiceManager(config);
  return sm.registerService(new service.Logger)
    .then(() => sm.registerService(new service.Config(config, sm)))
    .then(() => Promise.all(modules.map(m => m.registerWithManager(sm))))
    .then(() => sm.start().then(() => Promise.resolve(sm)));
};
