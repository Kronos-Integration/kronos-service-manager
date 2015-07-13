/* jslint node: true, esnext: true */

"use strict";

const expression = require('expression');

exports.defaultProgressReporter = function (output) {

	let scopeStack = [];

	const context = expression.createExpressionContext({ valueQuoter: function(str) {
		return `'${str}'`;
		}});

	function myOutput(entry) {
		function scopeToString() {
			return entry.scope.map(function (s) {
				let sp = [];
				for (let p in s.properties) {
					sp.push(`${s.properties[p]}`);
				}

				return `${s.name}:${sp.join(' ')}`;
			}).join(',');
		}

		context.properties = entry.properties;

		console.log(
			`${entry.severity}, ${scopeToString()}: ${context.expand(entry.message)}`
		);
	}

	if (!output) {
		output = myOutput;
	}

	const reporter = {
		output(entry) {},
			error(message, properties) {
				output({
					severity: 'error',
					message: message,
					properties: properties,
					scope: scopeStack
				});
			},
			warn(message, properties) {
				output({
					severity: 'warn',
					message: message,
					properties: properties,
					scope: scopeStack
				});
			},
			pushScope(name, properties) {
				scopeStack.push({
					name: name,
					properties: properties
				});
			},
			popScope() {
				scopeStack.pop();
			}
	};

	return reporter;
};
