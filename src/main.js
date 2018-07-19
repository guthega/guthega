import { ArgumentParser } from 'argparse';
import convict from 'convict';

import Guthega from './guthega';
import { initReceiver, initSource } from './initializer';
import log from './log';

const appVersion = `${VERSION}`; // eslint-disable-line no-undef

const argparse = new ArgumentParser({
  version: appVersion,
  addHelp: true,
  description: 'Guthega server for handling messages in a Lambda-like fashion',
});

argparse.addArgument(
  ['-s', '--sourceConfig'],
  { help: 'path to configuration file', defaultValue: './conf/source.json' },
);
argparse.addArgument(
  ['-r', '--receiverConfig'],
  { help: 'path to receiver-specific configuration file', defaultValue: './conf/receiver.json' },
);

const args = argparse.parseArgs();

log.info(`Working directory is ${process.cwd()}`);
log.info(`Source configuration: ${args.sourceConfig}`);
log.info(`Receiver configuration: ${args.receiverConfig}`);
log.info(`Starting guthega server v${appVersion}`);

const sourceConfig = convict({});
sourceConfig.loadFile(args.sourceConfig);

const receiverConfig = convict({});
receiverConfig.loadFile(args.receiverConfig);

const guthega = new Guthega();

guthega.useSource(initSource(sourceConfig));
guthega.useReceiver(initReceiver(receiverConfig));

const cleanExit = () => process.exit(0);

process.once('SIGINT', () => {
  guthega.stop(cleanExit);
});

process.once('SIGTERM', () => {
  guthega.stop(cleanExit);
});

guthega.start();
