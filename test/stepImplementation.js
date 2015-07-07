/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
chai.use(require("chai-as-promised"));
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const path = require("path");

const stepImplementation = require('../lib/stepImplementation');

describe('step implementations', function () {

  const buildinStepDir = path.join(__dirname, '..', 'lib', 'steps');

  describe('register from directory', function () {
    it('should resolve to some registered implementations', function (done) {
      let all = {};
      stepImplementation.registerStepsFromDirs(all, buildinStepDir).then(
        function (regs) {
          assert(regs.length > 1);
          done();
        });
    });
    it('should have registered copy step implementation', function (done) {
      let all = {};

      stepImplementation.registerStepsFromDirs(all, buildinStepDir).then(
        function () {
          const si = all['kronos-copy'];
          assert(si.name === "kronos-copy");
          assert(si.endpoints.in.name === "in");

          assert(si.endpoints.in.mandatory);
          assert(si.endpoints.in.uti === 'public.data');
          assert(si.endpoints.in.direction === 'in(active)');

          assert(si.endpoints.out.name === "out");

          assert(si.endpoints.out.direction === 'out(active,passive)',
            "out should have out direction");

          assert(si.endpoints.out.uti === 'public.data');
          assert(si.endpoints.out.mandatory);
          assert(si.endpoints.out.contentInfo);

          assert(si.endpoints.log.name === "log");
          assert(si.endpoints.log.mandatory);
          assert(si.endpoints.log.direction === 'out(active)');
          done();
        });
    });
  });
});
