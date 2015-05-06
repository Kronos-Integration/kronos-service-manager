/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const endpointImpl = require('../lib/endpointImplementation');

describe('file endpoint implementation', function () {

	const fileImpl = endpointImpl.implementations.file;

	const myEndpoint = endpointImpl.createEndpoint('e1', {
		target: "file:" + path.join(__dirname, 'fixtures', 'file1.txt'),
		direction: 'in'
	});

	const in1 = fileImpl.implementation(myEndpoint)();

	//console.log(`in1: ${in1}`);

	for (let request in in1) {
		console.log(`request: ${request}`);
	}

	/*
	  let request = in1.next();
	  assert(request.stream !== undefined);
	*/

});
