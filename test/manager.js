/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

let manager = require('../lib/manager.js').manager;
var assert = require('assert');

describe('service declaration', function () {
  let myManager = manager();
  let f = myManager.declareFlow({
    "name": "myFlow",
    "steps": {
      "s1": {
        "type": "copy",
        "config": {
          "key1": "value1"
        },
        "endpoints": {
          "in": "stdin",
          "out": function* () {
            do {
              let request =
                yield;
            } while (true);
          }
        }
      }
    }
  });

  it('returned flow should be registered one', function () {
    assert(f === myManager.getFlow('myFlow'));
  });

  it('flow should be present', function () {
    let flow = myManager.getFlow('myFlow');
    assert(flow.name === "myFlow");
  });
});
