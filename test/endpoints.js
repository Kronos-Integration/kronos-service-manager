/* global describe, it*/
/* jslint node: true, esnext: true */

"use strict";

const fs = require('fs');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const endpointImpl = require('../lib/endpointImplementation');

describe('endpoint definition', function () {

  describe('with implementation function', function () {
    function myImplementation() {}

    describe('as object', function () {
      it('implementation present', function () {
        const endpoint = endpointImpl.createEndpoint('e1', {
          implementation: myImplementation
        });
        assert(endpoint.implementation === myImplementation);
      });
    });
    describe('as direct function', function () {
      it('implementation present', function () {
        const endpoint = endpointImpl.createEndpoint('e1', myImplementation);
        assert(endpoint.implementation === myImplementation);
      });
    });
  });

  describe('with target', function () {
    describe('as object', function () {
      it('target present', function () {
        const endpoint = endpointImpl.createEndpoint('e1', {
          target: "myTarget"
        });
        assert(endpoint.target === 'myTarget');
      });
    });
    describe('as direct string', function () {
      it('target present', function () {
        const endpoint = endpointImpl.createEndpoint('e1', "myTarget");
        assert(endpoint.target === 'myTarget');
      });
    });
  });

  describe('should have correct direction', function () {
    it('for in', function () {
      const endpoint = endpointImpl.createEndpoint('e1', {
        direction: 'in'
      });
      assert(endpoint.direction === 'in');
      assert(endpoint.isIn, "isIn when in");
    });

    it('for out', function () {
      const endpoint = endpointImpl.createEndpoint('e1', {
        direction: 'out'
      });
      assert(endpoint.direction === 'out');
      assert(endpoint.isOut, "isOut when out");
    });

    it('for inout', function () {
      const endpoint = endpointImpl.createEndpoint('e1', {
        direction: 'inout'
      });
      assert(endpoint.direction === 'inout');
      assert(endpoint.isOut, "isOut when inout");
      assert(endpoint.isIn, "isIn when inout");
    });
  });

});
