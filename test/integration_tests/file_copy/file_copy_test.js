/* global describe, it*/
/* jslint node: true, esnext: true */
"use strict";

const chai = require('chai');
chai.use(require("chai-as-promised"));
const assert = chai.assert;
const should = chai.should();

const compare = require('file-compare');

const kronos = require('../../../index');
const fileReader = require('../steps/file-read');
const fileWriter = require('../steps/file-write');

const path = require('path');

const sourceFileName = path.join(__dirname, 'fixtures/demo.txt');
const destFileName = path.join(__dirname, 'result/demo_copy.txt');

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



describe('file_copy_test', function () {
	it('copy file', function (done) {
		kronos.manager().then(function (manager) {
			try {
				manager.registerStepImplementation("kronos_fileReader", fileReader);
				manager.registerStepImplementation("kronos_fileWriter", fileWriter);

				let flowFileCopy = manager.declareFlows(testFlow);
				let flowTest = manager.flowDefinitions.fileCopy;
				flowTest.initialize(manager);
			} catch (err) {
				console.log(err);
			}
		});
		done();
	});

	it('compare file', function (done) {
		compare.compare(sourceFileName, destFileName, function (copied, err) {
			copied.should.equal(true);
		});
	});

});