/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const fs = require('fs');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const endpointImpl = require('../lib/endpointImplementation');

const manager = {};

describe('endpoint definition', function () {

	describe('name', function () {
		it('given name present', function () {
			const endpoint = endpointImpl.createEndpoint('e1', {});
			assert(endpoint.name === 'e1');
		});
		it('toString() is name', function () {
			const endpoint = endpointImpl.createEndpoint('e1', {});
			assert(endpoint.toString() === 'e1');
		});
	});

	describe('UTI', function () {
		it('given UTI present', function () {
			const endpoint = endpointImpl.createEndpoint('e1', {
				"uti": "public.database"
			});
			assert(endpoint.uti === 'public.database');
		});
	});

	describe('mandatority', function () {
		it('given mandatority present', function () {
			const endpoint = endpointImpl.createEndpoint('e1', {
				"mandatory": false
			});
			assert(endpoint.mandatory === false);
		});
	});

	describe('with implementation function', function () {
		function myImplementation() {}

		describe('as object', function () {
			it('implementation present', function () {
				const endpoint = endpointImpl.createEndpoint('e1', {
					implementation: myImplementation
				});
				assert(endpoint.implementation === myImplementation);
			});
		});
		describe('as direct function', function () {
			it('implementation present', function () {
				const endpoint = endpointImpl.createEndpoint('e1', myImplementation);
				assert(endpoint.implementation === myImplementation);
			});
		});
	});

	describe('with target', function () {
		describe('as object', function () {
			it('target present', function () {
				const endpoint = endpointImpl.createEndpoint('e1', {
					target: "myTarget"
				});
				assert(endpoint.target === 'myTarget');
			});
		});
		describe('as direct string', function () {
			it('target present', function () {
				const endpoint = endpointImpl.createEndpoint('e1', "myTarget");
				assert(endpoint.target === 'myTarget');
			});
		});

		describe('from prototype endpoint', function () {
			it('target present', function () {
				function myImplementation() {}

				const endpoint1 = endpointImpl.createEndpoint('e1', "file:myTarget");
				const endpoint2 = endpointImpl.createEndpoint('e1', myImplementation, endpoint1);
				assert(endpoint2.target === 'file:myTarget');
				assert(endpoint2.implementation === myImplementation);
			});
		});

	});

	describe('should have correct direction', function () {
		it('for in', function () {
			const endpoint = endpointImpl.createEndpoint('e1', {
				direction: 'in'
			});
			assert(endpoint.direction === 'in');
			assert(endpoint.isIn, "isIn");
			assert(!endpoint.isOut, "!isOut");
			assert(!endpoint.canPull, "!canPull in(push,pull)");
			assert(!endpoint.canPush, "!canPush in(push,pull)");
		});

		it('for in(pull)', function () {
			const endpoint = endpointImpl.createEndpoint('e1', {
				direction: 'in(pull)'
			});
			assert(endpoint.direction === 'in(pull)');
			assert(endpoint.isIn, "isIn when in");
			assert(endpoint.canPull, "canPull");
			assert(!endpoint.canPush, "!canPush");
		});

		it('for in(push)', function () {
			const endpoint = endpointImpl.createEndpoint('e1', {
				direction: 'in(push)'
			});
			assert(endpoint.direction === 'in(push)');
			assert(endpoint.isIn, "isIn when in");
			assert(!endpoint.canPull, "!canPull");
			assert(endpoint.canPush, "canPush");
		});

		it('for in(push,pull)', function () {
			const endpoint = endpointImpl.createEndpoint('e1', {
				direction: 'in(push,pull)'
			});
			assert(endpoint.direction === 'in(push,pull)');
			assert(endpoint.isIn, "isIn when in");
			assert(endpoint.canPull, "canPull");
			assert(endpoint.canPush, "canPush");
		});

		it('for out', function () {
			const endpoint = endpointImpl.createEndpoint('e1', {
				direction: 'out'
			});
			assert(endpoint.direction === 'out');
			assert(endpoint.isOut, "isOut when out");
		});

		it('for inout', function () {
			const endpoint = endpointImpl.createEndpoint('e1', {
				direction: 'inout'
			});
			assert(endpoint.direction === 'inout');
			assert(endpoint.isOut, "isOut when inout");
			assert(endpoint.isIn, "isIn when inout");
		});

		it('also with meta object', function () {
			const endpoint = endpointImpl.createEndpoint('e1', {
				target: 'file:/tmp/a',
				direction: 'out'
			}, endpointImpl.implementations.file);
			assert(endpoint.direction === 'out');
			assert(endpoint.isOut, "isOut when out");
			assert(!endpoint.isIn, "!isIn");
		});
	});

	describe('initialize', function () {
		const endpoint = endpointImpl.createEndpoint('e1', {
			direction: 'in',
			implementation: function (manager) {
				const name = this.name;
				const myGen = function* () {
					yield {
						info: {
							name: "<" + name + ">"
						},
						stream: "body"
					};
				};
				return myGen();
			}
		});

		let requests = endpoint.initialize(manager);

		let number = 0;
		for (let request of requests) {
			number++;
			it('should have info from endpoint coming from <this>', function () {
				assert(request.info.name === '<e1>');
			});
		}

		it('should be exatly one request', function () {
			assert(number === 1, "got one request");
		});
	});

	describe('json', function () {
		it('given name present', function () {
			const endpoint = endpointImpl.createEndpoint('e1', {});
			const json = endpoint.toJSON();
			assert(json.name === 'e1');
		});
	});

});
