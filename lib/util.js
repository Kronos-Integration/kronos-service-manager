/* jslint node: true, esnext: true */

"use strict";

const path = require('path'),
  fs = require('fs');

module.exports.FlowSupportMixin = superclass => class extends superclass {
  /**
   * Load a flow from a file
   * @param {string} fileName
   * @return {Promise} of the loaded flow
   */
  loadFlowFromFile(fileName) {
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, {
        encoding: 'utf8'
      }, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        try {
          resolve(this.registerFlow(this.createStepInstanceFromConfig(JSON.parse(data), this)));
        } catch (err) {
          reject(err);
          return;
        }
      });
    });
  }
};
