import { SetupServer } from './server';
import config from 'config';

const port: number = config.get('App.port');
console.log('choosen port -> ', port);

(async () => {
  console.info('Bootstrapping application');

  const server = new SetupServer(port);
  await server.init();
  server.start();
})();
