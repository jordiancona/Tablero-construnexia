import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';

export async function userRoutes(fastify: FastifyInstance) {
  // Obtener lista de usuarios para asignación de tareas
  fastify.get('/api/users', async (request, reply) => {
    try {
      let users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
        },
        orderBy: { name: 'asc' },
      });

      return users;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Error al obtener los usuarios' });
    }
  });
}
