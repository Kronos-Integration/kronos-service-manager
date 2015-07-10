/* jslint node: true, esnext: true */
"use strict";

function* g4() {
	let counter = 0;

	while (counter < 3) {
		counter++;
		let gum = yield counter;
		if (gum) {
			console.log("GUMBO");
		}
	}

	return "foo";
}

var result;

function* g5() {
	yield "Start";
	yield * g4();
	yield "End";
}

var iterator = g5();

console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next("ha"));
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
