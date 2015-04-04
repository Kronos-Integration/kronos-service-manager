/* jslint node: true, esnext: true */

"use strict";

let stepImplementation = require('../lib/stepImplementation');

var assert = require('assert');

describe('step implementation', function () {

	const si = stepImplementation.stepImplementations.copy;

	it('buildin copy step present', function () {
		assert(si.name === "copy");
	});

	it('endpoint definition present', function () {
		assert(si.endpoints.in.name === "in");
		assert(si.endpoints.in.mandatory);
		assert(si.endpoints.in.uti === 'public.data');
		assert(si.endpoints.in.direction === 'in');
	});

});
