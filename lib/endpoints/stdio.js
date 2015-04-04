/* jslint node: true, esnext: true */

"use strict";

exports.endpointImplementations = {
	"stdin": function (endpointDefinition) {

		/*
		 * stdin endpoint delivers one stdin stream
		 */
		return function* () {
			yield {
				info: {
					name: 'stdin'
				},
				stream: process.stdin
			};
		};
	},
	"stdout": function (endpointDefinition) {
		return function* () {
			do {
				let connection =
					yield;
				connection.stream.pipe(process.stdin);
				console.log(
					`stdout info: ${JSON.stringify(connection.info)}`);
			}
			while (true);
		};
	},
	"stderr": function (endpointDefinition) {
		return function* () {
			do {
				let connection =
					yield;
				connection.stream.pipe(process.stderr);
				console.log(
					`stderr info: ${JSON.stringify(connection.info)}`);
			}
			while (true);
		};
	}
};
