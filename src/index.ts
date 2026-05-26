import 'dotenv/config';
import { buildApp } from './app.js';
import { squawkService, clearanceService } from './services/store.service.js';

const app = buildApp();

async function start() {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });

    console.log(`Server listening on http://localhost:${port}`);

    let cleanupTimeout: ReturnType<typeof setTimeout> | null = null;

    const scheduleCleanup = () => {
      const minMs = 40 * 60 * 1000;
      const maxMs = 60 * 60 * 1000;
      const delay = minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
      cleanupTimeout = setTimeout(async () => {
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

    const shutdown = async () => {
      if (cleanupTimeout) clearTimeout(cleanupTimeout);
      await app.close();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
