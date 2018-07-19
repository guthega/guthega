import log from 'winston';
import KafkaSource from './sources/kafka';
import HttpSource from './sources/http';
import RedisSource from './sources/redis';
import AmqpSource from './sources/amqp';

export const initReceiver = (config) => {
  if (config == null) {
    throw new Error('Receiver configuration is null');
  }
  if (!config.has('module')) {
    throw new Error('Receiver configuration missing "module" setting');
  }

  const receiver = require(config.get('module')); // eslint-disable-line global-require,import/no-dynamic-require

  /*
   * Transpiled modules from ES6 will have a 'default' property from the upstream call to 'require'.
   * Since they're not 'imported', we need to clean this up.
   */
  const r = receiver.__esModule ? receiver.default : receiver; // eslint-disable-line no-underscore-dangle

  return r({ log, config: config.has('properties') ? config.get('properties') : {} });
};

export const initSource = (config) => {
  if (config == null) {
    throw new Error('Source configuration is null');
  }
  if (!config.has('type')) {
    throw new Error('Source configuration missing "type" setting');
  }

  const sourceType = config.get('type');
  const sourceProperties = config.has('properties') ? config.get('properties') : {};

  switch (sourceType) {
    case 'kafka':
      return new KafkaSource(sourceProperties);
    case 'http':
      return new HttpSource(sourceProperties);
    case 'redis':
      return new RedisSource(sourceProperties);
    case 'amqp':
      return new AmqpSource(sourceProperties);
    default:
      throw new Error(`Unknown source type: ${sourceType}`);
  }
};
