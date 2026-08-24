import { PrismaClient, Priority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando la siembra de datos de prueba...');

  // Eliminar datos previos opcionalmente
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();

  const board = await prisma.board.create({
    data: {
      title: '🚀 Proyecto ConstruNexia',
      description: 'Tablero principal de desarrollo, arquitectura y control de entregables.',
      columns: {
        create: [
          {
            title: '📌 Por Hacer',
            order: 0,
            tasks: {
              create: [
                {
                  title: 'Configurar canal de alertas Telegram/Slack',
                  description: 'Vincular Webhooks de Monitoreo de Servidor en produccion.',
                  priority: Priority.LOW,
                  order: 0,
                },
                {
                  title: 'Diseñar arquitectura multitenant',
                  description: 'Evaluar aislamiento por esquema o por fila en PostgreSQL.',
                  priority: Priority.HIGH,
                  order: 1,
                },
              ],
            },
          },
          {
            title: '⚡ En Proceso',
            order: 1,
            tasks: {
              create: [
                {
                  title: 'Integración WebSockets Socket.io',
                  description: 'Sincronizar movimiento de tarjetas en tiempo real.',
                  priority: Priority.URGENT,
                  order: 0,
                },
                {
                  title: 'Estilos visuales con Tailwind CSS v4',
                  description: 'Crear paleta de colores oscuros con acentos neón y microanimaciones.',
                  priority: Priority.MEDIUM,
                  order: 1,
                },
              ],
            },
          },
          {
            title: '🔍 En Revisión',
            order: 2,
            tasks: {
              create: [
                {
                  title: 'Pruebas de arrastrar y soltar con dnd-kit',
                  description: 'Verificar comportamientos inter-columna y animaciones de overlay.',
                  priority: Priority.HIGH,
                  order: 0,
                },
              ],
            },
          },
          {
            title: '✅ Completado',
            order: 3,
            tasks: {
              create: [
                {
                  title: 'Inicialización de Fastify + Prisma ORM',
                  description: 'Estructura base del backend, esquema PostgreSQL y rutas de API REST.',
                  priority: Priority.LOW,
                  order: 0,
                },
              ],
            },
          },
        ],
      },
      activities: {
        create: [
          {
            action: 'BOARD_CREATED',
            details: 'Tablero inicial de demo creado con éxito.',
          },
        ],
      },
    },
  });

  console.log(`✅ Tablero creado con éxito! ID: ${board.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
