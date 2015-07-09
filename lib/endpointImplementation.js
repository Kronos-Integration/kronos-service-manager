/* jslint node: true, esnext: true */

"use strict";

const fs = require("fs");
const path = require("path");
const util = require("util");
const EventEmitter = require('events').EventEmitter;

const attributes = require('./attributes');

function parseDirection(expression) {
  const direction = {};
  let m;

  while (m = expression.match(/^([a-z]+)(\(([^\)]+)\))?\s*(,\s*(.*))?/)) {
    const verb = m[1];
    const attributes = m[3] ? m[3].split(/\s*,\s*/) : [];

    //console.log(`${expression} -> ${verb} ${JSON.stringify(attributes)} (${m[5]})`);

    if (verb === 'inout') {
      direction.in = direction.out = new Set(attributes);
    } else {
      direction[verb] = new Set(attributes);
    }
    //console.log(`${direction[verb].has('active')}`);

    if (!m[5]) break;
    expression = m[5];
  }

  //console.log(`${JSON.stringify(direction)}`);
  return direction;
}

/*
 * Template object
 */
const defaultEndpoint = {
  toString() {
      return this.name;
    },
    toJSON() {
      return {
        name: this.name,
        description: this.description,
        direction: this.direction,
        mandatory: this.mandatory,
        uti: this.uti,
        target: this.target,
        transform: this.transform,
        connector: this.connector,
        contentInfo: this.contentInfo
      };
    },
    get name() {
      return "in";
    },
    get description() {
      return "no description given";
    },
    get direction() {
      return "in(active)";
    },

    /**
     * @return true when direction is either 'in' or 'inout', false otherwise
     */
    get isIn() {
      const e = parseDirection(this.direction);
      return e.in ? true : false;
    },

    /**
     * @return true when direction is either 'out' or 'inout', false otherwise
     */
    get isOut() {
      const e = parseDirection(this.direction);
      return e.out ? true : false;
    },

    /**
     * Endpoint direction characterisics
     * in(active)
     * inout(active)
     * @return true when direction is either 'out' or 'inout' and also the endpoint can be active.
     */
    get isOutAndCanBeActive() {
      const e = parseDirection(this.direction);
      return e.out && e.out.has('active') ? true : false;
    },

    get isOutAndCanBePassive() {
      const e = parseDirection(this.direction);
      return e.out && e.out.has('passive') ? true : false;
    },

    get isInAndCanBeActive() {
      const e = parseDirection(this.direction);
      return e.in && e.in.has('active') ? true : false;
    },

    get isInAndCanBePassive() {
      const e = parseDirection(this.direction);
      return e.in && e.in.has('passive') ? true : false;
    },

    get mandatory() {
      return true;
    },
    get uti() {
      return "public.data"; // Uniform Type Identifier
    },
    get target() {
      return "";
    },
    get contentInfo() {
      return {};
    },
    get initialize() {
      return function (manager, aGeneratorFunction) {
        return this.implementation(manager, aGeneratorFunction);
      };
    }
};

/*
 * Creates an endpoint
 * @param name
 * @param endpointDefinition
 * @param metaDefinition defaults to defaultEndpoint
 */
function createEndpoint(name, endpointDefinition, metaDefinition) {
  const properties = {};

  if (metaDefinition === undefined) {
    metaDefinition = defaultEndpoint;
  }

  if (name !== metaDefinition.name) {
    properties.name = {
      value: name
    };
  }

  if (endpointDefinition) {
    if (util.isFunction(endpointDefinition)) {
      properties.implementation = {
        value: endpointDefinition
      };
    } else if (util.isString(endpointDefinition)) {
      properties.target = {
        value: endpointDefinition
      };
    } else {
      const connect = endpointDefinition.connect;
      if (connect) {
        const connector = connect.connector;
        if (connector) {
          properties.connector = {
            value: connector
          };
        }

        const transform = connect.transform;
        properties.transform = {
          value: transform
        };

        const target = connect.target;
        properties.target = {
          value: target
        };
      } else {
        const target2 = endpointDefinition.target;
        if (target2 !== undefined) {
          properties.target = {
            value: target2
          };
        }
      }

      if (endpointDefinition.direction && endpointDefinition.direction !== metaDefinition.direction) {
        const direction = endpointDefinition.direction;
        properties.direction = {
          value: direction
        };
      }

      if (endpointDefinition.hasOwnProperty("mandatory") && endpointDefinition.mandatory !== metaDefinition.mandatory) {
        properties.mandatory = {
          value: endpointDefinition.mandatory
        };
      }

      if (endpointDefinition.uti && endpointDefinition.uti !== metaDefinition.uti) {
        properties.uti = {
          value: endpointDefinition.uti
        };
      }

      if (endpointDefinition.description) {
        properties.description = {
          value: endpointDefinition.description
        };
      }

      if (endpointDefinition.contentInfo) {
        const atts = attributes.createAttributesFromDefinition(endpointDefinition.contentInfo);
        properties.contentInfo = {
          value: atts
        };
      }

      if (endpointDefinition.implementation) {
        const impl = endpointDefinition.implementation;
        properties.implementation = {
          value: impl
        };
      }
    }
  }

  const e = Object.create(metaDefinition, properties);

  util.inherits(e, EventEmitter);
  return e;
}

const implementations = {};

/*
 * registers endpoint implementations
 */
function register(definitions) {
  for (let name in definitions) {
    implementations[name] = createEndpoint(name, definitions[name], defaultEndpoint);
  }
}

const endpointsSubdir = 'endpoints';

fs.readdirSync(path.join(__dirname, endpointsSubdir)).forEach(function (
  filename) {

  if (!/\.js$/.test(filename)) return;
  const m = require('./' + path.join(endpointsSubdir,
    filename));

  register(m.endpointImplementations);
});

exports.register = register;
exports.createEndpoint = createEndpoint;
exports.implementations = implementations;
exports.defaultEndpoint = defaultEndpoint;
