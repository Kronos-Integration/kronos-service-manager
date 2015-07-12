/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
chai.use(require("chai-as-promised"));
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const uti = require('uti');

const kronos = require('../../lib/manager.js');
kronos.manager().then(function (manager) {
	const c = manager.stepImplementations['kronos-copy'];

	console.log("Gumbo");
});
