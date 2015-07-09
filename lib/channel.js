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

/*
	console.log(`A ${ep1.direction} ${ep2.direction}`);
  console.log(`B ${ep1.isInAndCanBePassive} ${ep2.isOutAndCanBeActive}`);
	console.log(`A ${ep1.direction} : ${ep1.isIn} ${ep1.isInAndCanBeActive} ${ep1.isInAndCanBePassive}`);
	console.log(`B ${ep2.direction} : ${ep2.isOut} ${ep2.isOutAndCanBeActive} ${ep2.isOutAndCanBePassive}`);
	console.log(`C ${ep1.isInAndCanBePassive} && ${ep2.isOutAndCanBeActive} -> ${ep1.isInAndCanBePassive && ep2.isOutAndCanBeActive}`);
*/
	let imp1, imp2;

	if (ep1.isInAndCanBePassive && ep2.isOutAndCanBeActive) {
//    console.log("simple pass trough");
		// this is the handle where data passes between endpointA and endpointB
		let generatorObject;

		imp1 = function (manager,aGeneratorFunction) {
			generatorObject = aGeneratorFunction();
			return undefined;
		};

		imp2 = function (manager) {
			const myGen = function* () {
				yield * generatorObject;
			};
			return myGen();
		};
	} else {
		let requests = fifo();

		imp1 = function (manager) {
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

		imp2 = function (manager) {
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
