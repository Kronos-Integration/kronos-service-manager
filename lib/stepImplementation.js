/* jslint node: true, esnext: true */

"use strict";

const path = require("path");
const promisify = require("promisify-node");
const fsp = promisify("fs");

const endpointImpl = require("./endpointImplementation");
const attributes = require('./attributes');

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

		log(data, level, formater) {
			// TODO
			console.log(`${level} ${formater} : ${JSON.stringify(data)}`);
		},
		info(data, formater) {
			this.log(data, 'info', formater);
		},
		error(data, formater) {
			this.log(data, 'error', formater);
		},
		warn(data, formater) {
			this.log(data, 'warn', formater);
		},
		debug(data, formater) {
			this.log(data, 'debug', formater);
		},
		trace(data, formater) {
			this.log(data, 'trace', formater);
		}
};

/*
  Endpoints predefined for all steps
 */
const predefinedEndpoints = {
	"log": endpointImpl.createEndpoint("log", endpointImpl.defaultEndpoint, {
		"description": "logging endpoint all logging goes through this endpoint",
		"direction": "out"
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
				endpoints[eid] = endpointImpl.createEndpoint(eid, endpointImpl.defaultEndpoint, si.endpoints[eid]);
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

	return new Promise(function (resolve) {
		Promise.all(promisesOfDirectories).then(function (arrayOfFilenames) {
			for (let i = 0; i < dirs.length; i++) {
				const dir = dirs[i];
				const filenames = arrayOfFilenames[i];
				for (let j = 0; j < filenames.length; j++) {
					const filename = filenames[j];
					if (/\.js$/.test(filename)) {
						const m = require(path.join(dir, filename));

						//console.log(`${dir} ${filename} : ${JSON.stringify(m.stepImplementations)}`);

						steps.push(registerSteps(registeredSteps, m.stepImplementations));
					}
				}
			}
			//console.log(`resolve : ${JSON.stringify(steps)}`);

			resolve(steps);
		});
	});
}

exports.RootStepImplementation = RootStepImplementation;
exports.registerSteps = registerSteps;
exports.registerStepsFromDirs = registerStepsFromDirs;
