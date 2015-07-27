/* jslint node: true, esnext: true */
"use strict";


function* fileWriter() {
	let counter = 0;
	while (true) {
		let fileNameToWrite = yield counter;
		console.log(`fileWriter: Write the file ${fileNameToWrite}`);
	}
}

function* untar() {
	let elements = ['Archive1', 'Archive2'];

	let iterator = fileWriter();
	while (true) {
		let tarFileName = yield;
		for (let i = 0; i < elements.length; i++) {
			console.log(`untar:  ${tarFileName}`);
			console.log(`untar:  element ${elements[i]}`);
			iterator.next(`${tarFileName}  ->  ${elements[i]}`);
		}
		yield;
	}
}


var iterator = untar();

console.log(iterator.next());
console.log(iterator.next("Accounts.tar"));
console.log(iterator.next("Descriptions.tar"));
console.log(iterator.next("movies.tar"));
