import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';

export async function activityRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { id: string } }>('/api/boards/:id/activity', async (request, reply) => {
    const { id } = request.params;
    try {
      const activities = await prisma.activityLog.findMany({
        where: { boardId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return activities;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Error al obtener el historial de actividad' });
    }
  });
}
