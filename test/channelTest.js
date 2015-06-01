/* global describe, it, beforeEach */
/* jslint node: true, esnext: true */

"use strict";

const channel = require('../lib/channel');
const endpointImpls = require('../lib/endpointImplementation');
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

describe('pull/pull channel creation', function () {
	let es;
	let chl;

	beforeEach(function () {
		es = {
			"input": endpointImpls.createEndpoint("input", {
				direction: "in(pull)"
			}),
			"output": endpointImpls.createEndpoint("output", {
				direction: "out(pull)"
			})
		};

		chl = channel.create({
			name: "a"
		}, es.input, {
			name: "b"
		}, es.output);
	});

	it('endpoints created', function () {
		assert(chl.endpointA);
		assert(chl.endpointB);
	});

	it('has a name', function () {
		assert(chl.name === 'a/input->b/output');
	});

	it('requests passing through', function () {
		const output = chl.endpointA.initialize(requestGenerator);
		const input = chl.endpointB.initialize();

		let i = 1;

		for (let request of input) {
			//console.log(`got: ${JSON.stringify(request)}`);

			assert(request.info.name === `send from output #${i}`, `#${i} info attributes present`);
			assert(request.stream === `a stream ${i}`, `stream ${i} present`);
			i++;
			if (i > 5) break;
		}
	});

});
