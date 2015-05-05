/* jslint node: true, esnext: true */

"use strict";

const fs = require("fs");
const path = require("path");
const util = require("util");
const EventEmitter = require('events').EventEmitter;

const attributes = require('./attributes');

/*
 * Template object
 */
const RootEndpoint = {
	toString: function () {
		return this.name;
	},
	toJSON: function () {
		return {
			name: this.name,
			description: this.description,
			direction: this.direction,
			mandatory: this.mandatory,
			uti: this.uti,
			target: this.target,
			transform: this.transform,
			connector: this.connector,
			contentInfo: this.contentInfo,
			implementation: this.implementation ? true : false
		};
	}
};

// creates an enpoint object
const defaultEndpoint = Object.create(RootEndpoint, {
	name: {
		value: "in"
	},
	description: {
		value: "no description given"
	},
	direction: {
		value: "in"
	},
	mandatory: {
		value: true
	},
	uti: {
		value: "public.data" // Uniform Type Identifier
	},
	target: {
		value: ""
	},
	contentInfo: {
		value: {}
	}
});

/*
 *  Creates an endpoint
 *  @param name
 *	@param metaDefinition
 *  @param endpointDefinition
 */
function createEndpoint(name, metaDefinition, endpointDefinition) {
	const properties = {};

	if (name !== metaDefinition.name) {
		properties.name = {
			value: name
		};
	}

	if (endpointDefinition) {
		if (util.isFunction(endpointDefinition)) {
			properties.implementation = {
				value: endpointDefinition
			};
		} else if (util.isString(endpointDefinition)) {
			properties.target = {
				value: endpointDefinition
			};
		} else {
			const connect = endpointDefinition.connect;
			if (connect) {
				const connector = connect.connector;
				if (connector) {
					properties.connector = {
						value: connector
					};
				}

				const transform = connect.transform;
				properties.transform = {
					value: transform
				};

				const target = connect.target;
				properties.target = {
					value: target
				};
			}

			if (endpointDefinition.direction && endpointDefinition.direction !== metaDefinition.direction) {
				properties.direction = {
					value: endpointDefinition.direction
				};
			}

			if (endpointDefinition.hasOwnProperty("mandatory") && endpointDefinition.mandatory !== metaDefinition.mandatory) {
				properties.mandatory = {
					value: endpointDefinition.mandatory
				};
			}

			if (endpointDefinition.uti && endpointDefinition.uti !== metaDefinition.uti) {
				properties.uti = {
					value: endpointDefinition.uti
				};
			}

			if (endpointDefinition.description) {
				properties.description = {
					value: endpointDefinition.description
				};
			}

			if (endpointDefinition.contentInfo) {
				const atts = attributes.createAttributesFromDefinition(endpointDefinition.contentInfo);
				properties.contentInfo = {
					value: atts
				};
			}

			if (endpointDefinition.implementation) {
				const impl = endpointDefinition.implementation;
				properties.implementation = {
					value: impl
				};
			}
		}
	}

	const e = Object.create(metaDefinition, properties);
	util.inherits(e, EventEmitter);
	return e;
}

const implementations = {};

/*
 * registers endpoint implementations
 */
function register(definitions) {
	for (let name in definitions) {
		implementations[name] = createEndpoint(name, defaultEndpoint, definitions[name]);
	}
}

const endpointsSubdir = 'endpoints';

fs.readdirSync(path.join(__dirname, endpointsSubdir)).forEach(function (
	filename) {

	if (!/\.js$/.test(filename)) return;
	const m = require('./' + path.join(endpointsSubdir,
		filename));

	register(m.endpointImplementations);
});

exports.register = register;
exports.createEndpoint = createEndpoint;
exports.implementations = implementations;
exports.defaultEndpoint = defaultEndpoint;
