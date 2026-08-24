import { FastifyRequest, FastifyReply } from 'fastify';

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthUserPayload;
    user: AuthUserPayload;
  }
}
