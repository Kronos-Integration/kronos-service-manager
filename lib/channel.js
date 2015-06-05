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
exports.create = function (step1, ep1, step2, ep2) {

	const name = `${step1.name}/${ep1.name}->${step2.name}/${ep2.name}`;

	//console.log(`${ep1.canPull} ${ep1.canPush}  ${ep2.canPull} ${ep2.canPush}`);

	let imp1, imp2;

	if (ep1.canPull && ep2.canPull) {
		// this is the handle where data passes between endpointA and endpointB
		let generatorObject;

		imp1 = function (aGeneratorFunction) {
			generatorObject = aGeneratorFunction();
			return undefined;
		};

		imp2 = function () {
			const myGen = function* () {
				yield * generatorObject;
			};
			return myGen();
		};
	} else {
		let requests = fifo();

		imp1 = function () {
			const myGen = function* () {
				while (true) {
					let request = yield;

					//console.log(`got request: ${name}: ${JSON.stringify(request.info)}`);
					requests.push(request);
				}
			};

			const go = myGen();
			go.next();
			return go;
		};

		imp2 = function () {
			const myGen = function* () {
				while (true) {
					let request = requests.shift();

					if (!request) {
						console.log(`provide request ${name}: *** nothing more to provide ***`);
						break;
					}

					//console.log(`provide request ${name}: ${JSON.stringify(request.info)}`);

					yield request;
				}
			};
			return myGen();
		};
	}

	return Object.create(RootChannel, {
		name: {
			value: name
		},
		endpointA: {
			value: endpointImpls.createEndpoint(ep1.name, {
				description: `Channel ${name}`,
				implementation: imp1
			}, ep1)
		},
		endpointB: {
			value: endpointImpls.createEndpoint(ep2.name, {
				description: `Channel ${name}`,
				implementation: imp2
			}, ep2)
		}
	});
};
