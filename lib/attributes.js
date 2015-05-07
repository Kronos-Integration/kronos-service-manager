/* jslint node: true, esnext: true */

"use strict";

/**
 * The attribute represents one property of a config object.
 *
 */

/**
 * attribute blueprint
 */
const defaultAttribute = {
	toString() {
			return this.name;
		},
		get description() {
			return "no description given";
		},
		get mandatory() {
			return true;
		},
		get defaultValue() {
			return undefined;
		},
		get type() {
			return "string";
		}
};

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
			const mandatory = ad.mandatory;
			properties.mandatory = {
				value: mandatory
			};
		}

		if (ad.hasOwnProperty("defaultValue") && ad.defaultValue !==
			defaultAttribute.defaultValue) {
			const defaultValue = ad.defaultValue;

			properties.defaultValue = {
				value: defaultValue
			};
		}

		if (ad.hasOwnProperty("type") && ad.type !==
			defaultAttribute.type) {
			const type = ad.type;
			properties.type = {
				value: type
			};
		}

		if (ad.description) {
			const description = ad.description;

			properties.description = {
				value: description
			};
		}

		attributes[aid] = Object.create(defaultAttribute, properties);
	}

	return attributes;
};
