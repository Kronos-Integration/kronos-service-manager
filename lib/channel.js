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

	// In this case we just swap the endpoints, so that the next
	// IF matches and creates the connection
	if (ep1.isInAndCanBePassive && ep2.isOutAndCanBeActive) {
		logger.debug(`In Passive & Out Active`);

		logger.debug(`Channel swap ${ep1} <> ${ep2}`);
		const t = ep1;
		ep1 = ep2;
		ep2 = t;
	}

	const exp = expression.createExpressionContext();


	exp.properties = {
		fileName: "aName"
	};


	if (ep1.isOutAndCanBeActive && ep2.isInAndCanBePassive) {
		logger.debug(`Out Active & In Passive`);

		// this is the handle where data passes between endpointA and endpointB
		let generatorObject;

		imp1 = function (manager) {
			logger.debug("Imp1: Endpoint Set");
			const myGen = function* () {
				logger.debug(`Imp1: Generator called`);
				yield * generatorObject();

        /*
        for(let request of generatorObject()) {
          exp.properties = request.info;
          request.info = exp.expand({
            someKey: "aValue",
            name: "${fileName}"
          });
          yield request;
        }
        */
			};
			return myGen();
		};

		imp2 = function (manager, aGeneratorFunction) {
			if (aGeneratorFunction === undefined) {
				throw ("Generator function expected but not there");
			}
			logger.debug("Imp2: Endpoint Set");
			generatorObject = aGeneratorFunction;
			return undefined;
		};

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
