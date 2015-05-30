/* jslint node: true, esnext: true */

"use strict";

const path = require("path");
const promisify = require("promisify-node");
const fsp = promisify("fs");

const endpointImpl = require("./endpointImplementation");
const attributes = require('./attributes');

const logLevels = {
	'trace': {
		name: 'trace',
		priority: 10000
	},
	'debug': {
		name: 'debug',
		priority: 1000
	},
	'info': {
		name: 'info',
		priority: 100
	},
	'warn': {
		name: 'warn',
		priority: 10
	},
	'error': {
		name: 'error',
		priority: 1
	}
};

// Template object
const RootStepImplementation = {
	toString() {
			return this.name;
		},
		toJSON() {
			return {
				name: this.name,
				endpoints: this.endpoints,
				config: this.config,
				steps: this.steps
			};
		},

		get logLevelPriority() {
			return logLevels.info.priority;
		},

		log(level, data, formater) {
			if (level.priority >= this.logLevelPriority) {
				console.log(`${level.name} ${formater} : ${JSON.stringify(data)}`);
			}
		},
		info(data, formater) {
			this.log(logLevels.info, data, formater);
		},
		error(data, formater) {
			this.log(logLevels.error, data, formater);
		},
		warn(data, formater) {
			this.log(logLevels.warn, data, formater);
		},
		debug(data, formater) {
			this.log(logLevels.debug, data, formater);
		},
		trace(data, formater) {
			this.log(logLevels.trace, data, formater);
		},

		/**
		 * adds or overwrites a endpoint
		 * @param endpoint the endpoint to add
		 */
		addEndpoint(endpoint) {
			this.endpoints[endpoint.name] = endpoint;
		}
};

/*
  Endpoints predefined for all steps
 */
const predefinedEndpoints = {
	"log": endpointImpl.createEndpoint("log", {
		"description": "logging endpoint all logging goes through this endpoint",
		"direction": "out(push)"
	})
};


/**
 * registerSteps - registers a step implementation
 *
 * @param  {object} registeredSteps registration hash
 * @param  {object} impls a hash of step implementations
 * @return {type} array of the newly registered step implemenetations
 */
function registerSteps(registeredSteps, impls) {

	const newlyRegisteredSteps = [];

	// iterate over the given implementations
	for (let sin in impls) {

		// get an implementation for the stepName
		const si = impls[sin];

		// get the initialize function
		const initialize = si.initialize;

		// get the sonfig description for the step
		const config = si.config;

		const endpoints = {};

		if (si.endpoints) {
			for (let eid in si.endpoints) {
				endpoints[eid] = endpointImpl.createEndpoint(eid, si.endpoints[eid]);
			}
		}

		// add missing predefined endpoints
		for (let p in predefinedEndpoints) {
			if (endpoints[p] === undefined)
				endpoints[p] = predefinedEndpoints[p];
		}

		// store the data as real properties to build an object
		const properties = {
			name: {
				value: sin
			},
			endpoints: {
				value: endpoints
			},
			initialize: {
				value: initialize
			}
		};

		if (si.description) {
			const description = si.description;
			properties.description = {
				value: description
			};
		}

		if (config) {
			const atts = attributes.createAttributesFromDefinition(config);
			properties.config = {
				value: atts
			};
		}

		// create a step object
		const newStep = Object.create(RootStepImplementation, properties);
		registeredSteps[sin] = newStep;
		newlyRegisteredSteps.push(newStep);
	}

	return newlyRegisteredSteps;
}

/**
 * registers steps from a list of directories with js files inside.
 * @param {string or Array} dirs array (or scalar) of directories to search for js files
 * @return {Promise} array of registered steps as the resolved value
 */
function registerStepsFromDirs(registeredSteps, dirs) {

	if (!Array.isArray(dirs)) {
		dirs = [dirs];
	}

	const promisesOfDirectories = [];

	dirs.forEach(function (dir) {
		promisesOfDirectories.push(fsp.readdir(dir));
	});

	const steps = [];

	return new Promise(function (resolve, reject) {
		Promise.all(promisesOfDirectories).then(function (arrayOfFilenames) {
			for (let i = 0; i < dirs.length; i++) {
				const dir = dirs[i];

				arrayOfFilenames[i].forEach(function (filename) {
					if (/\.js$/.test(filename)) {
						const m = require(path.join(dir, filename));

						steps.push(registerSteps(registeredSteps, m.stepImplementations));
					}
				});
			}

			resolve(steps);
		}, reject);
	});
}

exports.RootStepImplementation = RootStepImplementation;
exports.registerSteps = registerSteps;
exports.registerStepsFromDirs = registerStepsFromDirs;
