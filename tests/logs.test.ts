import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';

const { squawkStore, clearanceStore } = vi.hoisted(() => ({
  squawkStore: [] as { code: string; createdAt: string }[],
  clearanceStore: new Map<string, boolean>(),
}));

vi.mock('../src/services/store.service.js', () => ({
  squawkService: {
    set: vi.fn(async (code: string) => {
      const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      squawkStore.push({ code, createdAt });
      return createdAt;
    }),
    getAll: vi.fn(async () => [...squawkStore]),
    cleanup: vi.fn(async () => {}),
  },
  clearanceService: {
    set: vi.fn(async (callsign: string, status: boolean) => {
      clearanceStore.set(callsign.toUpperCase(), status);
    }),
    getAll: vi.fn(async () =>
      Array.from(clearanceStore.entries()).map(([callsign, status]) => ({ callsign, status }))
    ),
    cleanup: vi.fn(async () => {}),
  },
}));

describe('Logs Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    squawkStore.length = 0;
    clearanceStore.clear();
  });

  describe('SquawkLog', () => {
    it('should save and retrieve a squawk code', async () => {
      const postResponse = await app.inject({
        method: 'POST',
        url: '/squawklog',
        headers: { 'x-api-key': process.env.API_KEY },
        payload: { code: '1234' },
      });
      expect(postResponse.statusCode).toBe(201);

      const postData = postResponse.json();
      expect(postData.status).toBe('saved');
      expect(postData.code).toBe('1234');
      expect(postData.timestamp).toBeDefined();

      const getResponse = await app.inject({
        method: 'GET',
        url: '/squawklog',
        headers: { 'x-api-key': process.env.API_KEY },
      });
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.headers['content-type']).toContain('text/plain');

      const text = getResponse.body;
      expect(text).toContain('1234');
      expect(text).toContain(postData.timestamp);
    });

    it('should fail with invalid squawk code', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/squawklog',
        headers: { 'x-api-key': process.env.API_KEY },
        payload: { code: '8999' },
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe('ClearanceLog', () => {
    it('should save and retrieve a clearance status', async () => {
      const postResponse = await app.inject({
        method: 'POST',
        url: '/clearancelog',
        headers: { 'x-api-key': process.env.API_KEY },
        payload: { callsign: 'AVA1755', status: true },
      });
      expect(postResponse.statusCode).toBe(201);

      const postData = postResponse.json();
      expect(postData.status).toBe('saved');
      expect(postData.callsign).toBe('AVA1755');
      expect(postData.value).toBe(true);

      const getResponse = await app.inject({
        method: 'GET',
        url: '/clearancelog',
        headers: { 'x-api-key': process.env.API_KEY },
      });
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.headers['content-type']).toContain('text/plain');

      const text = getResponse.body;
      expect(text).toContain('AVA1755:true');
    });

    it('should update an existing callsign status', async () => {
      await app.inject({
        method: 'POST',
        url: '/clearancelog',
        headers: { 'x-api-key': process.env.API_KEY },
        payload: { callsign: 'AVA1755', status: false },
      });

      const getResponse = await app.inject({
        method: 'GET',
        url: '/clearancelog',
        headers: { 'x-api-key': process.env.API_KEY },
      });
      expect(getResponse.body).toContain('AVA1755:false');
    });
  });

  describe('Security', () => {
    it('should return 401 if API key is missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/squawklog',
      });
      expect(response.statusCode).toBe(401);
      expect(response.json().error).toContain('Missing API Key');
    });

    it('should return 403 if API key is invalid', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/squawklog',
        headers: { 'x-api-key': 'wrong-key' },
      });
      expect(response.statusCode).toBe(403);
      expect(response.json().error).toContain('Invalid API Key');
    });

    it('should allow access to root without API key', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      });
      expect(response.statusCode).toBe(200);
    });
  });
});
