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

describe('in file endpoint', function () {
	const endpoint = endpointImpl.createEndpoint('e1', {
		target: "file:" + inFileName,
		direction: 'in'
	}, fileImpl);

	it("should have an implementation", function () {
		assert(fileImpl !== undefined);
		assert(endpoint.implementation === fileImpl.implementation, "file endpoint implementation");
	});

	let requests = endpoint.initialize();

	it("should have a request", function (done) {
		let number = 0;

		function equalizer(err, equal) {
			assert(equal, "stream is equal to file content");
			done();
		}

		for (let request of requests) {
			number++;
			assert(request.info.name === inFileName, "file name is " + inFileName);

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

			let out = endpoint.initialize();

			out.next({
				info: {
					name: "aName"
				},
				stream: fs.createReadStream(inFileName)
			});

			setTimeout(function () {
				fs.stat(outFileName, function (err, stat) {
					console.log(`${err} size: ${stat.size}`);
				});

				function equalizer(err, equal) {
					console.log(`equal: ${equal}`);
					assert(equal, "stream is equal to file content");
					done();
				}

				streamEqual(fs.createReadStream(outFileName), fs.createReadStream(inFileName), equalizer);
			}, 100);
		});
	});
});
