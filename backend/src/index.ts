import { createServer } from 'http';
import app from './app';
import { initSocket } from './services/socketService';
import { startIrrigationEngine } from './services/irrigationEngine';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

const server = createServer(app);
initSocket(server, process.env.CORS_ORIGIN ?? '*');

server.listen(PORT, () => {
  console.log(`🌿 Agro Mind API running on http://localhost:${PORT}`);
  startIrrigationEngine();
});
