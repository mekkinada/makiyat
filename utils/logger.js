const winston = require('winston');

const { format } = winston;

const logDir = 'log';

const logger = winston.createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({
      format: 'DD-MM-YYYY HH:mm:ss',
    }),
    format.simple(),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  transports: [
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
      ),
    }),
    new winston.transports.File({ filename: `${logDir}/combined.log` }),
  ],
});


module.exports = logger;
