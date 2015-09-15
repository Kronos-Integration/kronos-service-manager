/* global describe, xdescribe, it, xit, beforeEach */
/* jslint node: true, esnext: true */

"use strict";

const kronosStep = require('kronos-step');

const channel = require('../lib/channel');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const requestGenerator = function* () {
	for (let i = 1;; i++) {
		yield {
			info: {
				name: `send from output #${i}`
			},
			stream: `a stream ${i}`
		};
	}
};

const manager = {};

describe('channel', function () {
	describe('in(passive) -> out(active)', function () {
		let es;
		let chl;

		beforeEach(function () {
			es = {
				"input": kronosStep.createEndpoint("input", {
					direction: "in(passive)"
				}),
				"output": kronosStep.createEndpoint("output", {
					direction: "out(active)"
				})
			};

			chl = channel.create({
				name: "a"
			}, es.input, {
				name: "b"
			}, es.output);
		});

		xit('has endpoints', function () {
			assert.isDefined(chl.endpointA);
			assert.isDefined(chl.endpointB);
		});

		xit('has a name', function () {
			assert.equal(chl.name, 'a/input->b/output');
		});

		xit('requests passing through generator', function () {
			chl.endpointA.initialize(manager, requestGenerator);
			const input = chl.endpointB.initialize(manager);

			console.log(`endpointB ${input}`);

			let i = 1;

			for (let request of input) {
				console.log(`got: ${JSON.stringify(request)}`);

				assert(request.info.name === `send from output #${i}`, `#${i} info attributes present`);
				assert(request.stream === `a stream ${i}`, `stream ${i} present`);
				i++;
				if (i > 5) break;
			}
		});
	});

	describe('in(passive) -> out(passive)', function () {
		let es;
		let chl;

		beforeEach(function () {
			es = {
				"input": kronosStep.createEndpoint("input", {
					direction: "in(passive)"
				}),
				"output": kronosStep.createEndpoint("output", {
					direction: "out(passive)"
				})
			};

			chl = channel.create({
				name: "a"
			}, es.input, {
				name: "b"
			}, es.output);
		});

		xit('has endpoints', function () {
			assert.isDefined(chl.endpointA);
			assert.isDefined(chl.endpointB);
		});

		xit('has a name', function () {
			assert.equal(chl.name, 'a/input->b/output');
		});

		xit('requests passing through generator', function () {
			const input = chl.endpointA.initialize(manager);

			let i;

			for (i = 1; i < 10; i++) {
				input.next({
					info: {
						name: `send from output #${i}`
					},
					stream: `a stream ${i}`
				});
			}

			const output = chl.endpointB.initialize(manager);

			i = 1;

			for (let request of output) {
				//console.log(`got: ${JSON.stringify(request)}`);

				assert(request.info.name === `send from output #${i}`, `#${i} info attributes present`);
				assert(request.stream === `a stream ${i}`, `stream ${i} present`);
				i++;
				if (i > 5) break;
			}
		});
	});
});
