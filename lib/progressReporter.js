/* jslint node: true, esnext: true */

"use strict";

const expression = require('expression');

exports.defaultProgressReporter = function (output) {

	let scopeStack = [];

	const context = expression.createExpressionContext({ valueQuoter: function(str) {
		return `'${str}'`;
		},
		evaluate: function(e) {
			let v;

			for(let i in scopeStack) {
				const s = scopeStack[i];
				if(v = s.properties[e]) {
					return v;
				}
			}

			return undefined;
		}
		});

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
				this.pushScope('',properties);
				output({
					severity: 'error',
					message: message,
					properties: properties,
					scope: scopeStack
				});
				this.popScope();
			},
			warn(message, properties) {
				this.pushScope('',properties);
				output({
					severity: 'warn',
					message: message,
					properties: properties,
					scope: scopeStack
				});
				this.popScope();
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
