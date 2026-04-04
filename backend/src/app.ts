import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import authRouter from './routes/auth';
import dashboardRouter from './routes/dashboard';
import diseaseRouter from './routes/disease';
import chatRouter from './routes/chat';
import cropsRouter from './routes/crops';
import sensorsRouter from './routes/sensors';
import irrigationRouter from './routes/irrigation';
import settingsRouter from './routes/settings';

const app = express();

// ── Ensure upload directory exists ──────────────────────────────────────────
const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? './uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── CORS ─────────────────────────────────────────────────────────────────────
// Origin is read at request time so that the env var can be overridden in tests
// without requiring a module reload.
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowed = process.env.CORS_ORIGIN ?? '*';
    callback(null, allowed === '*' ? true : allowed);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Handle preflight OPTIONS requests for every route
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(uploadDir));

// Serve frontend from project root (one level up from backend)
app.use(express.static(path.resolve(__dirname, '../../')));

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/disease', diseaseRouter);
app.use('/api/chat', chatRouter);
app.use('/api/crops', cropsRouter);
app.use('/api/sensors', sensorsRouter);
app.use('/api/irrigation', irrigationRouter);
app.use('/api/settings', settingsRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 catch-all for API routes ─────────────────────────────────────────────
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

export default app;
