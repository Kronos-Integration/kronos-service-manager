/* jslint node: true, esnext: true */

"use strict";

const fs = require('fs');

exports.endpointImplementations = {
	"file": {
		"direction": ["in", "out"],
		"contentInfo": {
			"name": {
				"description": "file name"
			}
		},
		implementation(endpointDefinition) {
			const uri = endpointDefinition.target;
			const m = uri.match(/^file:(.*)/);
			const fileName = m[1];

			if (endpointDefinition.direction === 'in') {
				return function* () {
					console.log(`file endpoint "in" ${fileName}`);

					/*fs.stat(fileName, function (err, stat) {
						console.log(`stat: ${fileName} ${JSON.stringify(stat)}`);
					});*/

					let stream = fs.createReadStream(fileName);

					yield {
						info: {
							name: fileName
						},
						stream: stream
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
