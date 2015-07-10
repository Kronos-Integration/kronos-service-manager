/* jslint node: true, esnext: true */
"use strict";
const log4js = require('log4js');
const logger = log4js.getLogger('kronos-service-manager:channel');

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
  // swap channels to be in -> out
  if (ep1.isOut && ep2.isIn) {
    //console.log(`Channel swap ${ep1} <> ${ep2}`);
    const t = ep1;
    ep1 = ep2;
    ep2 = t;
  }

	const name = `${step1.name}/${ep1.name}->${step2.name}/${ep2.name}`;

	logger.debug(`Create Channel: ${name}`);
	/*
		console.log(`A ${ep1.direction} ${ep2.direction}`);
	  console.log(`B ${ep1.isInAndCanBePassive} ${ep2.isOutAndCanBeActive}`);
		console.log(`A ${ep1.direction} : ${ep1.isIn} ${ep1.isInAndCanBeActive} ${ep1.isInAndCanBePassive}`);
		console.log(`B ${ep2.direction} : ${ep2.isOut} ${ep2.isOutAndCanBeActive} ${ep2.isOutAndCanBePassive}`);
		console.log(`C ${ep1.isInAndCanBePassive} && ${ep2.isOutAndCanBeActive} -> ${ep1.isInAndCanBePassive && ep2.isOutAndCanBeActive}`);
	*/
	let imp1; // endpoint implementation 1
	let imp2; // endpoint implementation 2

	if (ep1.isOutAndCanBeActive && ep2.isInAndCanBePassive) {
		logger.debug(`Out Active & In Passive`);
	} else if (ep1.isInAndCanBePassive && ep2.isOutAndCanBeActive) {
		logger.debug(`In Passive & Out Active`);

		//    console.log("simple pass trough");
		// this is the handle where data passes between endpointA and endpointB
		let generatorObject;

		imp1 = function (manager, aGeneratorFunction) {
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
		logger.debug(`Else`);

		let requests = fifo();

		imp1 = function (manager) {
			const myGen = function* () {
				while (true) {
					let request = yield;

					logger.debug(`imp1: got request: ${name}: ${JSON.stringify(request.info)}`);
					requests.push(request);
				}
			};

			const go = myGen();
			go.next();
			return go;
		};

		imp2 = function (manager, genertor) {
			logger.debug(`imp2: generator: ${genertor}`);

			logger.debug(`imp2: start`);

			const myGen = function* () {
				while (true) {
					let request = requests.shift();

					logger.debug(`imp2: got request: ${JSON.stringify(request.info)}`);

					if (!request) {
						logger.debug(`provide request ${name}: *** nothing more to provide ***`);
						break;
					}

					logger.debug(`provide request ${name}: ${JSON.stringify(request.info)}`);

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
