/* jslint node: true, esnext: true */

"use strict";

const fs = require('fs');

exports.endpointImplementations = {
	"file": {
		"direction": "inout(pull,push)",
		"contentInfo": {
			"name": {
				"description": "file name"
			}
		},
		implementation(generator) {
			const uri = this.target;
			const m = uri.match(/^file:(.*)/);
			const fileName = m[1];

			if (this.isIn) {
				return function* () {

					//console.log(`file endpoint "in" ${fileName}`);

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

					//console.log(`end file endpoint in ${fileName}`);
				};
			} else {
				if (this.isOut) {
					if (generator) {
						return function () {
							//console.log(`genearator file endpoint out ${fileName}`);

							for (let request of generator()) {
								request.stream.pipe(fs.createWriteStream(fileName));
							}
						};
					}

					return function* () {
						//console.log(`file endpoint out ${fileName} ${generator}`);

						do {
							const request =
								yield;

							//console.log(`got file: ${fileName}`);

							request.stream.pipe(fs.createWriteStream(fileName));
						}
						while (true);
					};
				}
			}

			//console.log(`unknown direction: ${this.direction}`);
		}
	}
};
