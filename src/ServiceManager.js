/* jslint node: true, esnext: true */

'use strict';

import {
  ServiceProviderMixin, Service
}
from 'kronos-service';
import {
  createAttributes, mergeAttributes
}
from 'model-attributes';
import {
  SendEndpoint
}
from 'kronos-endpoint';
import {
  defineRegistryProperties
}
from 'registry-mixin';

import FlowSupportMixin from './FlowSupportMixin';

class ServiceManager extends FlowSupportMixin(ServiceProviderMixin(Service)) {

  static get name() {
    return 'kronos';
  }

  static get configurationAttributes() {
    return mergeAttributes(createAttributes({
      id: {
        description: 'node id in the cluster',
        type: 'string',
        default: 'kronos',
        needsRestart: true
      }
    }), Service.configurationAttributes);
  }

  constructor(config) {
    super(config);

    defineRegistryProperties(this, 'interceptor', {
      withCreateInstance: true,
      factoryType: 'new'
    });

    /*
     * createStepInstance(type,...args);
     * createStepInstanceFromConfig({ type: "type name" },...args);
     *   calls: registeredStep.createInstance( config, ...args)
     */
    defineRegistryProperties(this, 'step', {
      withCreateInstance: true,
      withEvents: true,
      factoryType: 'object',
      factoryMethod: 'createInstance'
        // todo pass 'registry' as 2nd. argument
    });

    defineRegistryProperties(this, 'flow', {
      withEvents: true,
      hasBeenRegistered: flow => flow.autostart ? flow.start() : Promise.resolve(),

      /**
       * Deletes a flow from the stored flow definitions. If the flow
       * is currently running, it will be stopped first. After it
       * is stopped, it will be deleted.
       * @return {Promise} returns a promise that is fullfilled when the flow is removed
       *         or one that rejects if there is no flow for the given flowName
       */
      willBeUnregistered: flow => flow.stop().then(flow.remove())
    });

    const manager = this;

    this.addEndpoint(new SendEndpoint('stepState', this, {
      hasBeenOpened() {
          manager._stepStateChangedListener = (step, oldState, newState) => {
            this.receive({
              type: 'stepStateChanged',
              step: step.name,
              oldState: oldState,
              newState: newState
            });
          };
          manager.addListener('stepStateChanged', manager._stepStateChangedListener);
        },
        willBeClosed() {
          manager.removeListener('stepStateChanged', manager._stepStateChangedListener);
        }
    }));
  }

  /**
   * Stops execution and frees all used resources.
   * It will stop each flow.
   * Then stop all services
   * @return {Promise} that fullfills when the manager has stopped
   */
  _stop() {
    return Promise.all(Object.keys(this.flows).map(name => this.flows[name].stop())).then(super._stop());
  }
}

/*
 * creates a kronos service manager.
 * @param {array} config separated for each service
 * @param {array} modules optional array of modules to register with registerWithManager
 * @return {Promise} a promise with the service manager as its value
 */
function manager(config, modules = []) {
  const sm = new ServiceManager(config);
  return Promise.all(modules.map(m => m.registerWithManager(sm)))
    .then(() => sm.start().then(() => Promise.resolve(sm)));
}

export {
  ServiceManager,
  manager
};
