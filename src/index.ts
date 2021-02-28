import { SetupServer } from './server';
import config from 'config';

const port: number = config.get('App.port');

(async () => {
  console.info('Bootstrapping application');
  const server = new SetupServer(port);
  await server.init();
  server.start();
})();
