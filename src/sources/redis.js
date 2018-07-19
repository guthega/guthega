import { createClient } from 'redis';
import uuid from 'uuid';
import log from 'winston';

class RedisSource {
  constructor(props) {
    const {
      connection, channel,
    } = props;

    this.connection = connection;
    this.channel = channel;
  }

  start(receiver) {
    log.info('Starting RedisSource');
    this.redis = createClient(this.connection);

    this.redis.on('error', (err) => {
      log.error('Redis client error', { errorMessage: err.message, name: err.name });
    });

    this.redis.on('connect', () => {
      log.info('Connected to Redis server');
    });

    this.redis.on('psubscribe', (pattern, count) => {
      log.info(`Subscribed to ${pattern}. Subscriber count is ${count}`);
    });

    this.redis.on('pmessage', (pattern, channel, message) => {
      const requestId = uuid.v4();
      const msgContext = {
        requestId, pattern, channel, gts: new Date(),
      };

      const p = new Promise(((res, rej) => {
        try {
          receiver(JSON.parse(message), msgContext)
            .then(r => res(r)) // the handler completed OK
            .catch(e => rej(e)); // the handler correctly managed the error in its Promise setup
        } catch (e) {
          log.error('Uncaught error in handler', { errorMessage: e.message, name: e.name });
          rej(e); // some unexpected thing happened
        }
      }));

      p.then(() => log.info('Handler completed', msgContext))
        .catch(e => log.error('Handler failed', Object.assign(msgContext, { e })));
    });

    this.redis.psubscribe(this.channel);
    log.info('RedisSource started');
  }

  close(callback) {
    if (this.redis) {
      this.redis.punsubscribe(this.channel);
      this.redis.quit();
    }
    callback();
  }
}

export default RedisSource;
