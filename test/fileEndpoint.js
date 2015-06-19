/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const fs = require('fs');
const path = require('path');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
const streamEqual = require('stream-equal');
const tmp = require('tmp');
const endpointImpl = require('../lib/endpointImplementation');

const fileImpl = endpointImpl.implementations.file;
const inFileName = path.join(__dirname, 'fixtures', 'file1.txt');

const manager = { uti: { getUTIsForFileName(file) { return ['public.plain-text']; } }};

describe('in file endpoint', function () {
	const endpoint = endpointImpl.createEndpoint('e1', {
		target: "file:" + inFileName,
		direction: 'in'
	}, fileImpl);

	it("should have an implementation", function () {
		assert(fileImpl !== undefined);
		assert(endpoint.implementation === fileImpl.implementation, "file endpoint implementation");
	});

	it("should have a request", function (done) {
		let number = 0;

		function equalizer(err, equal) {
			assert(equal, "stream is equal to file content");
			done();
		}

		for (let request of endpoint.initialize(manager)) {
			number++;
			assert(request.info.name === inFileName, "file name is " + inFileName);

			//console.log(`*** UTI ${request.info.uti}`);
			assert(request.info.uti.toString() === 'public.plain-text');

			streamEqual(request.stream, fs.createReadStream(inFileName), equalizer);
		}
		assert(number === 1, "exactly one request");
	});
});

describe('out file endpoint', function () {
	it("should consume a request", function (done) {

		tmp.file(function (err, outFileName) {
			const endpoint = endpointImpl.createEndpoint('e1', {
				target: "file:" + outFileName,
				direction: 'out(push)'
			}, fileImpl);

			let myStream;
			let out = endpoint.initialize(manager,function* () {
				myStream = fs.createReadStream(inFileName);
				yield {
					info: {
						name: "aName"
					},
					stream: myStream
				};
			});

			myStream.on('end', function () {
				function equalizer(err, equal) {
					assert(equal, "stream is equal to file content");
					done();
				}

				streamEqual(fs.createReadStream(outFileName), fs.createReadStream(inFileName), equalizer);
			});
		});
	});
});
