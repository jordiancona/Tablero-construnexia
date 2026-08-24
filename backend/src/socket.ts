import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: SocketIOServer | null = null;

const JWT_SECRET = process.env.JWT_SECRET || 'construnexia_super_secret_jwt_key_2026_tablero';

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
  });

  // Middleware de autenticación de Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.warn(`[Socket.io] Conexión anónima (sin token JWT): ${socket.id}`);
      return next(); // Permitir modo anónimo o restringir según lógica
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (socket as any).user = decoded;
      console.log(`[Socket.io] Autenticado correctamente: ${(decoded as any).email}`);
      next();
    } catch (err) {
      console.error('[Socket.io] Token JWT inválido en handshake:', err);
      next(new Error('Autenticación de socket fallida'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Cliente conectado: ${socket.id}`);

    socket.on('join_board', (boardId: string) => {
      socket.join(`board:${boardId}`);
      console.log(`[Socket.io] Cliente ${socket.id} se unió a la sala board:${boardId}`);
    });

    socket.on('leave_board', (boardId: string) => {
      socket.leave(`board:${boardId}`);
      console.log(`[Socket.io] Cliente ${socket.id} salió de la sala board:${boardId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io no ha sido inicializado.');
  }
  return io;
}

export function emitBoardEvent(boardId: string, event: string, payload: any) {
  if (io) {
    io.to(`board:${boardId}`).emit(event, payload);
  }
}
