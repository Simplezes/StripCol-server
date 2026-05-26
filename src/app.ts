import crypto from 'node:crypto';
import fastify, { FastifyInstance } from 'fastify';
import sensible from '@fastify/sensible';
import { squawkRoutes } from './routes/squawklog.js';
import { clearanceRoutes } from './routes/clearancelog.js';
import { filesRoutes } from './routes/files.js';

export function buildApp(): FastifyInstance {
  const isProduction = process.env.NODE_ENV === 'production';
  const app = fastify({
    logger: isProduction
      ? true
      : {
          transport: {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          },
        },
  });

  app.register(sensible);

  app.addHook('onRequest', async (request, reply) => {
    if (request.url === '/' || request.url.startsWith('/files/')) return;

    const apiKey = request.headers['x-api-key'];
    if (!apiKey || typeof apiKey !== 'string') {
      return reply.code(401).send({ error: 'Unauthorized: Missing API Key' });
    }

    const envKey = process.env.API_KEY;
    if (!envKey) {
      return reply.code(500).send({ error: 'Internal Server Error: API Key not configured' });
    }

    const providedKeyBuffer = Buffer.from(apiKey);
    const expectedKeyBuffer = Buffer.from(envKey);

    if (
      providedKeyBuffer.length !== expectedKeyBuffer.length ||
      !crypto.timingSafeEqual(providedKeyBuffer, expectedKeyBuffer)
    ) {
      return reply.code(403).send({ error: 'Forbidden: Invalid API Key' });
    }
  });

  app.register(squawkRoutes);
  app.register(clearanceRoutes);
  app.register(filesRoutes);

  app.get('/', async () => {
    return { status: 'ok', version: '1.0.0', message: 'StripCol Server is running' };
  });

  return app;
}
