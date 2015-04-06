/* jslint node: true, esnext: true */

"use strict";

const stepImpl = require("./stepImplementation");
const endpointImpl = require("./endpointImplementation");

const RootStepOrFlow = {
	toString: function () {
		return this.name;
	}
};

const RootEndpoint = {
	toString: function () {
		return this.name;
	}
};


exports.create = function (definition) {
	const name = definition.name;
	const steps = {};

	for (let sid in definition.steps) {
		let sd = definition.steps[sid];
		const config = sd.config;
		const si = stepImpl.implementations[sd.type];

		if (!si) {
			console.log(`stepImplementation not found: ${sd.type}`);
		}

		const endpoints = {};
		for (let eid in sd.endpoints) {
			let ed = sd.endpoints[eid];
			let ied = si.endpoints[eid];
			let properties = {};

			if (typeof (ed) === "function") {
				properties.implementation = {
					value: ed
				};
			} else {
				properties.value = {
					value: ed
				};
				properties.counterpart = {
					value: ed
				};
			}

			let e = Object.create(ied, properties);

			endpoints[eid] = e;
		}

		const myStep = Object.create(RootStepOrFlow, {
			name: {
				value: sid
			},
			endpoints: {
				value: endpoints
			},
			config: {
				value: config
			},
			implementation: {
				value: si
			}
		});

		steps[sid] = myStep;
	}

	for (let sid in steps) {
		let step = steps[sid];
		for (let e in step.endpoints) {
			let ed = step.endpoints[e];

			if (ed.implementation) {
				break;
			}

			let m;

			if ((m = ed.value.match(/step:([^\/]+)\/(.+)/))) {
				let csid = m[1];
				let ceid = m[2];
				let cs = steps[csid];
				if (cs) {
					let c = cs.endpoints[ceid];
					if (c) {
						c = Object.create(c, {
							counterpart: {
								value: ed
							}
						});
						cs.endpoints[ceid] = c;
					} else {
						c = Object.create(RootEndpoint, {
							name: {
								value: ceid
							},
							counterpart: {
								value: ed
							},
							value: {
								value: `step:${step.name}/${ed.name}`
							}
						});
						cs.endpoints[ceid] = c;
					}
					break;
					//console.log(ed.counterpart + " " + csid + " " + ceid + " -> " + c);
				} else {
					// TODO ERROR
					console.log(`Unknown step: ${csid} in flow ${name}`);
				}
			}

			m = ed.value.match(/^([a-z][a-z0-9_]*):?(.*)/);

			if (m) {
				const scheme = m[1];
				//console.log(`scheme: ${scheme} ${m[2]}`);

				let ei = endpointImpl.implementations[scheme];
				if (ei) {
					const eimpl = ei.implementation(ed);

					step.endpoints[e] = Object.create(ed, {
						implementation: {
							value: eimpl
						}
					});

				} else {
					console.log(`no implementation for endpoint ${ed.value}`);
				}
			}
		}
	}

	const myFlow = Object.create(RootStepOrFlow, {
		name: {
			value: name
		},
		steps: {
			value: steps
		}
	});

	return myFlow;
};
