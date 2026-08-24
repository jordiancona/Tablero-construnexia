import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { emitBoardEvent } from '../socket';

export async function boardRoutes(fastify: FastifyInstance) {
  // Obtener todos los tableros
  fastify.get('/api/boards', async (request, reply) => {
    try {
      const boards = await prisma.board.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          columns: {
            include: {
              tasks: true,
            },
          },
        },
      });
      return boards;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Error al obtener los tableros' });
    }
  });

  // Obtener un tablero por ID con columnas y tareas ordenadas
  fastify.get<{ Params: { id: string } }>('/api/boards/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      const board = await prisma.board.findUnique({
        where: { id },
        include: {
          columns: {
            orderBy: { order: 'asc' },
            include: {
              tasks: {
                orderBy: { order: 'asc' },
              },
            },
          },
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      });

      if (!board) {
        return reply.status(404).send({ error: 'Tablero no encontrado' });
      }

      return board;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Error al obtener el tablero' });
    }
  });

  // Crear un nuevo tablero
  fastify.post<{ Body: { title: string; description?: string } }>(
    '/api/boards',
    async (request, reply) => {
      const { title, description } = request.body;

      if (!title || title.trim() === '') {
        return reply.status(400).send({ error: 'El título del tablero es requerido' });
      }

      try {
        const board = await prisma.board.create({
          data: {
            title: title.trim(),
            description: description?.trim() || '',
            columns: {
              create: [
                { title: 'Por Hacer', order: 0 },
                { title: 'En Proceso', order: 1 },
                { title: 'En Revisión', order: 2 },
                { title: 'Completado', order: 3 },
              ],
            },
            activities: {
              create: {
                action: 'BOARD_CREATED',
                details: `Tablero "${title}" creado.`,
              },
            },
          },
          include: {
            columns: {
              orderBy: { order: 'asc' },
              include: { tasks: true },
            },
          },
        });

        return reply.status(201).send(board);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Error al crear el tablero' });
      }
    }
  );

  // Eliminar un tablero
  fastify.delete<{ Params: { id: string } }>('/api/boards/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      await prisma.board.delete({ where: { id } });
      emitBoardEvent(id, 'board_deleted', { boardId: id });
      return { success: true, message: 'Tablero eliminado' };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Error al eliminar el tablero' });
    }
  });
}
