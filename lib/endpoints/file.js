/* jslint node: true, esnext: true */

"use strict";

const fs = require('fs');

exports.defineEndpointImplementations = function (manager) {
	manager.defineEndpointImplementations({
		"file": function (endpointConfiguration) {

			return function* () {
				yield {
					info: {
						name: 'stdin'
					},
					stream: fs.fileInputStream('')
				};
			};
		},
	});
};
