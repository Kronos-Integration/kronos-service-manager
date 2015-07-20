/* global describe, it, beforeEach */
/* jslint node: true, esnext: true */

"use strict";

const kronosStep = require('kronos-step');
//const endpointImpls = kronosStep.endpointImplementation;

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

let es;
let chl;

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

chl.endpointA.initialize(manager, requestGenerator);
const input = chl.endpointB.initialize(manager);

let i = 1;

for (let request of input) {
	//console.log(`got: ${JSON.stringify(request)}`);

	console.log(request);

	// assert(request.info.name === `send from output #${i}`, `#${i} info attributes present`);
	// assert(request.stream === `a stream ${i}`, `stream ${i} present`);
	i++;
	if (i > 5) break;
}
