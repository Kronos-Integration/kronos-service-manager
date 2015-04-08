/* jslint node: true, esnext: true */

"use strict";


const RootAttribute = {
	toString: function () {
		return this.name;
	}
};

/**
 * attribute blueprint
 */
const defaultAttribute = Object.create(RootAttribute, {
	description: {
		value: "no description given"
	},
	mandatory: {
		value: true
	},
	defaultValue: {
		value: undefined
	}
});

/**
 * creates attributes from a json attribut definition
 */
exports.createAttributesFromDefinition = function (attributeDefinitions) {
	const attributes = {};

	for (let aid in attributeDefinitions) {
		const ad = attributeDefinitions[aid];

		var properties = {
			name: {
				value: aid
			}
		};

		if (ad.hasOwnProperty("mandatory") && ad.mandatory !== defaultAttribute.mandatory) {
			properties.mandatory = {
				value: ad.mandatory
			};
		}

		if (ad.hasOwnProperty("defaultValue") && ad.defaultValue !==
			defaultAttribute.defaultValue) {
			properties.defaultValue = {
				value: ad.defaultValue
			};
		}

		if (ad.description) {
			properties.description = {
				value: ad.description
			};
		}

		attributes[aid] = Object.create(defaultAttribute, properties);
	}

	return attributes;
};
