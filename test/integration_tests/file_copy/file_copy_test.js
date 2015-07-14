/* global describe, it*/
/* jslint node: true, esnext: true */
"use strict";


const kronos = require('../../../index');
const fileReader = require('../steps/file-read');
const fileWriter = require('../steps/file-write');



const simpleFlow = {
	"fileCopy": {
		"description": "A flow with a file reader and a file writer. Just copy a file",
		"steps": {
			"reader": {
				"type": "kronos_fileReader",
				"config": {
					"fileName": 'test/fixtures/demo.txt'
				},
				"endpoints": {
					"out": "step:writer/in"
				}
			},
			"writer": {
				"type": "kronos_fileWriter",
				"config": {
					"fileName": 'test/fixtures/tmp/demo_copy.txt'
				},
				"endpoints": {
					"in": "step:reader/out",
				}
			}
		}
	}
};

kronos.manager().then(function (manager) {
	try {
		manager.registerStepImplementation("kronos_fileReader", fileReader);
		manager.registerStepImplementation("kronos_fileWriter", fileWriter);

		let flowFileCopy = manager.declareFlows(simpleFlow);
		let flowTest = kronos.flowDefinitions.fileCopy;
		flowTest.initialize(kronos);
	} catch (err) {
		console.log(err);
	}
});
