/* jslint node: true, esnext: true */
"use strict";
const log4js = require('log4js');
const logger = log4js.getLogger('kronos-service-manager:channel');
logger.setLevel(log4js.levels.ERROR);

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

	// // TODO die Idee war das diese Funktion eine vorkonfigurierte Funktion liefert
	// // Ich weis aber nicht genau wie ich sowas machen kann.
	// /**
	//  * This function creates a content info processing function
	//  * @param contentInfoProcessing The content info processing object.
	//  */
	// function createRequestProcessor(contentInfoProcessing) {
	//
	// 	const regEx = /\$\{.*?\}/;
	//
	// 	if (contentInfoProcessing) {
	// 		for (let propName in contentInfoProcessing) {
	// 			// check if a property has a conversion function
	// 			if (contentInfoProcessing[propName].match(regEx)) {
	// 				// This content info needs to be processed
	// 			} else {
	// 				// This is a fixed value
	// 			}
	// 		}
	//
	// 	}
	// }

	/**
	 * This function returns the implementation for an 'out and active' endpoint
	 * @param impName The implementation name assigned to this
	 * @param endpoint The endpoint implementation
	 */
	function createAdapterFor_OutActive(impName, contentInfoProcessing) {
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

					// First we merge the infoProcessHash into the request.
					if (contentInfoProcessing) {
						logger.debug(`Request hash before       : '${JSON.stringify(request.info)}'`);

						for (let propName in contentInfoProcessing) {
							request.info[propName] = contentInfoProcessing[propName];
						}
						logger.debug(`Request hash after merge  : '${JSON.stringify(request.info)}'`);

						// then expand the new hash
						exp.properties = request.info;
						request.info = exp.expand(request.info);

						logger.debug(`Request hash after expand : '${JSON.stringify(request.info)}'`);
					} else {
						logger.debug(`No infoProcessing hash`);
					}

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
				throw (new Error(`Endpoint for '${name}': Generator function expected but not there`));
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
		imp2 = createAdapterFor_OutActive('imp2', ep1.contentInfoProcessing);
	} else if (ep1.isOutAndCanBeActive && ep2.isInAndCanBePassive) {
		logger.debug(`Out Active & In Passive`);
		imp1 = createAdapterFor_OutActive('imp1', ep2.contentInfoProcessing);
		imp2 = createAdapterFor_InPassive('imp2');
	} else {
		throw (new Error(`Not implemented`));
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
