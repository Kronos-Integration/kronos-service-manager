/* jslint node: true, esnext: true */

"use strict";

const log4js = require('log4js');
const logger = log4js.getLogger('kronos-service-manager:steps:file-write');

const fs = require('fs');

/**
 * This step just write a stream to a file.
 * The file name may be given direct via the step.config or via
 * the  content info of the reading endpoint 'in'. But it must be there.
 * The step configuration will overwrite the contentInfo
 */
module.exports = {
  "description": "Opens a file for reading",
  "endpoints": {
    "in": {
      "direction": "in(passive)",
      "uti": "public.data",
      "contentInfo": {
        "fileName": {
          "description": "The file name of the file to write",
          "mandatory": false,
          "type": "string"
        }
      }
    },
  },
  "config": {
    "fileName": {
      "description": "The file name of the file to write",
      "mandatory": false,
      "type": "string"
    }
  },

  "initialize": function (manager, step) {
    logger.debug(`Initialize`);

    logger.debug(`Initialize fileWriter`);

    step.endpoints.in.initialize(manager, function* () {
      logger.debug(`Generator called`);

      const myRequest = yield;
      //logger.debug(`Got a new request ${JSON.stringify(myRequest)}`);

      let fileName;
      // get the fileName. The Config element will overwrite a value given by the request
      if (step.config.fileName) {
        fileName = step.config.fileName;
      } else {
        fileName = myRequest.info.fileName;
      }

      if (!fileName) {
        logger.error("No fileName for writer");
        throw ("No fileName for writer");
      }

      logger.debug(`File to write ${fileName}`);
      const writeStream = fs.createWriteStream(fileName);

      logger.debug(`Write stream created`);

      let readStream = myRequest.stream;

      readStream.pipe(writeStream);

      logger.debug(`Done`);
    });
  }
};
