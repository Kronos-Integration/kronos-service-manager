/* jslint node: true, esnext: true */

"use strict";

const path = require('path'),
  fs = require('fs'),
  events = require('events'),
  scopeReporter = require('scope-reporter'),
  step = require('kronos-step'),
  service = require('kronos-service');


const mix = superclass => new MixinBuilder(superclass);

class MixinBuilder {
  constructor(superclass) {
    this.superclass = superclass;
  }

  with(...mixins) {
    return mixins.reduce((c, mixin) => mixin(c), this.superclass);
  }
}

class ServiceManager extends mix(service.Service).with(events.EventEmitter) {
  static get type() {
    return "kronos";
  }
  get type() {
    return ServiceManager.type;
  }

  constructor(config) {
    if (!config.scopeReporter) {
      config.scopeReporter = scopeReporter.createReporter(step.ScopeDefinitions, scopeReporter.createLoggingAdapter(
        logger));
    }

    const props = {};

    ['name', 'scopeReporter'].forEach(p => {
      if (config[p] !== undefined) {
        props[p] = {
          value: config[p];
        }
      }
    });

    Object.defineProperteis(this, props);
  }

  /**
   * Stops execution and frees all used resources.
   * It will stop each flow.
   * Then stop all services
   * @return {Promise} that fullfils to the manager
   */
  _stop() {
    return Promise.all(Object.keys(flows).map(name => flows[name].stop())).
    then(Promise.all(Object.keys(services).map(name => services[name].stop()))).
    then(Promise.resolve(manager));
  }

  //
  shutdown() {
    return this.stop();
  }

  /**
   * registers a step at the service manager. This is a step factory. The name used here
   * will be referenced from the flow. Then this stepFactory will be used to create a step instance
   * from the flow.
   *
   * @param {Step} step The step factory to be registered
   * Events:
   * 	emits 'stepRegistered' event for the newly registered step implementation
   */
  registerStep(step) {
    const name = step.name;

    if (steps[name]) {
      if (steps[name] === step) {
        return;
      }
    }

    steps[name] = step;
    this.emit('stepRegistered', step);
  }

  /**
   * Creates a step instance for a given step configuration.
   * The steps type needs to be registered before he can be referenced in
   * the step configuration.
   * @param {Object} configuration
   * @return {Step} ready for use
   * @throws if given step type is not registered
   */
  getStepInstance(configuration) {
    const stepImpl = steps[configuration.type];
    if (stepImpl) {
      return stepImpl.createInstance(this, this.scopeReporter, configuration);
    }
    throw new Error(
      `Could not find the step implementation: '${configuration.type}'.\nAvailable types are: ${Object.keys(steps).join(',')}`
    );
  };

  /**
   * Register a new flow. If it is a new flow it will just be added. If there is
   * an existing flow with this name the flow will be replaced.
   * If the flow is currently running, it will be stopped first
   *
   * Events:
   * 	emits 'flowStateChanged' event for a newly registered flow which has to be replaced
   *        'flowRegistered' event for every newly registered flow
   *
   * @param  {Step} flow The new flow to be registered
   * @return {Promise} fullfilling to the newly created flow
   */
  registerFlow(newFlow) {
    function finalize(flow) {
      if (flow.autostart) {
        return flow.start();
      }
      return Promise.resolve(flow);
    }

    if (flows[newFlow.name]) {
      // first delete old flow
      return this.deleteFlow(flows[newFlow.name].name).then(function () {
        this.emit('flowStateChanged', newFlow);
        return finalize(newFlow);
      });

    } else {
      // The flow is new
      flows[newFlow.name] = newFlow;
      this.emit('flowRegistered', newFlow);
      return finalize(newFlow);
    }
  }

  /**
   * Deletes a flow from the stored flow defenitions. If the flow
   * is currently running, it will be stopped first. After it
   * could be stopped, it will be deleted.
   * @param {string} flowName the name of the flow
   * @return {Promise} returns a promise that is fullfilled when the flow is removed
   *         or one that rejects if there is no flow for the given flowName
   */
  deleteFlow(flowName) {
    const flow = flows[flowName];

    if (flow) {
      delete flows[flowName];
      return flow.stop().then(flow.remove());
    }

    return Promise.reject(new Error(`No such flow ${flowName}`));
  }

  /**
   * Load a flow from a file
   * @param {String} fileName
   * @return {Promise} of the loaded flow
   */
  loadFlowFromFile(fileName) {
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, {
        encoding: 'utf8'
      }, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        try {
          resolve(this.registerFlow(manager.getStepInstance(JSON.parse(data))));
        } catch (err) {
          reject(err);
          return;
        }
      });
    });
  }

  registerInterceptor(interceptor) {
    const type = interceptor.type;

    if (interceptors[type]) {
      if (interceptors[type] === interceptors) {
        return;
      }
    }

    interceptors[type] = interceptor;
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
exports.manager = function (options) {
  const manager = new ServiceManager(options);
  return manager.start();
}


const serviceConfigs = options.services || {};
const name = options.name || "kronos";

// stores all the available flows
const flows = {};

// stores all the available steps
const steps = {};

// this is a general service registry.
const services = {};

// stores all the available interceptors
const interceptors = {};

// Create the manager object
const manager = Object.create(new events.EventEmitter(), {
  flows: {
    value: flows
  },
  steps: {
    value: steps
  },
  interceptors: {
    value: interceptors
  },
  services: {
    value: services
  },
});
