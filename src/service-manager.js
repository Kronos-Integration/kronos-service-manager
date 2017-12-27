import {
  ServiceProviderMixin,
  InterceptorProviderMixin,
  Service
} from 'kronos-service';
import { StepProviderMixin } from 'kronos-step';
import { FlowProviderMixin } from 'kronos-flow';
import { createAttributes, mergeAttributes } from 'model-attributes';
import { SendEndpoint } from 'kronos-endpoint';

import FlowSupportMixin from './flow-support-mixin';

export class ServiceManager extends FlowSupportMixin(
  ServiceProviderMixin(
    FlowProviderMixin(StepProviderMixin(InterceptorProviderMixin(Service)))
  )
) {
  /**
   * @return {string} 'kronos'
   */
  static get name() {
    return 'kronos';
  }

  static get configurationAttributes() {
    return mergeAttributes(
      createAttributes({
        id: {
          description: 'node id in the cluster',
          type: 'string',
          default: 'kronos',
          needsRestart: true
        }
      }),
      Service.configurationAttributes
    );
  }

  constructor(config) {
    super(config);

    defineRegistryProperties(this, 'interceptor', {
      withCreateInstance: true,
      factoryType: 'new'
    });

    const manager = this;

    this.addEndpoint(
      new SendEndpoint('stepState', this, {
        hasBeenOpened() {
          manager._stepStateChangedListener = (step, oldState, newState) => {
            this.receive({
              type: 'stepStateChanged',
              step: step.name,
              oldState: oldState,
              newState: newState
            });
          };
          manager.addListener(
            'stepStateChanged',
            manager._stepStateChangedListener
          );
        },
        willBeClosed() {
          manager.removeListener(
            'stepStateChanged',
            manager._stepStateChangedListener
          );
        }
      })
    );
  }

  /**
   * Stops execution and frees all used resources.
   * It will stop each flow.
   * Then stop all services
   * @return {Promise} that fullfills when the manager has stopped
   */
  _stop() {
    return Promise.all(
      Object.keys(this.flows).map(name => this.flows[name].stop())
    ).then(super._stop());
  }
}

/**
 * creates a kronos service manager.
 * @param {object[]} config separated for each service
 * @param {string[]} [modules] modules to register with registerWithManager
 * @return {Promise} a promise with the service manager as its value
 */
export function manager(config, modules = []) {
  const sm = new ServiceManager(config);
  return Promise.all(modules.map(m => m.registerWithManager(sm))).then(() =>
    sm.start().then(() => Promise.resolve(sm))
  );
}
