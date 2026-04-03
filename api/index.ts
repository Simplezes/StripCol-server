import { buildApp } from '../src/app.js';

let app: any;

export default async (req: any, res: any) => {
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
