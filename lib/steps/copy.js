/* jslint node: true, esnext: true */

"use strict";

exports.stepImplementations = {
	"copy": {
		"description": "copies incoming (in) requests into output (out)",
		"endpoints": {
			"in": {
				"direction": "in"
					/*,
"mandatory": true
"uti": "public.data"
*/
			},
			"out": {
				"direction": "out"
					/*,
"mandatory": true
"uti": "public.data"
*/
			}
		},
		"initialize": function (manager, step) {
			const out = step.endpoints.out.implementation();

			out.next(); // advance to 1st. connection - TODO: needs to be move into service-manager

			const input = step.endpoints.in.implementation();

			for (let request of input) {
				out.next(request);
			}
		}
	}
};
