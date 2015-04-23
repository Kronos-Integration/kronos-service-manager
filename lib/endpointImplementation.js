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
			value: this.value,
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
	value: {
		value: ""
	},
	contentInfo: {
		value: {}
	}
});


/**
 * createEndpointsFromDefinition - Creates an endpoint from the given endPointDefinition
 *
 * @param  {type} endpointDefinitions description
 * @return {type}                     description
 */
function createEndpointsFromDefinition(endpointDefinitions) {
	const endpoints = {};

	for (let eid in endpointDefinitions) {
		const ed = endpointDefinitions[eid];

		var properties = {};

		if (eid !== defaultEndpoint.name) {
			properties.name = {
				value: eid
			};
		}
		if (ed.direction && ed.direction !== defaultEndpoint.direction) {
			properties.direction = {
				value: ed.direction
			};
		}
		if (ed.hasOwnProperty("mandatory") && ed.mandatory !== defaultEndpoint.mandatory) {
			properties.mandatory = {
				value: ed.mandatory
			};
		}
		if (ed.uti && ed.uti !== defaultEndpoint.uti) {
			properties.uti = {
				value: ed.uti
			};
		}
		if (ed.description) {
			properties.description = {
				value: ed.description
			};
		}
		if (ed.contentInfo) {
			const atts = attributes.createAttributesFromDefinition(ed.contentInfo);
			properties.contentInfo = {
				value: atts
			};
		}
		if (ed.implementation) {
			const impl = ed.implementation;
			properties.implementation = {
				value: impl
			};
		}

		endpoints[eid] = Object.create(defaultEndpoint, properties);

		util.inherits(endpoints[eid], EventEmitter);
	}
	return endpoints;
}

const implementations = {};

/*
 * registers endpoint implementations
 */
function register(definitions) {
	const impls = createEndpointsFromDefinition(definitions);

	for (let e in impls) {
		implementations[e] = impls[e];
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
exports.createEndpointsFromDefinition = createEndpointsFromDefinition;
exports.implementations = implementations;
exports.defaultEndpoint = defaultEndpoint;
