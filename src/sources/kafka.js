import uuid from 'uuid';
import log from 'winston';
import { ConsumerGroup } from 'kafka-node';

class KafkaSource {
  constructor(props) {
    const {
      connection, topics,
    } = props;

    this.connection = connection;
    this.topics = topics;
  }

  start(receiver) {
    log.info('Starting KafkaSource');
    this.consumer = new ConsumerGroup(this.connection, this.topics);
    this.consumer.on('error', (err) => {
      log.error('Kafka consumer error', { errorMessage: err.message, name: err.name });
    });

    this.consumer.on('connect', () => {
      log.info('Connected to Kafka server, waiting for messages');
    });

    this.consumer.on('message', (message) => {
      const requestId = uuid.v4();
      const key = !message.key ? null : JSON.parse(message.key);
      const { topic } = message;

      const msgContext = {
        requestId, key, topic, gts: new Date(),
      };

      const p = new Promise(((res, rej) => {
        try {
          receiver(JSON.parse(message.value), msgContext)
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
    log.info('KafkaSource started');
  }

  close(callback) {
    this.consumer.close(true, callback);
  }
}

export default KafkaSource;
