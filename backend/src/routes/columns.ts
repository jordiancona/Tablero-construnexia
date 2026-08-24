import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { emitBoardEvent } from '../socket';

export async function columnRoutes(fastify: FastifyInstance) {
  // Crear una nueva columna
  fastify.post<{ Body: { title: string; boardId: string } }>(
    '/api/columns',
    async (request, reply) => {
      const { title, boardId } = request.body;

      if (!title || !boardId) {
        return reply.status(400).send({ error: 'Título y boardId son requeridos' });
      }

      try {
        const lastColumn = await prisma.column.findFirst({
          where: { boardId },
          orderBy: { order: 'desc' },
        });

        const newOrder = lastColumn ? lastColumn.order + 1 : 0;

        const column = await prisma.column.create({
          data: {
            title: title.trim(),
            boardId,
            order: newOrder,
          },
          include: {
            tasks: true,
          },
        });

        await prisma.activityLog.create({
          data: {
            boardId,
            action: 'COLUMN_CREATED',
            details: `Columna "${title}" creada.`,
          },
        });

        emitBoardEvent(boardId, 'column_created', column);
        return reply.status(201).send(column);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Error al crear la columna' });
      }
    }
  );

  // Actualizar título de columna
  fastify.put<{ Params: { id: string }; Body: { title: string } }>(
    '/api/columns/:id',
    async (request, reply) => {
      const { id } = request.params;
      const { title } = request.body;

      try {
        const column = await prisma.column.update({
          where: { id },
          data: { title: title.trim() },
          include: { tasks: true },
        });

        emitBoardEvent(column.boardId, 'column_updated', column);
        return column;
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Error al actualizar la columna' });
      }
    }
  );

  // Reordenar columnas de un tablero
  fastify.put<{ Body: { boardId: string; columnOrders: { id: string; order: number }[] } }>(
    '/api/columns/reorder',
    async (request, reply) => {
      const { boardId, columnOrders } = request.body;

      try {
        await prisma.$transaction(
          columnOrders.map((item) =>
            prisma.column.update({
              where: { id: item.id },
              data: { order: item.order },
            })
          )
        );

        emitBoardEvent(boardId, 'columns_reordered', columnOrders);
        return { success: true };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Error al reordenar las columnas' });
      }
    }
  );

  // Eliminar columna
  fastify.delete<{ Params: { id: string } }>('/api/columns/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const column = await prisma.column.findUnique({ where: { id } });
      if (!column) {
        return reply.status(404).send({ error: 'Columna no encontrada' });
      }

      await prisma.column.delete({ where: { id } });

      await prisma.activityLog.create({
        data: {
          boardId: column.boardId,
          action: 'COLUMN_DELETED',
          details: `Columna "${column.title}" eliminada.`,
        },
      });

      emitBoardEvent(column.boardId, 'column_deleted', { columnId: id });
      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Error al eliminar la columna' });
    }
  });
}
