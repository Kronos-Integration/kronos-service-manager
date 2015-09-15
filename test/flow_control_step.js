/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const path = require('path');
const fs = require('fs');

const events = require('events');

const scopeReporter = require('scope-reporter');
const createFlow = require('kronos-step').createFlow;
const createStepImplementation = require('kronos-step').createStepImplementation;

const allFlows = {};
const manager = Object.create(new events.EventEmitter(), {
  stepImplementations: {
    value: {
      'kronos-flow-control': createStepImplementation('kronos-flow-control', require('../lib/steps/flow_control')),
      'kronos-copy': createStepImplementation('kronos-copy', require('../lib/steps/flow_control'))
    }
  },
  endpointSchemeImplementations: {
    value: {}
  },
  registerFlows: {
    value: function (flows) {
      for (var name in flows) {
        allFlows[name] = flows[name];
      }
      console.log(`register: ${JSON.stringify(allFlows)}`);
    }
  },
  flowDefinitions: {
    value: allFlows
  }
});

function makeFlow(flowDecls, flowName) {
  const sr = scopeReporter.createReporter(undefined);
  const flow = createFlow(manager, flowDecls, sr)[0];
  assert(flow, "flow object missing");
  return flow;
}

describe('kronos-flow-control', function () {
  const flowStream = fs.createReadStream(path.join(__dirname, 'fixtures', 'sample.flow'), {
    encoding: 'utf8'
  });
  const flowDecls = {
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
    const flow = makeFlow(flowDecls, 'flow1');
    flow.start().then(function () {
      try {
        assert.equal(flow.manager.flowDefinitions.sample.name, 'sample');
        done();
      } catch (e) {
        done(e);
      }
    }, done);
  });
});
