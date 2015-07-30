/* jslint node: true, esnext: true */
"use strict";
const log4js = require('log4js');
const logger = log4js.getLogger('kronos-service-manager:channel');
//logger.setLevel(log4js.levels.ERROR);

const fifo = require('fifo');

const kronosStep = require('kronos-step');
const endpointImplementation = kronosStep.endpointImplementation;

const expression = require('expression');

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
	logger.debug(`Create Channel: ${name}`);

	let imp1; // endpoint implementation 1
	let imp2; // endpoint implementation 2

	let outActiveIterator;
	let inPassiveGenerator;

	const exp = expression.createExpressionContext();


	/**
	 * This function returns the implementation for an 'out and active' endpoint
	 * @param impName The implementation name assigned to this
	 */
	function createAdapterFor_OutActive(impName) {
		return function (manager) {
			logger.debug(`${impName}: Endpoint Set '${name}'`);

			const channelGenerator = function* () {
				logger.debug(`${impName}: Initialize iterator '${name}'`);
				let iterator = inPassiveGenerator();
				iterator.next();
				logger.debug(`${impName}: Iterator initialized '${name}'`);

				while (true) {
					logger.debug(`${impName}: Generator called '${name}'`);

					let request = yield;

					//logger.debug(`Imp1: Got request ${JSON.stringify(request)}`);
					// // Weis nicht wie das gehe soll
					// exp.properties = request.info;
					// request.info = exp.expand(request.info);

					logger.debug(`${impName}: Transport the request to next. '${name}'`);
					iterator.next(request);

				}
			};

			logger.debug(`${impName}: Generator created '${name}'`);
			outActiveIterator = channelGenerator();
			initializeGenerator();

			return outActiveIterator;
		};

	}

	/**
	 * This function returns the implementation for an 'out and active' endpoint
	 * @param impName The implementation name assigned to this
	 */
	function createAdapterFor_InPassive(impName) {
		return function (manager, aGeneratorFunction) {
			if (aGeneratorFunction === undefined) {
				throw (`Endpoint for '${name}': Generator function expected but not there`);
			}
			logger.debug(`${impName}: Endpoint Set '${name}'`);
			inPassiveGenerator = aGeneratorFunction;

			initializeGenerator();

			return undefined;
		};
	}

	/*
	 * This function initialize the channel iterator after both sides of the channel are set.
	 * It will be called after each entpoint is created, but only if both are finished
	 * it will initialize it.
	 */
	function initializeGenerator() {
		if (inPassiveGenerator && outActiveIterator) {
			logger.debug(`Initialize the ChannelIterator for ${name}`);
			outActiveIterator.next();
		}
	}



	// In this case we just swap the endpoints, so that the next
	// IF matches and creates the connection
	if (ep1.isInAndCanBePassive && ep2.isOutAndCanBeActive) {
		logger.debug(`In Passive & Out Active`);
		imp1 = createAdapterFor_InPassive('imp1');
		imp2 = createAdapterFor_OutActive('imp2');
	} else if (ep1.isOutAndCanBeActive && ep2.isInAndCanBePassive) {
		logger.debug(`Out Active & In Passive`);
		imp1 = createAdapterFor_OutActive('imp1');
		imp2 = createAdapterFor_InPassive('imp2');
	} else if (ep1.isOutAndCanBePassive && ep2.isInAndCanBeActive) {
		logger.debug(`Out Passive & In Active`);
		throw (`Out Passive & In Active`);
	} else if (ep1.isInAndCanBeActive && ep2.isOutAndCanBePassive) {
		logger.debug(`In Active & Out Passive`);
		throw (`In Active & Out Passive`);
	} else if (ep1.isInAndCanBeActive && ep2.isOutAndCanBeActive) {
		throw (`In Active & Out Active`);
	} else if (ep1.isInAndCanBePassive && ep2.isOutAndCanBePassive) {
		logger.debug(`In Passive & Out Passive`);
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

		imp2 = function (manager, generator) {
			logger.debug(`imp2: generator: ${generator}`);

			logger.debug(`imp2: start`);

			const myGen = function* () {
				while (true) {
					let request = requests.shift();

					logger.debug(`imp2: got request: ${JSON.stringify(request.info)}`);

					if (!request) {
						logger.debug(`provide request ${name}: *** nothing more to provide ***`);
						break;
					}

					//exp.properties = { fileName: "aName" };
					exp.properties = request.info;
					// ep2.contentInfo
					request.info = exp.expand({
						someKey: "aValue",
						name: "${fileName}"
					});

					logger.debug(`provide request ${name}: ${JSON.stringify(request.info)}`);

					yield request;
				}
			};
			return myGen();
		};
	} else {
		throw (`No channel for directions '${ep1.direction}' '${ep2.direction}'`);
	}

	return Object.create(RootChannel, {
		name: {
			value: name
		},
		endpointA: {
			value: kronosStep.createEndpoint(ep1.name, {
				description: `Channel ${name}`,
				implementation: imp1
			}, ep1)
		},
		endpointB: {
			value: kronosStep.createEndpoint(ep2.name, {
				description: `Channel ${name}`,
				implementation: imp2
			}, ep2)
		}
	});
};
