/* jslint node: true, esnext: true */

"use strict";

const fs = require('fs');

exports.endpointImplementations = {
	"file": function (endpointDefinition) {

		if (endpointDefinition.direction === 'in') {
			return function* () {
				yield {
					info: {},
					stream: fs.fileInputStream('')
				};
			};
		}
	}
};
