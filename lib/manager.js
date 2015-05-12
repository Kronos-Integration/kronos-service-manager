/* jslint node: true, esnext: true */

"use strict";

const path = require("path");
const events = require('events');

const flow = require("./flow");
const progressReporter = require("./progressReporter");
const stepImplementation = require("./stepImplementation");
const endpointImplementation = require("./endpointImplementation");

const flowDefinition = require('kronos-flow');
const flowValidator = flowDefinition.validator;
const flowSchema = flowDefinition.schema;

const stepDefinition = require('kronos-step');
const stepValidator = stepDefinition.validator;
const stepSchema = stepDefinition.schema;

exports.stepImplementation = stepImplementation;
exports.endpointImplementation = endpointImplementation;

var _ = require('lodash');

var log4js = require('log4js');
var logger = log4js.getLogger('kronos-step-service-manager:manager');


/*
 * creates a kronos service manager.
 * Options:
 *    stepDirectories - addittional directories to consult for step implementations
 *    flows - flow declaration to load
 *    validateSchema - do schema validation; defaults to false
 *
 * @param {Object} options
 * @return {Promise} a promise with the service manager as its value
 */
exports.manager = function (options) {
    if (!options) {
        options = {};
    }
    if (!options.hasOwnProperty("validateSchema")) {
        options.validateSchema = false;
    }

    if (!options.progressReporter) {
        options.progressReporter = progressReporter.defaultProgressReporter();
    }

    const flowDefinitions = {};
    const stepImplementations = {};

    const manager = Object.create(new events.EventEmitter(), {
        flowDefinitions: {
            value: flowDefinitions
        },
        stepImplementations: {
            value: stepImplementations
        }
    });

    /**
     * declareFlows function - declares new flows
     * Events:
     * 	emits 'flowDeclard' event for every newly created flow
     * @param  {type} flowDef          A JSON Object which describes the flows
     * @param  {type} progressReporter Optional: A Progresss reporter.
     * @return {type}                  dictionary of the newly created flows
     */
    manager.declareFlows = function (flowDef, progressReporter) {

        function _declare() {
            const flows = flow.create(manager, flowDef, progressReporter);
            for (let fn in flows) {
                flowDefinitions[fn] = flows[fn];
                manager.emit('flowDeclared', flows[fn]);
            }
            return flows;
        }

        if (options.validateSchema) {
            // Check if the given flow matches the flow schema
            if (flowValidator.validate(flowDef, flowSchema)) {
                // The given flow matches the schema
                return _declare();
            } else {
                // The schema validator got an error
                const errors = flowValidator.getLastErrors();
                logger.error(errors);
                throw (errors);
            }
        } else {
            return _declare();
        }
    };

    /**
     * brings a declared flow to live state
     */
    manager.intializeFlow = function (flowName) {
        flowDefinitions[flowName].initialize(this);
    };

    /**
     * declareSteps function - Declare new steps.
     * If there is already a step with the given name, it will be overwritten
     *
     * @param  {object} stepDefinition   The step definition (not the implementation)
     * @param  {string} stepName Optional: A new name under which the step should be registered
     * @param  {string} config Optional: A new config to overwrite the existing config in the step definition
     * @param  {boolean} overwrite Optional: If set to true, an exsiting step with the same name will be overwritten
     * @return {boolean} true if the step could be registered. False if there is a step with the same name
     */
    manager.declareSteps = function (step) {

        // first make a copy of the given step.
        const stepCopy = _.cloneDeep(step.stepImplementations);

        // a step definition my contain one or more steps.
        for (let stepName in stepCopy) {
            logger.debug(`Check the step name 'stepName'`);

            let tmpStep = stepCopy[stepName];
            delete(tmpStep.initialize); // delete the initilize function from the definition

            if (!stepValidator.validate(tmpStep, stepSchema)) {
                let errors = stepValidator.getLastErrors();
                logger.error(errors);
                throw (errors);
            }
        }

        // if we reach this point there where no errors
        stepImplementation.registerSteps(stepImplementations, step.stepImplementations);
    };

    // create list of all directories to load step definitions from
    const stepDirs = [path.join(__dirname, 'steps')];
    if (options.stepDirectories) {
        if (Array.isArray(options.stepDirectories)) {
            options.stepDirectories.each(function (d) {
                stepDirs.push(d);
            });
        } else {
            stepDirs.push(options.stepDirectories);
        }
    }

    return stepImplementation.registerStepsFromDirs(stepImplementations, stepDirs)
        .then(function (steps) {
            return new Promise(function (resolve) {
                if (options.flows) {
                    manager.declareFlows(options.flows, options.progressReporter);
                }

                resolve(manager);
            });
        });
};
