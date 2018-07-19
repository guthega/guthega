import { expect } from 'chai';
import log, { transports } from 'winston';
import convict from 'convict';

import { initReceiver, initSource } from '../src/initializer';

log.configure({
  level: 'error',
  transports: [
    new transports.Console(),
  ],
});

describe('initializer', () => {
  describe('initReceiver', () => {
    it('should fail on no args', () => {
      expect(() => initReceiver()).to.throw(Error);
    });
    it('should fail on null args', () => {
      expect(() => initReceiver(null)).to.throw(Error);
    });
    it('should fail on missing module config property', () => {
      const conf = convict({});
      conf.load({});
      expect(() => initReceiver(conf)).to.throw(Error);
    });
    it('should return for a known module', () => {
      const conf = convict({});
      conf.load({ module: '@guthega/log_receiver' });
      const r = initReceiver(conf);
      expect(r).to.exist;
    });
  });

  describe('initSource', () => {
    it('should fail on no args', () => {
      expect(() => initSource()).to.throw(Error, /Source configuration is null/);
      // done();
    });
    it('should fail on null args', () => {
      expect(() => initSource(null)).to.throw(Error, /Source configuration is null/);
      // done();
    });
    it('should fail on missing type config property', () => {
      const conf = convict({});
      conf.load({});
      expect(() => initSource(conf)).to.throw(Error, /Source configuration missing "type" setting/);
    });
    it('should fail on unknown type config property', () => {
      const conf = convict({});
      conf.load({ type: 'foo' });
      expect(() => initSource(conf)).to.throw(Error, /Unknown source type: foo/);
    });
  });
  describe('http', () => {
    it('should return for an http type', () => {
      const conf = convict({});
      conf.load({ type: 'http' });
      const r = initSource(conf);
      expect(r).to.exist;
    });
  });
  describe('kafka', () => {
    it('should return for an kafka type', () => {
      const conf = convict({});
      conf.load({ type: 'kafka', properties: { connection: { host: 'localhost:2181' }, topics: [] } });
      const r = initSource(conf);
      expect(r).to.exist;
    });
  });
  describe('redis', () => {
    it('should return for an redis type', () => {
      const conf = convict({});
      conf.load({ type: 'redis', properties: { connection: {} } });
      const r = initSource(conf);
      expect(r).to.exist;
    });
  });
  describe('amqp', () => {
    it('should return for an amqp type', () => {
      const conf = convict({});
      conf.load({ type: 'amqp', properties: { connection: {} } });
      const r = initSource(conf);
      expect(r).to.exist;
    });
  });
});
