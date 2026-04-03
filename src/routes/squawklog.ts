import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { squawkService } from '../services/store.service.js';

/**
 * Routes for managing squawk codes.
 */
export const squawkRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // POST /squawklog
  fastify.post('/squawklog', {
    schema: {
      body: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string', pattern: '^[0-7]{4}$' },
        },
      },
    },
    handler: async (request, reply) => {
      const { code } = request.body as { code: string };
      const timestamp = await squawkService.set(code);

      return reply.code(201).send({ status: 'saved', code, timestamp });
    },
  });

  // GET /squawklog
  fastify.get('/squawklog', async (request, reply) => {
    const entries = await squawkService.getAll();

    // Format as requested: "CODE\tTIMESTAMP"
    const output = entries.map((e) => `${e.code}\t${e.createdAt}`).join('\n');

    return reply.type('text/plain').send(output);
  });
};
