/* jslint node: true, esnext: true */

"use strict";

const log4js = require('log4js');
const logger = log4js.getLogger('kronos-step-file-common:kronos_fileReader');

const fs = require('fs');


/**
 * This step just opens a file stream for reading a file.
 */
exports.kronos_fileReader = {
  "description": "Opens a file for reading",
  "endpoints": {
    "out": {
      "direction": "out(active)",
      "uti": "public.data"
    },
  },
  "config": {
    "fileName": {
      "description": "The file name of the file to read",
      "mandatory": true,
      "type": "string"
    }
  },

  "initialize": function (manager, step) {
    logger.debug(`Initialize`);

    // get the endpoint

    // get the file name from the config
    if (step.config.fileName !== undefined) {
      const fileName = step.config.fileName;

      logger.debug(`Read file '${fileName}'`);

      // check that the file exists
      fs.lstat(fileName, function (error, stats) {
        if (stats.isFile()) {

          logger.debug(`The file exists and is readable.`);

          let readStream = fs.createReadStream(fileName);
          logger.debug(`File readStream created`);

          const output = step.endpoints.out.initialize(manager);
          logger.debug(`outendpoint initialized. output: ${output}`);

          output.next();
          output.next({
            "info": {
              "fileName": fileName
            },
            "stream": readStream
          });

          logger.debug(`Done`);

        } else {
          throw `The file '${fileName}' does not exists.`;
        }
      });
    } else {
      throw "No 'fileName' parameter given in the config";
    }
  }
};
