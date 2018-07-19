import { expect } from 'chai';
import request from 'request';
import log, { transports } from 'winston';

import HttpSource from '../../src/sources/http';

log.configure({
  level: 'error',
  transports: [
    new transports.Console(),
  ],
});

describe('HttpSource', () => {
  const s = new HttpSource({});

  before(() => {
    s.close(() => {});
    s.start(m => new Promise(res => (res(m))));
  });

  after(() => {
    s.close(() => {});
  });

  it('should respond', (done) => {
    const options = {
      uri: 'http://localhost:3001',
      method: 'POST',
      json: {},
    };

    request(options, (err, res, body) => {
      expect(err).to.not.exist;
      expect(res.statusCode).to.be.eq(200);
      expect(body).to.exist;
      done();
    });
  });
});
