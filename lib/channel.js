/* jslint node: true, esnext: true */

"use strict";


/*
 * create two endpoints glued together to form a channel
 * @return array with the two channles
 */
function create(ep1, ep2) {

	// currently only on request at a time can be passed
	let request;

	return [Object.create(ep1, {
			description: {
				value: `Channel from ${ep1.name} to ${ep2.name}`
			},
			implementation: {
				value: function* () {
					request =
						yield;
					console.log(
						`got: ${JSON.stringify(request.info)} ${request.stream ? true : false}`
					);
				}
			}
		}),
		Object.create(ep2, {
			description: {
				value: `Channel from ${ep2.name} to ${ep1.name}`
			},
			implementation: {
				value: function* () {

					yield request;
					console.log(
						`provide: ${JSON.stringify(request.info)} ${request.stream ? true : false}`
					);
				}
			}
		})
	];
}

exports.create = create;
