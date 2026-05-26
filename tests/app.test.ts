import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';

vi.mock('../src/services/store.service.js', () => ({
  squawkService: { set: vi.fn(), getAll: vi.fn(async () => []), cleanup: vi.fn() },
  clearanceService: { set: vi.fn(), getAll: vi.fn(async () => []), cleanup: vi.fn() },
}));

describe('App Root', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 OK on GET /', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ok',
      version: '1.0.0',
      message: 'StripCol Server is running',
    });
  });
});
