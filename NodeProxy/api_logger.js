var winston = require('winston');
var util = require('util');
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ raw: true }),
    new (winston.transports.File)({ filename: 'api.log' })
  ]
});

/**
 * Set the Logging event for the Winston
 * @param event
 */
exports.onLog = function (event) {
  logger.info(JSON.stringify(event));
};