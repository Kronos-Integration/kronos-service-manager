/* jslint node: true, esnext: true */

"use strict";

const fifo = require('fifo');

/*
 * create two endpoints glued together to form a channel
 * @return array with the two channles
 */
function create(ep1, ep2) {
  let requests = fifo();

  return [Object.create(ep1, {
      description: {
        value: `Channel from ${ep1.name} to ${ep2.name}`
      },
      implementation: {
        value: function* () {
          //console.log("start endpoint: " + this.description);
          while (true) {
            let request =
              yield;
            console.log(
              `${this.description} got: ${JSON.stringify(request.info)} ${request.stream ? true : false}`
            );
            requests.push(request);
          }
        }
      }
    }),
    Object.create(ep2, {
      description: {
        value: `Channel from ${ep2.name} to ${ep1.name}`
      },
      implementation: {
        value: function* () {
          //console.log("start endpoint: " + this.description);

          while (true) {
            let request = requests.shift();

            if (!request) {
              break;
            }

            yield request;

            console.log(
              `${this.description} provide: ${JSON.stringify(request.info)} ${request.stream ? true : false}`
            );
          }
        }
      }
    })
  ];
}

exports.create = create;
