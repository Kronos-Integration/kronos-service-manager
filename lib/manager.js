/* jslint node: true, esnext: true */

"use strict";

const step = require('kronos-step'),
  util = require('./util'),
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
   * Creates a Interceptor instance for a given interceptor configuration.
   * The Interceptors type needs to be registered before it can be referenced in
   * the Interceptor configuration.
   * @param {Object} configuration. The 'type' key of the configuration will be used to find the interceptor.
   *                                The 'config' key data will be passed as config data to the Interecptor itslef.
   * @param {Object} owner. The owner of the interceptor to be created..
   * @return {Interceptor} ready for use
   * @throws if given Interceptor type is not registered
   */
  manager.getInterceptorInstance = function (configuration, owner) {
    if (!configuration) {
      throw new Error(
        `Could not create an Interceptor without a configuration given.`
      );
    }

    if (!owner) {
      throw new Error(
        `Could not create an Interceptor without an owner given.`
      );
    }

    const InterceptorClass = interceptors[configuration.type];
    if (InterceptorClass) {
      return new InterceptorClass(owner, configuration.config);
    }
    throw new Error(
      `Could not find the InterceptorClass implementation: '${configuration.type}'.\nAvailable types are: ${Object.keys(interceptors).join(',')}`
    );
  };

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
 * Options:
 *    name  - name of the manager defaults to 'kronos'
 *    services - configuration for services
 * @param {Object} options
 * @return {Promise} a promise with the service manager as its value
 */
exports.manager = function (config) {
  const sm = new ServiceManager(config);
  return Promise.all([
    sm.registerService(new service.Config(config, sm)),
    sm.registerService(new service.Logger)
  ]).then(() => sm.start().then(() => Promise.resolve(sm)));
}
