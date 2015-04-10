/* jslint node: true, esnext: true */

"use strict";

const fs = require('fs');

exports.endpointImplementations = {
  "file": {
    "direction": ["in", "out", "inout"],
    "contentInfo": {
      "name": {
        "description": "file name"
      }
    },
    "implementation": function (endpointDefinition) {
      const uri = endpointDefinition.value;
      const m = uri.match(/^file:(.*)/);
      const fileName = m[1];

      console.log(`filename: ${fileName}`);

      if (endpointDefinition.direction === 'in') {
        console.log(`**** in ****`);

        return function* () {
          console.log(`file endpoint in ${fileName}`);
          fs.stat(fileName, function (err, stat) {
            console.log(`stat: ${fileName} ${JSON.stringify(stat)}`);
          });

          yield {
            info: {
              name: fileName
            }, // TODO present stat info here
            stream: fs.fileInputStream(fileName)
          };

          console.log(`end file endpoint in ${fileName}`);
        };
      } else {
        if (endpointDefinition.direction === 'out') {
          console.log(`**** out ****`);

          return function* () {
            console.log(`file endpoint out ${fileName}`);

            const request =
              yield;
            request.stream.pipe(fs.fileOutputStream(fileName));
          };
        }
      }

      console.log(`unknown direction`);
    }
  }
};
