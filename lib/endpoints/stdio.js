/* jslint node: true, esnext: true */

"use strict";

const endpointImpls = require("../endpointImplementation");

exports.endpointImplementations = {
  "stdin": {
    "direction": "in(pull)",
    implementation(manager) {
      /*
       * stdin endpoint delivers one single stdin stream
       */
      const myGen = function* () {
        //console.log("stdin provide stream");
        yield {
          info: {
            name: 'stdin'
          },
          stream: process.stdin
        };
      };

      return myGen();
    }
  },
  "stdout": {
    "direction": "out(pull,push)",
    implementation(manager,generator) {
      if (generator) {
        for (let request of generator()) {
          //console.log(`stdout got stream generator: ${JSON.stringify(request.info)}: ${request.stream}`);
          request.stream.pipe(process.stdout);
        }
        return undefined;
      }

      const myGen = function* () {
        let request;
        while ((request = yield) !== undefined) {
          //console.log(`stdout got stream: ${JSON.stringify(request.info)}: ${request.stream}`);
          request.stream.pipe(process.stdout);
        }
      };

      return myGen();
    }
  },
  "stderr": {
    "direction": "out(pull,push)",
    implementation(manager,generator) {
      if (generator) {
        for (let request of generator()) {
          //console.log(`stderr got stream generator: ${JSON.stringify(request.info)}: ${request.stream}`);
          request.stream.pipe(process.stderr);
        }
        return undefined;
      }

      const myGen = function* () {
        let request;
        while ((request = yield) !== undefined) {
          //console.log(`stderr got stream: ${JSON.stringify(request.info)}: ${request.stream}`);
          request.stream.pipe(process.stderr);
        }
      };

      return myGen();
    }
  }
};
