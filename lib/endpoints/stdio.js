/* jslint node: true, esnext: true */

"use strict";

exports.endpointImplementations = {
  "stdin": {
    "direction": "in",
    "implementation": function (endpointDefinition) {
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
    "implementation": function (endpointDefinition) {
      return function* () {
        do {
          const request =
            yield;
          console.log(
            `stdout info: ${JSON.stringify(request.info)} ${request.stream ? true : false}`);

          request.stream.pipe(process.stdout);
        }
        while (true);
      };
    }
  },
  "stderr": {
    "direction": "out",
    "implementation": function (endpointDefinition) {
      return function* () {
        do {
          const request =
            yield;
          request.stream.pipe(process.stderr);
          console.log(
            `stderr info: ${JSON.stringify(request.info)}`);
        }
        while (true);
      };
    }
  }
};
