/* global describe, it, beforeEach */
/* jslint node: true, esnext: true */

"use strict";
var uti = require('uti');

uti.initialize().then(function () {
	let doesConformTo = uti.conformsTo('public.image', 'public.data');
	console.log('doesConformTo: ' + doesConformTo);

	console.log(uti.getUTIsForFileName('a.txt')[0]);
});
