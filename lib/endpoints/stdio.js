/* jslint node: true, esnext: true */

"use strict";

const endpointImpls = require("../endpointImplementation");

exports.endpointImplementations = {
  "stdin": {
    "direction": "in(pull)",
    implementation(generator) {
      /*
       * stdin endpoint delivers one single stdin stream
       */
      return function* () {
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
    "direction": "out(pull,push)",
    implementation(generator) {
      if (generator) {
        return function () {
          for (let request of generator()) {
            //console.log(`stdout got stream generator: ${JSON.stringify(request.info)}: ${request.stream}`);
            request.stream.pipe(process.stdout);
          }
        };
      }

      return function* () {
        let request;
        while ((request = yield) !== undefined) {
          //console.log(`stdout got stream: ${JSON.stringify(request.info)}: ${request.stream}`);
          request.stream.pipe(process.stdout);
        }
      };
    }
  },
  "stderr": {
    "direction": "out(pull,push)",
    implementation(generator) {
      if (generator) {
        return function () {
          for (let request of generator()) {
            request.stream.pipe(process.stderr);
          }
        };
      }

      return function* () {
        let request;
        while ((request = yield) !== undefined) {
          //console.log(`stderr got stream: ${JSON.stringify(request.info)}: ${request.stream}`);
          request.stream.pipe(process.stderr);
        }
      };
    }
  }
};
