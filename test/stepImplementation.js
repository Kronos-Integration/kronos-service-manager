/* jslint node: true, esnext: true */

"use strict";

let stepImplementation = require('../lib/stepImplementation');

var assert = require('assert');

describe('step implementation', function () {

	const si = stepImplementation.stepImplementations.copy;

	it('buildin copy step present', function () {
		assert(si.name === "copy");
	});

	it('endpoint definition - in', function () {
		assert(si.endpoints.in.name === "in");
	});

	it('endpoint definition defaults - in', function () {
		assert(si.endpoints.in.mandatory);
		assert(si.endpoints.in.uti === 'public.data');
		assert(si.endpoints.in.direction === 'in');
	});

	it('endpoint definition - out', function () {
		assert(si.endpoints.out.name === "out");
		assert(si.endpoints.out.direction === 'out');
	});

	it('endpoint definition defaults - out', function () {
		assert(si.endpoints.out.uti === 'public.data');
		assert(si.endpoints.out.mandatory);
	});

});
