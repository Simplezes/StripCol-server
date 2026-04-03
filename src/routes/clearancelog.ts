import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { clearanceService } from '../services/store.service.js';

export const clearanceRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post('/clearancelog', {
    schema: {
      body: {
        type: 'object',
        required: ['callsign', 'status'],
        properties: {
          callsign: { type: 'string', minLength: 3, maxLength: 8 },
          status: { type: 'boolean' },
        },
      },
    },
    handler: async (request, reply) => {
      const { callsign, status } = request.body as { callsign: string; status: boolean };

      await clearanceService.set(callsign, status);

      return reply.code(201).send({ status: 'saved', callsign, value: status });
    },
  });

  fastify.get('/clearancelog', async (request, reply) => {
    const entries = await clearanceService.getAll();

    const output = entries.map((e) => `${e.callsign}:${e.status}`).join('\n');

    return reply.type('text/plain').send(output);
  });
};
