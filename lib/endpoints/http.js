/* jslint node: true, esnext: true */

"use strict";

let request = require('request');
let http = require('http');
let url = require('url');


exports.endpointImplementations = {
  "http": {
    "direction": ["in", "out", "inout"],
    "implementation": function (endpointDefinition) {

      if (endpointDefinition.direction === 'out') {
        return function* () {
          let r =
            yield;
          request.post({
              url: endpointDefinition.url,
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

/*
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
