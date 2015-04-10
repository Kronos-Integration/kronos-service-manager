/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const channel = require('../lib/channel');
const endpointImpls = require('../lib/endpointImplementation');
const assert = require('assert');

describe('channel creation', function () {
	const es = endpointImpls.createEndpointsFromDefinition({
		"src": {},
		"dst": {}
	});

	const ecs = channel.create(es.src, es.dst);

	it('endpoints created', function () {
		assert(ecs.length === 2);
	});
});
