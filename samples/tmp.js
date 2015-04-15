exports.stepImplementations = {
	"file-write": {
		"description": "Opens a file for reading",
		"endpoints": {
			"in": {
				"direction": "in",
				"uti": "public.data",
				"contentInfo": {
					"fileName": {
						"description": "The file name of the file to write",
						"mandatory": false,
						"type": "string"
					}
				}
			},
			"out": {
				"direction": "out",
				"uti": "public.data",
				"contentInfo": {
					"fileName": {
						"description": "The file name of the file to write",
						"mandatory": false,
						"type": "string"
					}
				},
				"connect": "step:untar2/out"
			}
		},
		"config": {
			"fileName": {
				"description": "The file name of the file to write",
				"mandatory": false,
				"type": "string"
			}
		},

		"initialize": function (manager, step) {
			console.log("very complicated code");
		}
	}
};
