import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

import authRoutes from './routes/auth.js';
import routesRoutes from './routes/routes.js';
import binsRoutes from './routes/bins.js';
import vehiclesRoutes from './routes/vehicles.js';
import schedulesRoutes from './routes/schedules.js';
import zonesRoutes from './routes/zones.js';
import driversRoutes from './routes/drivers.js';
import reportsRoutes from './routes/reports.js';
import alertsRoutes from './routes/alerts.js';
import aiRoutes from './routes/ai.js';
import customFeaturesRoutes from './routes/customFeatures.js';

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/bins', binsRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/zones', zonesRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/custom', customFeaturesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// // === Batch 09 Gaps & Frontend Mounts ===
app.use('/api/gap-ai-aiwastemanagementrouteoptimizer', require('./routes/batch09GapAi')); // // === Batch 09 Gaps & Frontend Mounts ===
app.use('/api/gap-nonai-aiwastemanagementrouteoptimizer', require('./routes/batch09GapNonai')); // // === Batch 09 Gaps & Frontend Mounts ===

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


