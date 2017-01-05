[![npm](https://img.shields.io/npm/v/kronos-service-manager.svg)](https://www.npmjs.com/package/kronos-service-manager)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/Kronos-Integration/kronos-service-manager)
[![Build Status](https://secure.travis-ci.org/Kronos-Integration/kronos-service-manager.png)](http://travis-ci.org/Kronos-Integration/kronos-service-manager)
[![bithound](https://www.bithound.io/github/Kronos-Integration/kronos-service-manager/badges/score.svg)](https://www.bithound.io/github/Kronos-Integration/kronos-service-manager)
[![codecov.io](http://codecov.io/github/Kronos-Integration/kronos-service-manager/coverage.svg?branch=master)](http://codecov.io/github/Kronos-Integration/kronos-service-manager?branch=master)
[![Coverage Status](https://coveralls.io/repos/Kronos-Integration/kronos-service-manager/badge.svg)](https://coveralls.io/r/Kronos-Integration/kronos-service-manager)
[![Code Climate](https://codeclimate.com/github/Kronos-Integration/kronos-service-manager/badges/gpa.svg)](https://codeclimate.com/github/Kronos-Integration/kronos-service-manager)
[![Known Vulnerabilities](https://snyk.io/test/github/Kronos-Integration/kronos-service-manager/badge.svg)](https://snyk.io/test/github/Kronos-Integration/kronos-service-manager)
[![GitHub Issues](https://img.shields.io/github/issues/Kronos-Integration/kronos-service-manager.svg?style=flat-square)](https://github.com/Kronos-Integration/kronos-service-manager/issues)
[![Stories in Ready](https://badge.waffle.io/Kronos-Integration/kronos-service-manager.svg?label=ready&title=Ready)](http://waffle.io/Kronos-Integration/kronos-service-manager)
[![Dependency Status](https://david-dm.org/Kronos-Integration/kronos-service-manager.svg)](https://david-dm.org/Kronos-Integration/kronos-service-manager)
[![devDependency Status](https://david-dm.org/Kronos-Integration/kronos-service-manager/dev-status.svg)](https://david-dm.org/Kronos-Integration/kronos-service-manager#info=devDependencies)
[![docs](http://inch-ci.org/github/Kronos-Integration/kronos-service-manager.svg?branch=master)](http://inch-ci.org/github/Kronos-Integration/kronos-service-manager)
[![downloads](http://img.shields.io/npm/dm/kronos-service-manager.svg?style=flat-square)](https://npmjs.org/package/kronos-service-manager)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

kronos-service-manager
====
kronos service manger

# API Reference

* <a name="loadFlowFromFile"></a>

## loadFlowFromFile(fileName) ⇒ <code>Promise</code>
Load a flow from a file

**Kind**: global function  
**Returns**: <code>Promise</code> - of the loaded flow  

| Param | Type |
| --- | --- |
| fileName | <code>string</code> | 


* <a name="willBeUnregistered"></a>

## willBeUnregistered() ⇒ <code>Promise</code>
Deletes a flow from the stored flow definitions. If the flow
is currently running, it will be stopped first. After it
is stopped, it will be deleted.

**Kind**: global function  
**Returns**: <code>Promise</code> - returns a promise that is fullfilled when the flow is removed
        or one that rejects if there is no flow for the given flowName  

* <a name="manager"></a>

## manager(config, [modules]) ⇒ <code>Promise</code>
creates a kronos service manager.

**Kind**: global function  
**Returns**: <code>Promise</code> - a promise with the service manager as its value  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Array.&lt;object&gt;</code> | separated for each service |
| [modules] | <code>Array.&lt;string&gt;</code> | modules to register with registerWithManager |


* <a name="ServiceManager+_stop"></a>

## ServiceManager._stop() ⇒ <code>Promise</code>
Stops execution and frees all used resources.
It will stop each flow.
Then stop all services

**Kind**: instance method of <code>ServiceManager</code>  
**Returns**: <code>Promise</code> - that fullfills when the manager has stopped  

* * *

install
=======

With [npm](http://npmjs.org) do:

```shell
npm install kronos-service-manager
```

Browse available [services](https://www.npmjs.com/browse/keyword/kronos-service),
[interceptors](https://www.npmjs.com/browse/keyword/kronos-interceptor)
and [steps](https://www.npmjs.com/browse/keyword/kronos-step).

license
=======

BSD-2-Clause
