/* jslint node: true, esnext: true */

"use strict";

const fs = require('fs');

exports.endpointImplementations = {
  "file": function (endpointDefinition) {

    const uri = endpointDefinition.value;
    const m = uri.match(/^file:(.*)/);
    const fileName = m[1];

    if (endpointDefinition.direction === 'in') {
      return function* () {

        fs.stat(fileName, function (err, stat) {
          console.log(`stat: ${fileName} ${JSON.stringify(stat)}`);
        });

        yield {
          info: {}, // TODO present stat info here
          stream: fs.fileInputStream(fileName)
        };
      };
    } else if (endpointDefinition.direction === 'out') {
      return function* () {
        const request =
          yield;
        request.stream.pipe(fs.fileOutputStream(fileName));
      };
    }
  }
};
