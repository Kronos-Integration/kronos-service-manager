/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
chai.use(require("chai-as-promised"));
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const path = require('path');
const fs = require('fs');

const kronos = require('../lib/manager.js');

describe('flow_control', function () {
  const flowStream = fs.createReadStream(path.join(__dirname,'fixtures','sample.flow'),{ encoding: 'utf8' });
  const flowDecl = {
    "flow1": {
      "steps": {
        "s1": {
          "type": "flow_control",
          "endpoints": {
            "in": function* () {
                yield { info : { name : "myFlow" }, stream: flowStream }
            }
          }
        }
      }
    }
  };

  it('exec within flow1', function (done) {
    kronos.manager().then(function (myManager) {
      myManager.declareFlows(flowDecl);
      myManager.intializeFlow('flow1');
      //console.log(`sample: ${myManager.flowDefinitions.sample}`);
      assert(myManager.flowDefinitions.sample.name === 'sample');
      done();
    });
  });
});
