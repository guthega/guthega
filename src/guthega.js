import { performance, PerformanceObserver } from 'perf_hooks';

import log from 'winston';

class Guthega {
  useSource(source) {
    if (!source) {
      throw new Error('Source is null');
    }

    this.source = source;
  }

  useReceiver(receiver) {
    if (!receiver) {
      throw new Error('Receiver is null');
    }
    if (typeof receiver !== 'function') {
      throw new Error('Receiver is not a function');
    }
    this.measuredHandler = performance.timerify(receiver);
  }

  start() {
    if (!this.source) {
      throw new Error('Unable to start, source has not been configured');
    }

    log.info('Starting guthega');

    const obs = new PerformanceObserver((list) => {
      const item = list.getEntries()[0];
      const perf = Object.assign({}, item['1'], {
        name: item.name || 'messageReceived', startTime: item.startTime, duration: item.duration,
      });
      log.info('Message handler performance', perf);
    });
    obs.observe({ entryTypes: ['function'] });

    this.source.start(this.measuredHandler);
    log.info('guthega service started');
  }

  stop(callback) {
    log.info('Stopping guthega');
    this.source.close(callback);
  }
}

export default Guthega;
