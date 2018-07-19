import { expect } from 'chai';
import { EventEmitter } from 'events';
import log, { transports } from 'winston';

import Guthega from '../src/guthega';

log.configure({
  level: 'error',
  transports: [
    new transports.Console(),
  ],
});

describe('Guthega', () => {
  it('should fail on null source', () => {
    expect(() => {
      new Guthega().useSource(null);
    }).to.throw(Error);
  });

  it('should fail on null receiver', (done) => {
    expect(() => {
      new Guthega().useReceiver(null);
    }).to.throw(Error, /Receiver is null/);

    done();
  });

  it('should fail on receiver that is not a function', (done) => {
    expect(() => {
      new Guthega().useReceiver('test');
    }).to.throw(Error, /Receiver is not a function/);

    done();
  });

  it('should fail on start if source is not set', (done) => {
    expect(() => {
      new Guthega().start();
    }).to.throw(Error, /Unable to start, source has not been configured/);

    done();
  });

  it('should handle an in-memory message', (done) => {
    let receivedMessage = null;

    const em = new EventEmitter();

    const receiver = message => new Promise((res) => {
      receivedMessage = message;
      res(message);
    });

    const g = new Guthega();
    g.useReceiver(receiver);
    g.useSource({
      start: (recv) => {
        em.on('message', msg => (recv(msg)));
      },
      close: () => {},
    });

    g.start();

    em.emit('message', 'test');

    g.stop();

    expect(receivedMessage).to.exist; // eslint-disable-line no-unused-expressions
    expect(receivedMessage).to.eql('test');
    done();
  });
});
