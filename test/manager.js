/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
chai.use(require("chai-as-promised"));
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
const kronos = require('../lib/manager.js');

describe('service manager', function () {
	const flowDecl = {
		"myFlow": {
			"steps": {
				"s1": {
					"type": "copy",
					"config": {
						"key1": "value1"
					},
					"endpoints": {
						"in": "stdin",
						"out": function* () {
							do {
								let request =
									yield;
							} while (true);
						}
					}
				}
			}
		}
	};

	describe('buildin step implementations', function () {
		it('should be present', function (done) {
			kronos.manager().then(function (myManager) {
				const c = kronos.stepImplementation.implementations.copy;
				should.exist(c);
				expect(c.name, 'step name').to.equal('copy');
				done();
			});
		});
	});

	describe('step registration', function () {
		it('should fail with bad step dir', function () {
			const promise = kronos.manager({
				stepDirectories: 'some missing dir'
			});
			return assert.isRejected(promise, "stepDirectories");
			//return promise.should.be.rejected;
		});

	});

	describe('register flow', function () {
		it('should be present', function (done) {
			kronos.manager().then(function (myManager) {
				myManager.declareFlows(flowDecl);
				const flowName = 'myFlow';
				const flow = myManager.getFlow(flowName);
				should.exist(flow);
				expect(flow.name).to.equal(flowName);
				done();
			});
		});

		it('should be the returned one', function (done) {
			kronos.manager().then(function (myManager) {
				const f = myManager.declareFlows(flowDecl).myFlow;
				expect(f).to.equal(myManager.getFlow('myFlow'));
				done();
			});
		});


	});
});
