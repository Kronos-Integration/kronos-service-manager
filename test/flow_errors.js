/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const flow = require('../lib/flow');
const progressReporter = require('../lib/progressReporter');
const assert = require('assert');

describe('flow declaration endpoint missing error handling', function () {
	let progressEntries = [];

	let myFlow = flow.create({
		"name": "myFlow",
		"steps": {
			"s1": {
				"type": "copy"
			}
		}
	}, progressReporter.defaultProgressReporter(function (entry) {
		progressEntries.push(entry);
	}));

	//console.log(`${JSON.stringify(progressEntries)}`);

	it('progress entries should be filled with error', function () {
		assert(progressEntries.length !== 0);
		const pe = progressEntries[0];
		assert(pe.severity === 'error');
		assert(pe.properties.endpoint === 'in');
		assert(pe.message === 'Mandatory ${endpoint} not defined');
	});

	it('error entry should have scope', function () {
		const pe = progressEntries[0];
		assert(pe.scope[0].name === 'flow');
		assert(pe.scope[0].properties.flow === 'myFlow');
		//assert(pe.scope[1].name === 'step');
		//assert(pe.scope[1].properties.step === 's1');
	});
});


describe('flow declaration step type error handling', function () {
	let progressEntries = [];

	let myFlow = flow.create({
		"name": "myFlow",
		"steps": {
			"s1": {
				"type": "copy2",
				"endpoints": {
					"in": "stdin",
					"out": "stdout"
				}
			}
		}
	}, progressReporter.defaultProgressReporter(function (entry) {
		progressEntries.push(entry);
	}));

	it('progress entries should be filled with error', function () {
		assert(progressEntries.length !== 0);
		const pe = progressEntries[0];
		assert(pe.severity === 'error');
		assert(pe.properties.type === 'copy2');
		assert(pe.message === 'Step ${type} implementation not found');
	});

	it('error entry should have scope', function () {
		const pe = progressEntries[0];
		assert(pe.scope[0].name === 'flow');
		assert(pe.scope[0].properties.flow === 'myFlow');
		assert(pe.scope[1].name === 'step');
		assert(pe.scope[1].properties.step === 's1');
	});
});
