const kronosStep = require('kronos-step');
const channel = require('../../lib/channel');

const requestGenerator = function* () {
	for (var i = 1;i < 5; i++) {
		console.log(`deliver ${i}`);
		yield {
			info: {
				name: `send from output #${i}`
			},
			stream: `a stream ${i}`
		};
	}
};

const manager = {};

var es = {
  "input": kronosStep.createEndpoint("input", {
    direction: "in(passive)"
  }),
  "output": kronosStep.createEndpoint("output", {
    direction: "out(active)"
  })
};

var chl = channel.create({
  name: "a"
}, es.input, {
  name: "b"
}, es.output);

//debugger;

chl.endpointA.initialize(manager, requestGenerator);
const input = chl.endpointB.initialize(manager);

console.log(`endpointB ${input}`);

var i = 1;

for (var request of input) {
  console.log(`got: ${JSON.stringify(request)}`);

  i++;
  if (i > 5) break;
}
