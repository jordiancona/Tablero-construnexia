import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { initSocketIO } from './socket';
import { authRoutes } from './routes/auth';
import { boardRoutes } from './routes/boards';
import { columnRoutes } from './routes/columns';
import { taskRoutes } from './routes/tasks';
import { activityRoutes } from './routes/activity';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'construnexia_super_secret_jwt_key_2026_tablero';

const fastify = Fastify({
  logger: true,
});

async function start() {
  try {
    // Registrar CORS para habilitar conexiones desde React/Vite
    await fastify.register(cors, {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    });

    // Registrar plugin de JWT
    await fastify.register(fastifyJwt, {
      secret: JWT_SECRET,
    });

    // Decorador global para verificar JWT en rutas protegidas
    fastify.decorate('authenticate', async (request: any, reply: any) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ error: 'No autorizado. Se requiere token JWT válido.' });
      }
    });

    // Inicializar Socket.io con el servidor HTTP subyacente de Fastify
    initSocketIO(fastify.server);

    // Registrar rutas REST
    await fastify.register(authRoutes);
    await fastify.register(boardRoutes);
    await fastify.register(columnRoutes);
    await fastify.register(taskRoutes);
    await fastify.register(activityRoutes);

    // Ruta de estado / health check
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Escuchar servidor
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`🚀 Servidor Fastify corriendo en http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
