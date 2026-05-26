import type { IncomingMessage, ServerResponse } from 'node:http';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

let app: FastifyInstance | null = null;

export default async (req: IncomingMessage, res: ServerResponse) => {
  try {
    if (!app) {
      app = buildApp();
    }
    await app.ready();
    app.server.emit('request', req, res);
  } catch (err) {
    console.error('Failed to handle request:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};
