/* jslint node: true, esnext: true */

"use strict";

const fs = require("fs");
const path = require("path");

const endpoint = require("./endpoint");

const stepImplementations = {};

exports.stepImplementations = stepImplementations;

exports.registerImplementation = function (si) {
  stepImplementations[si.name] = si;
  si.endpoints = endpoint.createEndpointsFromDefinition(si.endpoints);
};


const stepsSubdir = 'steps';

fs.readdirSync(path.join(__dirname, stepsSubdir)).forEach(function (
  filename) {
  if (!/\.js$/.test(filename)) return;
  const stepModule = require('./' + path.join(stepsSubdir, filename));

  console.log("register step: " + stepModule.stepImplementation.name);
  exports.registerImplementation(stepModule.stepImplementation);
});
