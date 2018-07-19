import http from 'http';
import uuid from 'uuid';
import log from 'winston';

class HttpSource {
  constructor(props) {
    this.port = props.port || 3001;
    this.host = props.host || '0.0.0.0';
  }

  start(receiver) {
    log.info('Starting HttpSource');
    const onListen = () => {
      log.info(`Server running at http://${this.host}:${this.port}/`);
    };

    const handler = (request, response) => {
      const requestId = uuid.v4();
      const msgContext = { requestId, gts: new Date() };

      const p = new Promise((res, rej) => {
        response.setHeader('X-Guthega-RequestID', requestId);

        if (request.method !== 'POST') {
          rej(new Error(`Unsupported method: ${request.method}`));
        } else {
          const body = [];
          request
            .on('error', e => rej(e))
            .on('data', d => body.push(d))
            .on('end', () => {
              try {
                receiver(JSON.parse(Buffer.concat(body).toString()), msgContext)
                  .then(r => res(r)) // the handler completed OK
                  .catch(e => rej(e)); // the handler correctly managed the error in its Promise setup
              } catch (e) {
                log.error('Uncaught error in handler', { errorMessage: e.message, name: e.name });
                rej(e); // some unexpected thing happened
              }
            });
        }
      });

      p.then((result) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(Object.assign({}, result, msgContext)));
      }).catch((err) => {
        response.statusCode = 400;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(Object.assign({}, err, msgContext)));
      });
    };

    this.server = http.createServer(handler.bind(this));
    this.server.listen(this.port, this.host, onListen.bind(this));
    log.info('HttpSource started');
  }

  close(callback) {
    if (this.server) {
      this.server.close(callback);
    }
  }
}

export default HttpSource;
