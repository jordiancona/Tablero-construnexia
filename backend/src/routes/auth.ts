import { FastifyInstance } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../db/client';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function authRoutes(fastify: FastifyInstance) {
  // Autenticación mediante ID Token de Google o Usuario Demo
  fastify.post<{ Body: { idToken?: string; demoUser?: { email: string; name: string; avatar?: string } } }>(
    '/api/auth/google',
    async (request, reply) => {
      const { idToken, demoUser } = request.body;

      let email = '';
      let name = '';
      let avatar: string | undefined = undefined;
      let googleId = '';

      try {
        if (idToken && idToken !== 'DEMO_GOOGLE_TOKEN') {
          // Validar token oficial de Google
          const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (!payload || !payload.email) {
            return reply.status(400).send({ error: 'Token de Google inválido' });
          }
          email = payload.email;
          name = payload.name || payload.email.split('@')[0];
          avatar = payload.picture;
          googleId = payload.sub;
        } else if (demoUser) {
          // Modo demostración local
          email = demoUser.email;
          name = demoUser.name;
          avatar = demoUser.avatar;
          googleId = `google-demo-${email}`;
        } else {
          return reply.status(400).send({ error: 'Token o datos de usuario no proporcionados' });
        }

        let userId = `user-${googleId}`;

        // Intentar guardar/buscar en PostgreSQL con Prisma si la BD está conectada
        try {
          let dbUser = await prisma.user.findUnique({ where: { email } });
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: { googleId, email, name, avatar },
            });
          }
          userId = dbUser.id;
        } catch (dbErr) {
          fastify.log.warn({ err: dbErr }, '⚠️ PostgreSQL no respondió, procediendo con usuario autenticado en memoria');
        }

        // Generar JWT firmado por Fastify
        const token = fastify.jwt.sign({
          id: userId,
          email,
          name,
          avatar,
        });

        return reply.send({
          token,
          user: {
            id: userId,
            email,
            name,
            avatar,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Error al procesar el inicio de sesión' });
      }
    }
  );

  // Obtener perfil del usuario actual
  fastify.get('/api/auth/me', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    return request.user;
  });
}
