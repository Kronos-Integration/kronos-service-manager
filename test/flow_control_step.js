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


function runFlowTest(flowDecls, flowName, done, test) {
  return kronos.manager({
    validateSchema: false,
  }).then(function (manager) {
    manager.registerFlows(flows).then(function() {
      try {
        const flow = manager.flowDefinitions[flowName];
        assert(flow, "flow object missing");
        test(flow);
      } catch (e) {
        done(e);
      }
    }, done);
  }, done);
}

describe('kronos-flow-control', function () {
  const flowStream = fs.createReadStream(path.join(__dirname, 'fixtures', 'sample.flow'), {
    encoding: 'utf8'
  });
  const flowDecl = {
    "flow1": {
      "steps": {
        "s1": {
          "type": "kronos-flow-control",
          "endpoints": {
            "in": function* () {
              yield {
                info: {
                  name: "myFlow"
                },
                stream: flowStream
              };
            }
          }
        }
      }
    }
  };

  it('exec within flow1', function (done) {
    runFlowTest(flowDecl, 'flow1', done, function (flow) {
      flow.start();
      assert(flow.manager.flowDefinitions.sample.name === 'sample');
      done();
    });
  });
});
