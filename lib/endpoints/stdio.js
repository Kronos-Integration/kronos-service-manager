/* jslint node: true, esnext: true */

"use strict";

const endpointImpls = require("../endpointImplementation");

exports.endpointImplementations = {
  "stdin": {
    "direction": "in",
    implementation() {
      /*
       * stdin endpoint delivers one single stdin stream
       */
      return function* (generator) {
        console.log("stdin provide stream");
        yield {
          info: {
            name: 'stdin'
          },
          stream: process.stdin
        };
      };
    }
  },
  "stdout": {
    "direction": "out",
    implementation() {
      return function* (generator) {
        let request;
        while ((request = yield) !== undefined) {
          console.log(`stdout got stream: ${JSON.stringify(request.info)}: ${request.stream}`);
          request.stream.pipe(process.stdout);
        }
      };
    }
  },
  "stderr": {
    "direction": "out",
    implementation() {
      return function* (generator) {
        let request;
        while ((request = yield) !== undefined) {
          console.log(`stderr got stream: ${JSON.stringify(request.info)}: ${request.stream}`);
          request.stream.pipe(process.stderr);
        }
      };
    }
  }
};
