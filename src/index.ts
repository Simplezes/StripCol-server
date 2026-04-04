import 'dotenv/config';
import { buildApp } from './app.js';
import { squawkService, clearanceService } from './services/store.service.js';

const app = buildApp();

async function start() {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });

    console.log(`Server listening on http://localhost:${port}`);

    const scheduleCleanup = () => {
      const minMs = 40 * 60 * 1000;
      const maxMs = 60 * 60 * 1000;
      const delay = minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
      setTimeout(async () => {
        try {
          await Promise.all([squawkService.cleanup(), clearanceService.cleanup()]);
        } catch (err) {
          app.log.error(err, 'Cleanup failed');
        } finally {
          scheduleCleanup();
        }
      }, delay);
    };
    scheduleCleanup();
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
