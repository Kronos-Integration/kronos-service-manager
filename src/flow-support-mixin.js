const path = require('path'),
  fs = require('fs'),
  { promisify } = require('util');

const readFile = promisify(fs.readFile);

export default function FlowSupportMixin(superclass) {
  return class extends superclass {
    /**
     * Load a flow from a file
     * @param {string} fileName
     * @return {Promise} of the loaded flow
     */
    async loadFlowFromFile(fileName) {
      const data = await readFile(fileName, {
        encoding: 'utf8'
      });

      return this.registerFlow(
        this.createStepInstanceFromConfig(JSON.parse(data), this)
      );
    }
  };
}
