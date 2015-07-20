/* global describe, it, beforeEach */
/* jslint node: true, esnext: true */

"use strict";

const kronos = require('../../lib/manager');
const fs = require('fs');
const path = require('path');

const uti = require("uti");



const sourceFileName =
	'/Users/torstenlink/Documents/entwicklung/kronos/kronos-service-manager/test/integration_tests/file_copy/fixtures/demo.txt';
const destFileName =
	'/Users/torstenlink/Documents/entwicklung/kronos/kronos-service-manager/test/integration_tests/file_copy/result/demo_copy.txt';
const sin = fs.createReadStream(sourceFileName);
const sout = fs.createWriteStream(destFileName);

// const sin = fs.createReadStream('copy_file.js');
// const sout = fs.createWriteStream('/tmp/afile');

sin.pipe(sout);
