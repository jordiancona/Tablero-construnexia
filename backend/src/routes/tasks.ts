import { FastifyInstance } from 'fastify';
import { Priority } from '@prisma/client';
import { prisma } from '../db/client';
import { emitBoardEvent } from '../socket';

export async function taskRoutes(fastify: FastifyInstance) {
  // Crear nueva tarea
  fastify.post<{
    Body: {
      title: string;
      description?: string;
      priority?: Priority;
      columnId: string;
      boardId: string;
      assignedToId?: string | null;
    };
  }>('/api/tasks', async (request, reply) => {
    const { title, description, priority = 'MEDIUM', columnId, boardId, assignedToId } = request.body;

    if (!title || !columnId || !boardId) {
      return reply.status(400).send({ error: 'Título, columnId y boardId son requeridos' });
    }

    try {
      const lastTask = await prisma.task.findFirst({
        where: { columnId },
        orderBy: { order: 'desc' },
      });

      const newOrder = lastTask ? lastTask.order + 1 : 0;

      const task = await prisma.task.create({
        data: {
          title: title.trim(),
          description: description?.trim() || '',
          priority,
          order: newOrder,
          columnId,
          assignedToId: assignedToId || null,
        },
        include: {
          assignedToUser: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      });

      let assigneeMsg = '';
      if (task.assignedToUser) {
        assigneeMsg = ` asignada a ${task.assignedToUser.name}`;
      }

      await prisma.activityLog.create({
        data: {
          boardId,
          action: 'TASK_CREATED',
          details: `Tarea "${task.title}" creada${assigneeMsg}.`,
        },
      });

      emitBoardEvent(boardId, 'task_created', { task, columnId });
      return reply.status(201).send(task);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Error al crear la tarea' });
    }
  });

  // Editar tarea
  fastify.put<{
    Params: { id: string };
    Body: {
      title?: string;
      description?: string;
      priority?: Priority;
      columnId?: string;
      boardId: string;
      assignedToId?: string | null;
    };
  }>('/api/tasks/:id', async (request, reply) => {
    const { id } = request.params;
    const { title, description, priority, columnId, boardId, assignedToId } = request.body;

    try {
      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          ...(title && { title: title.trim() }),
          ...(description !== undefined && { description: description.trim() }),
          ...(priority && { priority }),
          ...(columnId && { columnId }),
          ...(assignedToId !== undefined && { assignedToId: assignedToId || null }),
        },
        include: {
          assignedToUser: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      });

      if (boardId) {
        emitBoardEvent(boardId, 'task_updated', updatedTask);
      }

      return updatedTask;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Error al actualizar la tarea' });
    }
  });

  // Reordenar / Mover tareas entre columnas
  fastify.put<{
    Body: {
      boardId: string;
      tasks: { id: string; columnId: string; order: number }[];
    };
  }>('/api/tasks/reorder', async (request, reply) => {
    const { boardId, tasks } = request.body;

    try {
      await prisma.$transaction(
        tasks.map((item) =>
          prisma.task.update({
            where: { id: item.id },
            data: {
              columnId: item.columnId,
              order: item.order,
            },
          })
        )
      );

      emitBoardEvent(boardId, 'tasks_reordered', tasks);
      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Error al reordenar las tareas' });
    }
  });

  // Eliminar tarea
  fastify.delete<{ Params: { id: string }; Querystring: { boardId: string } }>(
    '/api/tasks/:id',
    async (request, reply) => {
      const { id } = request.params;
      const { boardId } = request.query;

      try {
        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) {
          return reply.status(404).send({ error: 'Tarea no encontrada' });
        }

        await prisma.task.delete({ where: { id } });

        if (boardId) {
          await prisma.activityLog.create({
            data: {
              boardId,
              action: 'TASK_DELETED',
              details: `Tarea "${task.title}" eliminada.`,
            },
          });

          emitBoardEvent(boardId, 'task_deleted', { taskId: id, columnId: task.columnId });
        }

        return { success: true };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Error al eliminar la tarea' });
      }
    }
  );
}
