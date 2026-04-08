import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';

const DATA_DIR = join(process.cwd(), 'data');

export const filesRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get('/files/:name', async (request, reply) => {
    const { name } = request.params as { name: string };

    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      return reply.code(400).send({ error: 'Invalid file name' });
    }

    const filePath = join(DATA_DIR, `${name}.json`);

    try {
      const content = await readFile(filePath, 'utf-8');
      return reply.type('application/json').send(content);
    } catch {
      return reply.code(404).send({ error: 'File not found' });
    }
  });
};
