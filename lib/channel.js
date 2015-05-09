/* jslint node: true, esnext: true */

"use strict";

const fifo = require('fifo');
const endpointImpls = require("./endpointImplementation");


/**
 *  Template for the Channel object
 */
const RootChannel = {
	toString() {
		return this.name;
	}
};

/*
 * create two endpoints glued together to form a channel
 * @return array with the two channles
 */
function create(ep1, ep2) {
	let requests = fifo();

	const name = `${ep1.name}-${ep2.name}`;

	const outImpl = function* () {
		while (true) {
			let request =
				yield;

			console.log(`got request: ${name}: ${JSON.stringify(request.info)}`);
			requests.push(request);
		}
	};

	ep1 = endpointImpls.createEndpoint(ep1.name, {
		description: `Channel from ${ep1.name} to ${ep2.name}`,
		implementation: outImpl
	}, ep1);

	ep2 = endpointImpls.createEndpoint(ep2.name, {
		description: `Channel from ${ep2.name} to ${ep1.name}`,
		implementation: function* () {
			while (true) {
				let request = requests.shift();

				if (!request) {
					console.log(`provide request ${name}: *** nothing more to provide ***`);
					break;
				}

				console.log(`provide request ${name}: ${JSON.stringify(request.info)}`);

				yield request;
			}
		}
	}, ep2);

	return Object.create(RootChannel, {
		name: {
			value: name
		},
		endpointA: {
			value: ep1
		},
		endpointB: {
			value: ep2
		}
	});
}

exports.create = create;
