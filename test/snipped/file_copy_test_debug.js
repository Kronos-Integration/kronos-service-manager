/* global describe, it*/
/* jslint node: true, esnext: true */
"use strict";

const kronos = require('../../index');
const fileReader = require('../integration_tests/steps/file-read');
const fileWriter = require('../integration_tests/steps/file-write');

const path = require('path');

const sourceFileName = path.join(__dirname, '../integration_tests/file_copy/fixtures/demo.txt');
const destFileName = path.join(__dirname, '../integration_tests/file_copy/result/demo_copy.txt');

const testFlow = {
	"fileCopy": {
		"description": "A flow with a file reader and a file writer. Just copy a file",
		"steps": {
			"reader": {
				"type": "kronos_fileReader",
				"config": {
					"fileName": sourceFileName
				},
				"endpoints": {
					"out": "step:writer/in"
				}
			},
			"writer": {
				"type": "kronos_fileWriter",
				"config": {
					"fileName": destFileName
				},
				"endpoints": {
					"in": "step:reader/out",
				}
			}
		}
	}
};



kronos.manager().then(function (manager) {
		manager.registerStepImplementation("kronos_fileReader", fileReader);
		manager.registerStepImplementation("kronos_fileWriter", fileWriter);

		let flowFileCopy = manager.declareFlows(testFlow);
		let flowTest = manager.flowDefinitions.fileCopy;
		flowTest.initialize(manager);
	},
	function (err) {
		console.log(err);
	}
);
