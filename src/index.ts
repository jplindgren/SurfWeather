import { SetupServer } from './server';
import config from 'config';
import logger from './logger';

const port: number = config.get('App.port');

enum ExitStatus {
  Failure = 1,
  Success = 0,
}

function LogAndExitWithError(err: Error) {
  logger.error(`App exited with error: ${err}`);
  process.exit(ExitStatus.Failure);
}

process.on(
  'unhandledRejection',
  (reason: {} | null | undefined, promise: Promise<any>) => {
    logger.error(
      `App exiting due to an unhandled promise: ${promise} and reason: ${reason}`
    );
    throw reason;
  }
);

process.on('uncaughtException', (error: Error) => {
  logger.error(error);
  throw error;
});

(async () => {
  try {
    console.info('Bootstrapping application');

    const server = new SetupServer(port);
    await server.init();
    server.start();

    const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    exitSignals.forEach((signal) =>
      process.on(signal, async () => {
        try {
          await server.close();
          logger.info(`App exited with success`);
          process.exit(ExitStatus.Success);
        } catch (err) {
          LogAndExitWithError(err);
        }
      })
    );
  } catch (err) {
    LogAndExitWithError(err);
  }
})();
