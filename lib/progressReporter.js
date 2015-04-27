/* jslint node: true, esnext: true */

"use strict";


function quote(str) {
  return `'${str}'`;
}

function expandString(str, quote, properties) {
  return str.replace(/\$\{([^\}]+)\}/g, function (match, key) {
    return quote(properties[key]);
  });
}

exports.defaultProgressReporter = function (output) {

  let scopeStack = [];

  function myOutput(entry) {
    function scopeToString() {
      return entry.scope.map(function (s) {
        let sp = [];
        for (let p in s.properties) {
          sp.push(`${s.properties[p]}`);
        }

        return `${s.name}: ${sp.join(' ')}`;
      }).join(' ');
    }

    console.log(
      `${entry.severity}, ${scopeToString()}: ${expandString(entry.message,quote,entry.properties)}`
    );
  }

  if (!output) {
    output = myOutput;
  }

  const reporter = {
    output: function (entry) {},
    error: function (message, properties) {
      output({
        severity: 'error',
        message: message,
        properties: properties,
        scope: scopeStack
      });
    },
    warn: function (message, properties) {
      output({
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
