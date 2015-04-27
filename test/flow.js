/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
chai.use(require("chai-as-promised"));
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const kronos = require('../lib/manager.js');

function makePromise(flowDecls) {
	return kronos.manager({
		flows: flowDecls
	});
}

describe('declaration', function () {
	it('can be initialized', function (done) {
		const flowDecls = {
			"flow1": {
				"steps": {
					"s1": {
						"type": "copy",
						"endpoints": {
							"in": "stdin",
							"out": "step:s2/in"
						}
					},
					"s2": {
						"type": "copy",
						"endpoints": {
							"out": "stdout"
						}
					}
				}
			}
		};

		makePromise(flowDecls).then(function (manager) {
			const flow1 = manager.getFlow('flow1');

			flow1.initialize();
			assert(flow1);

			done();
		});
	});

	describe('declaration with substeps', function () {
		const flowDecls = {
			"flow2": {
				"steps": {
					"s1": {
						"type": "copy",
						"config": {
							"port": 77
						},
						"endpoints": {
							"in": "stdin",
							"out": "step:s2/in"
						}
					},
					"s2": {
						"type": "group",
						"endpoints": {
							"in": "step:steps/s2_1/in",
							"out": "step:steps/s2_2/out"
						},
						"steps": {
							"s2_1": {
								"endpoints": {
									"out": "step:s2_2/in"
								},
								"type": "copy"
							},
							"s2_2": {
								"type": "copy"
							}
						}
					}
				}
			}
		};

		it('steps should be present', function (done) {
			makePromise(flowDecls).then(function (manager) {
				const flow2 = manager.getFlow('flow2');
				assert(flow2.steps.s1.name === "s1");
				done();
			});
		});

		it('steps should have a mata object', function (done) {
			makePromise(flowDecls).then(function (manager) {
				const flow2 = manager.getFlow('flow2');
				assert(flow2.steps.s1.meta.name === "copy");
				done();
			});
		});

		it('steps config should be present', function (done) {
			makePromise(flowDecls).then(function (manager) {
				const flow2 = manager.getFlow('flow2');
				assert(flow2.steps.s1.config.port === 77);
				done();
			});
		});

		it('endpoints should be present', function (done) {
			makePromise(flowDecls).then(function (manager) {
				const flow2 = manager.getFlow('flow2');

				assert(flow2.steps.s1.endpoints.out.name === "out");
				done();
			});
		});

		it('substeps are present', function (done) {
			makePromise(flowDecls).then(function (manager) {
				const flow2 = manager.getFlow('flow2');

				assert(flow2.steps.s2.steps.s2_1.name === "s2_1");
				done();
			});
		});

		it('substeps endpoint linking is present', function (done) {
			makePromise(flowDecls).then(function (manager) {
				const flow2 = manager.getFlow('flow2');

				assert(flow2.steps.s2.endpoints.in.name === "in");
				assert(flow2.steps.s2.endpoints.out.name === "out");
				done();
			});
		});
	});
});
