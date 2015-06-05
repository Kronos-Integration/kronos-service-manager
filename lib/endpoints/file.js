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
				const myGen = function* () {

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
				return myGen();
			} else {
				if (this.isOut) {
					const errorHandler = function (error) {
						console.log(`stream error:${error}`);
					};
					const finishHandler = function () {
						console.log(`stream finished:`);
					};
					const endHandler = function () {
						console.log(`stream end:`);
					};

					if (generator) {
						for (let request of generator()) {
							console.log(`Request ${JSON.stringify(request.info)} ${request.stream}`);

							const stream = fs.createWriteStream(fileName);

							stream.on('error', errorHandler);
							stream.on('finish', finishHandler);
							request.stream.on('error', errorHandler);
							request.stream.on('end', endHandler);

							request.stream.pipe(stream);
							request.stream.resume();
						}

						return undefined;
					}

					const myGen = function* () {
						//console.log(`file endpoint out ${fileName} ${generator}`);

						do {
							const request = yield;
							const stream = fs.createWriteStream(fileName);

							stream.on('error', errorHandler);
							stream.on('finish', finishHandler);

							request.stream.pipe(stream);
						}
						while (true);
					};

					const go = myGen();
					go.next();
					return go;
				}
			}

			//console.log(`unknown direction: ${this.direction}`);
		}
	}
};
