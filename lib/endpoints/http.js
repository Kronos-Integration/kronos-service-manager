/* jslint node: true, esnext: true */

"use strict";

let request = require('request');
let http = require('http');
let url = require('url');


exports.endpointImplementations = {
	"http": {
		"direction": ["in", "out", "inout"],
		implementation() {
			if (this.direction.isIn) {
				const o = url.parse(this.target);
				const port = o.port || 80;

				return function* () {
					const cb = function* (req, res) {
						yield {
							info: req.header,
							stream: req.stream
						};
						res.writeHead(200, {
							'Content-Type': 'text/plain'
						});
					};

					const server = http.createServer(cb);

					yield null;
					server.listen(port, '127.0.0.1');
				};
			} else
			if (this.direction.isOut) {
				return function* () {
					let r =
						yield;
					request.post({
							url: this.target,
							formData: {
								content: r.stream,
							}
						},
						function optionalCallback(err, httpResponse, body) {
							//cb(err);
						});
				};
			}
		}
	}
};
