/* jslint node: true, esnext: true */

"use strict";

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const endpointImpl = require('../lib/endpointImplementation');

describe('file endpoint implementation', function () {

  const fileImpl = endpointImpl.implementations.file;

  const myEndpoint = Object.create(endpointImpl.defaultEndpoint,{
    value: { value: "file:" + path.join(__dirname, 'fixtures', 'file1.txt') },
    direction: { value: 'in' }
  });

  const in1 = fileImpl.implementation(myEndpoint)();

  console.log(`in1: ${in1}`);

  for (let request of in1) {
    console.log(`request: ${request}`);
  }

  let request = in1.next();
  assert(request.stream !== undefined);

});
