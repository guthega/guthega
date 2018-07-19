import os from 'os';
import logger, { format, transports } from 'winston';

const guthegaLogProperties = (entry) => {
  const e = entry;
  e.processor = process.env.GUTHEGA_PROCESSOR_ID || os.hostname();
  return e;
};

logger.configure({
  level: process.env.GUTHEGA_LOG_LEVEL || 'debug',
  format: format.combine(
    format.timestamp(),
    format(guthegaLogProperties)(),
    format.json(),
  ),
  transports: [
    new transports.Console(),
  ],
});

export default logger;
