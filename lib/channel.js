/* jslint node: true, esnext: true */
"use strict";

const fifo = require('fifo');

const kronosStep = require('kronos-step');
const endpointImplementation = kronosStep.endpointImplementation;

const expander = require('expression-expander');

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

	let imp1; // endpoint implementation 1
	let imp2; // endpoint implementation 2

	let outActiveIterator;
	let inPassiveGenerator;

	const exp = expander.createContext();

	/**
	 * This function returns the implementation for an 'out and active' endpoint
	 * @param impName The implementation name assigned to this
	 * @param endpoint The endpoint implementation
	 */
	function createAdapterFor_OutActive(impName, contentInfoProcessing) {
		return function (manager) {
			const channelGenerator = function* () {
				const iterator = inPassiveGenerator();
				iterator.next();

				while (true) {
					let request = yield;

					console.log(`REQUEST: ${request}`);
					// First we merge the infoProcessHash into the request.
					if (contentInfoProcessing) {

						for (let propName in contentInfoProcessing) {
							request.info[propName] = contentInfoProcessing[propName];
						}

						// then expand the new hash
						exp.properties = request.info;
						request.info = exp.expand(request.info);
					}

					iterator.next(request);
				}
			};

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
				throw new Error(`Endpoint for '${name}': Generator function expected but not there`);
			}
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
			outActiveIterator.next();
		}
	}

	// In this case we just swap the endpoints, so that the next
	// IF matches and creates the connection
	if (ep1.isInAndCanBePassive && ep2.isOutAndCanBeActive) {
		imp1 = createAdapterFor_InPassive('imp1');
		imp2 = createAdapterFor_OutActive('imp2', ep1.contentInfoProcessing);
	} else if (ep1.isOutAndCanBeActive && ep2.isInAndCanBePassive) {
		imp1 = createAdapterFor_OutActive('imp1', ep2.contentInfoProcessing);
		imp2 = createAdapterFor_InPassive('imp2');
	} else {
		throw new Error(`Not implemented`);
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
