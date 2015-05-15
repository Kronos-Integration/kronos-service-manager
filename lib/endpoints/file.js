/* jslint node: true, esnext: true */

"use strict";

const fs = require('fs');

exports.endpointImplementations = {
	"file": {
		"direction": "inout",
		"contentInfo": {
			"name": {
				"description": "file name"
			}
		},
		implementation() {
			const uri = this.target;
			const m = uri.match(/^file:(.*)/);
			const fileName = m[1];

			if (this.isIn) {
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
				if (this.isOut) {
					return function* () {
						console.log(`file endpoint out ${fileName}`);

						const request =
							yield;
						request.stream.pipe(fs.createWriteStream(fileName));
					};
				}
			}

			console.log(`unknown direction: ${this.direction}`);
		}
	}
};
