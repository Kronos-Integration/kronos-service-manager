/* global describe, it, beforeEach */
/* jslint node: true, esnext: true */

"use strict";

const kronosStep = require('kronos-step');
// const endpointImpls = kronosStep.endpointImplementation;
// const endpointImpls = kronosStep.endpointImplementation;

const channel = require('../../lib/channel');


kronosStep.createEndpoint("input", {
	direction: "in(passive)"
});

console.log("");
