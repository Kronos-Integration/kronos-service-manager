/* jslint node: true, esnext: true */

"use strict";

const endpointImpls = require("../endpointImplementation");

exports.endpointImplementations = {
	"stdin": {
		"direction": "in",
		implementation(endpointDefinition) {
			/*
			 * stdin endpoint delivers one single stdin stream
			 */
			return function* () {
				console.log("stdin provide stream");
				yield {
					info: {
						name: 'stdin'
					},
					stream: process.stdin
				};
			};
		}
	},
	"stdout": {
		"direction": "out",
		implementation() {
			return function* () {
				do {
					const request =
						yield;

					console.log(`stdout got stream: ${JSON.stringify(request.info)}: ${request.stream}`);
					try {
						request.stream.pipe(process.stdout);
					} catch (e) {
						console.log(e);
					}
				}
				while (true);
			};
		}
	},
	"stderr": {
		"direction": "out",
		implementation() {
			return function* () {
				do {
					const request =
						yield;
					request.stream.pipe(process.stderr);
				}
				while (true);
			};
		}
	}
};
