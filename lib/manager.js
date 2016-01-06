/* jslint node: true, esnext: true */

"use strict";

const path = require('path'),
  fs = require('fs'),
  events = require('events'),
  uti = require('uti'),
  scopeReporter = require('scope-reporter'),
  step = require('kronos-step'),
  service = require('kronos-service'),
  llm = require('loglevel-mixin');

/*
 * creates a kronos service manager.
 * Options:
 *    name  - name of the manager defaults to 'kronos'
 *    logger - logger to use
 *    services - configuration for services
 * @param {Object} options
 * @return {Promise} a promise with the service manager as its value
 */
exports.manager = function (options) {
  if (!options) {
    options = {};
  }

  const serviceConfigs = options.services || {};
  const logger = options.logger || console;
  const name = options.name || "kronos";

  if (!options.scopeReporter) {
    options.scopeReporter = scopeReporter.createReporter(step.ScopeDefinitions, scopeReporter.createLoggingAdapter(
      logger));
  }

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
    interceptors: {
      value: interceptors
    },
    services: {
      value: services
    },
    scopeReporter: {
      value: options.scopeReporter
    }
  });

  llm.defineLoggerMethods(manager, llm.defaultLogLevels, function (level, arg) {
    const logevent = {
      "timestamp": Date.now(),
      "level": level,
      "manager": this.name,
    };

    if (typeof arg === 'string') {
      logevent.message = arg;
    } else {
      Object.assign(logevent, arg);
    }
    // TODO
    console.log(logevent);
  });

  llm.defineLogLevelProperties(manager, llm.defaultLogLevels, llm.defaultLogLevels[options.logLevel] || llm.defaultLogLevels
    .info);

  /**
   * Returns a service object for the given key.
   * If the service does not exists it will return undefined.
   * @param {String} serviceName The name under the service was registered.
   * @param {Function} provideIfMissing callback to deliver the missing module if it is not already present
   * @return {Service} The registered service for the given key
   */
  manager.serviceGet = function (serviceName, provideIfMissing) {
    const c = services[serviceName];
    if (c === undefined && provideIfMissing) {
      this.serviceRegister(serviceName, provideIfMissing(serviceName));
      return services[serviceName];
    }
    return c;
  };

  /**
   * Registers an service in the service manager.
   * If there is already registered under this serviceName, it will be overwritten.
   * Services can derive from already registered services.
   * values.name then references a former registered service which is used
   * as a prototype for the new service
   * @param {String} serviceName A name used to identify the service.
   * @param values The service object to be stored.
   * @return {Service} registered service
   */
  manager.serviceRegister = function (serviceOrServiceName, values) {

    if (typeof serviceOrServiceName === 'string') {
      const serviceDefaults = serviceConfigs[serviceOrServiceName];

      values = Object.assign({}, serviceDefaults, values);

      /*
            if (values && serviceDefaults) {
              values = Object.assign({}, serviceDefaults, values);
            } else if (!values) {
              values = serviceDefaults;
            }
      */

      if (values.name) {
        const baseService = this.serviceGet(values.name);
        if (baseService === null) {
          this.error(`Unable to find base service: ${values.name}`);
        }
        serviceOrServiceName = service.createService(serviceOrServiceName, values, baseService);
      } else {
        serviceOrServiceName = service.createService(serviceOrServiceName, values);
      }
    }

    services[serviceOrServiceName.name] = serviceOrServiceName;

    manager.emit('serviceRegistered', serviceOrServiceName);

    if (serviceOrServiceName.autostart) {
      serviceOrServiceName.start();
    }

    return serviceOrServiceName;
  };


  /**
   * Declares (and registers) a derived service
   * @param {String} derivedFromServiceName
   * @param {String|Object} definition
   * @return {Service} declared service
   */
  manager.serviceDeclare = function (derivedFromServiceName, definition) {
    const serviceName = typeof definition === 'string' ? definition : definition.name;

    let service = this.serviceGet(serviceName);

    if (!service) {
      const serviceConfig = Object.assign({}, definition, {
        name: derivedFromServiceName
      });

      service = this.serviceRegister(serviceName, serviceConfig);
    }

    return service;
  };

  /**
   * Deletes the service registered under the given serviceName
   * @param {String} serviceName The name identifying the service to be deleted
   */
  manager.serviceDelete = function (serviceName) {
    if (services[serviceName]) {
      services[serviceName].stop().then(
        () => {
          delete services[serviceName];
          manager.emit('serviceDeleted', serviceName);
        }
      );
    }
  };

  /**
   * registers a step at the service manager. This is a step factory. The name used here
   * will be referenced from the flow. Then this stepFactory will be used to create a step instance
   * from the flow.
   *
   * @param {Step} step The step factory to be registered
   * Events:
   * 	emits 'stepRegistered' event for the newly registered step implementation
   */
  manager.registerStep = function (step) {
    const name = step.name;

    if (steps[name]) {
      if (steps[name] === step) {
        return;
      }
    }

    steps[name] = step;
    manager.emit('stepRegistered', step);
  };

  // @Deprecated use manager.registerStep instead
  manager.registerStepImplementation = manager.registerStep;

  /**
   * Creates a step instance for a given step configuration.
   * The steps type needs to be registered before he can be referenced in
   * the step configuration.
   * @param {Object} configuration
   * @return {Step} ready for use
   * @throws if given step type is not registered
   */
  manager.getStepInstance = function (configuration) {
    const stepImpl = steps[configuration.type];
    if (stepImpl) {
      return stepImpl.createInstance(this, this.scopeReporter, configuration);
    }
    throw new Error(
      `Could not find the step implementation: '${configuration.type}'.\nAvailable types are: ${Object.keys(steps).join(',')}`
    );
  };

  manager.registerInterceptor = function (interceptor) {
    const type = interceptor.type;

    if (interceptors[name]) {
      if (interceptors[name] === interceptors) {
        return;
      }
    }

    interceptors[name] = interceptor;
  };

  /**
   * Stops execution and frees all used resources.
   * It will stop each flow.
   * Then stop all services
   * @return {Promise} that fullfils to the manager
   */
  manager.shutdown = function () {
    return Promise.all(Object.keys(flows).map(name => flows[name].stop())).
    then(Promise.all(Object.keys(services).map(name => services[name].stop()))).
    then(Promise.resolve(manager));
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
  manager.registerFlow = function (newFlow) {

    function finalize(flow) {
      if (flow.autostart) {
        return flow.start();
      }
      return Promise.resolve(flow);
    }

    if (flows[newFlow.name]) {
      // first delete old flow
      return manager.deleteFlow(flows[newFlow.name].name).then(function () {
        manager.emit('flowStateChanged', newFlow);
        return finalize(newFlow);
      });

    } else {
      // The flow is new
      flows[newFlow.name] = newFlow;
      manager.emit('flowRegistered', newFlow);
      return finalize(newFlow);
    }
  };

  /**
   * Deletes a flow from the stored flow defenitions. If the flow
   * is currently running, it will be stopped first. After it
   * could be stopped, it will be deleted.
   * @param {string} flowName the name of the flow
   * @return {Promise} returns a promise that is fullfilled when the flow is removed
   *         or one that rejects if there is no flow for the given flowName
   */
  manager.deleteFlow = function (flowName) {
    const flow = flows[flowName];

    if (flow) {
      delete flows[flowName];
      return flow.stop().then(flow.remove());
    }

    return Promise.reject(new Error(`No such flow ${flowName}`));
  };

  /**
   * Load a flow from a file
   * @param {String} fileName
   * @return {Promise} of the loaded flow
   */
  manager.loadFlowFromFile = function (fileName) {
    const manager = this;
    return new Promise(function (resolve, reject) {
      fs.readFile(fileName, {
        encoding: 'utf8'
      }, function (err, data) {
        if (err) {
          reject(err);
          return;
        }
        try {
          resolve(manager.registerFlow(manager.getStepInstance(JSON.parse(data))));
        } catch (err) {
          reject(err);
          return;
        }
      });
    });
  };

  manager.registerModules = function (moduleNames) {
    try {
      moduleNames.forEach(
        name => {
          try {
            const m = require(name);
            if (m) {
              m.registerWithManager(this);
            } else {
              this.error(`Unable to register module ${name}`);
            }
          } catch (e) {
            this.error(`Unable to register module ${name} ${e}`);
          }
        });
    } catch (e) {
      this.error(`Unable to register modules: ${e}`);
    }
  };

  return uti.initialize({
    definitionFileName: path.join(__dirname, '..', 'uti.json')
  }).then(uti => Promise.resolve(manager));
};
