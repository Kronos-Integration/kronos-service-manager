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
	return function (info, stream, cb) {
		stream.pipe(process.stdout);
		cb(undefined);
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


const endpointByName = {
	"in1": {
		"type": "stdin"
	},
	"out1": {
		"direction": "push",
		"type": "http_post",
		"url": "http://localhost:12345/service1"
	},
};

module.exports.get = function(endpointId) {

	let ed = endpointByName[endpointId];
	if (ed) {
		ed.id = endpointId;
		return createEndpoint(ed);
	}

	return undefined;
};

*/
