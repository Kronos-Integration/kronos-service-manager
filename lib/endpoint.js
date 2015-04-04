/* jslint node: true, esnext: true */

"use strict";

const RootEndpoint = {
	toString: function () {
			return this.name;
		}
		/*  ,
			mandatory: false
		  uti : ""
		  */
};

exports.createEndpointsFromDefinition = function (endpointDefinitions) {
	const endpoints = {};

	for (let eid in endpointDefinitions) {
		const ed = endpointDefinitions[eid];
		const direction = ed.direction;
		const mandatory = ed.mandatory;
		const description = ed.description;
		const uti = ed.uti; // Uniform Type Identifier

		endpoints[eid] = Object.create(RootEndpoint, {
			name: {
				value: eid
			},
			description: {
				value: description
			},
			direction: {
				value: direction
			},
			mandatory: {
				value: mandatory
			},
			uti: {
				value: uti
			}
		});
	}
	return endpoints;
};
