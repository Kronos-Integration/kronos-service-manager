/* jslint node: true, esnext: true */

"use strict";

let request = require('request');
let http = require('http');
let url = require('url');


exports.stdin = function (endpointConfiguration) {

  /*
   * stdin endpoint delivers one stdin stream
   */
  return function* () {
    yield {
      info: {
        name: 'stdin'
      },
      stream: process.stdin
    };
  };
};

exports.stdout = function (endpointConfiguration) {
  return function* () {
    do {
      let connection =
        yield;
      connection.stream.pipe(process.stdin);
      console.log(`stdout info: ${JSON.stringify(connection.info)}`);
    }
    while (true);
  };
};

/*
exports.http = function() {
	return function(info, stream, cb) {
		const formData = {};
		request.post({
				url: endpointDefinition.url,
				formData: {
					content: stream,
				}
			},
			function optionalCallback(err, httpResponse, body) {
				cb(err);
			});
	};
};

function createEndpoint(endpointDefinition) {

	if (endpointDefinition.type === 'http_post') {
		let o = url.parse(endpointDefinition.url);
		let port = o.port || 80;

		return function*() {
			let cb = function*(req, res) {
				yield null;
				res.writeHead(200, {
					'Content-Type': 'text/plain'
				});
			};

			let server = http.createServer(cb);

			yield null;
			server.listen(port, '127.0.0.1');
		};
	}
}

*/
