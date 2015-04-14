/*
 * Defines some functions which should be available in each step/flow
 *
 */


/**
 * log - Used to write any log messages
 *
 * @param  {json} data a JSON object whith the data to be logged
 * @param  {number} loglevel Optional: (default info) The loglevel for this log
 * @param  {funtion} fomater Optional: A formater to format the data to a string.
 * @return nothing
 */
function log(data, loglevel, fomater) {};


/**
 * statisticLog - logs statistic information about a step. The idea is t call this when a step will be initialized.
 * Or every time a new call was made on an endpoint. So it was possible to monitor which load is on which steps.
 * Mayby this could be already done from the manager. So that the user only needs to call it for additional information
 *
 * @param  {string} stepName      The name of the step
 * @param  {string} subIdentifier Optional: Any sub identifier if there are different parts to be loged
 * @param  {number} value         Optional: a number to be used for the log. Default is 1
 * @return nothing
 */
function statisticLog(stepName, subIdentifier, value) {};



/**
 * pause - Pauses the current step. If the step is paused, it will block any new request (it will not start reading for new request on endpoints).
 * The current request will be finished.
 *
 * @return nothing
 */
function pause() {};

/**
 * resume - Resumes a paused step
 *
 * @return nothing
 */
function resume() {};

/**
 * abort - Aborts the surrent step immediately, even if the step is in processing.
 *
 * @return nothing
 */
function abort() {};
