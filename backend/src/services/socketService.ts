import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';

let io: IOServer;

export function initSocket(server: HttpServer, corsOrigin: string): IOServer {
  io = new IOServer(server, {
    cors: { origin: corsOrigin, methods: ['GET', 'POST'] },
  });
  io.on('connection', (socket: Socket) => {
    console.log(`[socket] client connected: ${socket.id}`);
    socket.on('disconnect', () => console.log(`[socket] client disconnected: ${socket.id}`));
  });
  return io;
}

export function getIO(): IOServer {
  if (!io) throw new Error('Socket.IO not initialised');
  return io;
}
