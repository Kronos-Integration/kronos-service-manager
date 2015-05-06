/* jslint node: true, esnext: true */

"use strict";

exports.endpointImplementations = {
  "stdin": {
    "direction": "in",
    implementation(endpointDefinition) {
      /*
       * stdin endpoint delivers one stdin stream
       */
      return function* () {
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
    implementation(endpointDefinition) {
      return function* () {
        do {
          const request =
            yield;
          request.stream.pipe(process.stdout);
        }
        while (true);
      };
    }
  },
  "stderr": {
    "direction": "out",
    implementation(endpointDefinition) {
      return function* () {
        do {
          const request =
            yield;
          request.stream.pipe(process.stderr);
        }
        while (true);
      };
    }
  }
};
