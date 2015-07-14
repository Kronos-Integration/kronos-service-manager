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
      logger.debug(`Got a new request ${JSON.stringify(myRequest)}`);

      logger.debug(`File to write ${myRequest.fileName}`);
      const writeStream = fs.createWriteStream(myRequest.fileName);

      logger.debug(`Write stream created`);

      myRequest.stream.pipe(writeStream);

      logger.debug(`Done`);
    });

    // // get the endpoint
    // const in1 = step.endpoints.in.initialize(manager);
    // const in1ParamDef = step.endpoints.in.contentInfo;
    // const stepParamDef = step.meta.config;
    // const stepConfig = step.config;
    //
    //
    // for (let request of in1) {
    //   logger.debug("Got request Write");
    //   // get the info parameter hash
    //   let info = request.info;
    //
    //   // get the input stream
    //   let inStream = request.stream;
    //
    //   // validate the configs
    //   const myConfig = validator(in1ParamDef, [stepConfig, info]);
    //   const fileName = myConfig.fileName;
    //
    //   logger.debug(`Write file '${fileName}'`);
    //
    //   var destionationStream = fs.createWriteStream(fileName);
    //
    //   inStream.pipe(destionationStream);
    // }
  }
};
