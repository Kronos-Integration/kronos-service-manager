/* jslint node: true, esnext: true */

"use strict";

const fs = require("fs");
const path = require("path");
const attributes = require('./attributes');

const RootEndpoint = {
	toString: function () {
		return this.name;
	}
};

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

exports.createEndpointsFromDefinition = function (endpointDefinitions) {
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

		endpoints[eid] = Object.create(defaultEndpoint, properties);
	}
	return endpoints;
};


const implementations = {};

const RootEndpointImplementation = {
	toString: function () {
		return this.name;
	}
};

/*
 * registers endpoint implementations
 */
function register(definitionns) {
	for (let e in definitionns) {
		const eDef = definitionns[e];
		const impl = eDef.implementation;

		implementations[e] = Object.create(RootEndpointImplementation, {
			name: {
				value: e
			},
			implementation: {
				value: impl
			}
		});
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
exports.implementations = implementations;
exports.defaultEndpoint = defaultEndpoint;
