function handler(server) {
  server.log.debug('Example module configuration', server.config);
  return function messageReceived(message, messageContext) {
    server.log.debug('Message context', messageContext);
    server.log.debug('Message content', message);

    return new Promise((res) => {
      res({});
    });
  };
}

module.exports = handler;
