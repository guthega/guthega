import { connect } from 'amqplib';
import uuid from 'uuid';
import log from 'winston';

class AmqpSource {
  constructor(props) {
    const {
      connection, queue,
    } = props;

    this.connection = connection;
    this.queue = queue;
  }

  start(receiver) {
    log.info('Starting AmqpSource');
    this.amqp = connect(this.connection);

    const handleConnect = (conn) => {
      this.connection = conn;

      return conn;
    };

    handleConnect.bind(this);

    const q = this.queue;

    this.amqp
      .then(handleConnect)
      .then(conn => conn.createChannel())
      .then((chan) => {
        chan.assertQueue(q);
        return chan;
      })
      .then((chan) => {
        chan.on('error', (err) => {
          log.error('AMQP client error', { errorMessage: err.message, name: err.name });
        });

        chan.on('blocked', (why) => {
          log.info(`AMQP server blocked this client: ${why}`);
        });

        chan.on('unblocked', () => {
          log.info('AMQP server unblocked this client');
        });

        return chan;
      })
      .then(c => c.consume(q, (message) => {
        log.debug('Received message from server', message);
        const requestId = uuid.v4();
        const msgContext = { requestId, queue: q, gts: new Date() };

        const p = new Promise(((res, rej) => {
          try {
            receiver(JSON.parse(message.content.toString()), msgContext)
              .then((r) => {
                c.ack(message);
                res(r);
              }) // the handler completed OK
              .catch((e) => {
                c.reject(message);
                rej(e);
              }); // the handler correctly managed the error in its Promise setup
          } catch (e) {
            log.error('Uncaught error in handler', { errorMessage: e.message, name: e.name });
            c.reject(message);
            rej(e); // some unexpected thing happened
          }
        }));

        p.then(() => log.info('Handler completed', msgContext))
          .catch(e => log.error('Handler failed', Object.assign({}, e, msgContext)));
      }, { noAck: false }));
    log.info('AmqpSource started');
  }

  close(callback) {
    this.connection.close(callback);
  }
}

export default AmqpSource;
