/* jslint node: true, esnext: true */

"use strict";

const request = require('request');
const http = require('http');
const url = require('url');


exports.endpointImplementations = {
	"http": {
		"direction": "inout(pull,push)",
		implementation(generator) {
			if (this.direction.isIn) {
				const o = url.parse(this.target);
				const port = o.port || 80;

				return function () {
					const server = http.createServer(function (req, res) {

						generator.next({
							info: req.header,
							stream: req.stream
						});

						res.writeHead(200, {
							'Content-Type': 'text/plain'
						});
					});

					server.listen(port, '127.0.0.1');
				};
			} else
			if (this.direction.isOut) {
				return function* () {
					let r = yield;
					request.post({
							url: this.target,
							formData: {
								content: r.stream,
							}
						},
						function optionalCallback(err, httpResponse, body) {
							console.log(`http post done: ${err}`);
						});
				};
			}
		}
	}
};
