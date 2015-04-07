/* jslint node: true, esnext: true */

"use strict";

exports.defaultProgressReporter = function () {

  let scopeStack = [];

  const reporter = {
    output: function (entry) {
      function scopeToString() {
        return entry.scope.map(function (s) {
          let sp = [];
          for (let p in s.properties) {
            sp.push(`${s.properties[p]}`);
          }

          return `${s.name}: ${sp.join(' ')}`;
        }).join(' ');
      }

      let props = [];
      for (let p in entry.properties) {
        props.push(`${p}=${entry.properties[p]}`);
      }

      console.log(
        `${entry.severity}, ${scopeToString()}: ${entry.message} ${props.join(' ')}`
      );
    },
    error: function (message, properties) {
      this.output({
        severity: 'error',
        message: message,
        properties: properties,
        scope: scopeStack
      });
    },
    warn: function (message, properties) {
      this.output({
        severity: 'warn',
        message: message,
        properties: properties,
        scope: scopeStack
      });
    },
    pushScope: function (name, properties) {
      scopeStack.push({
        name: name,
        properties: properties
      });
    },
    popScope: function () {
      scopeStack.pop();
    }
  };

  return reporter;
};
