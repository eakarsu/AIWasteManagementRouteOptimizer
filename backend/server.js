import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import auth from './middleware/auth.js';
import governanceRouter from './governance/index.js';

import authRoutes from './routes/auth.js';
import routesRoutes from './routes/routes.js';
import binsRoutes from './routes/bins.js';
import vehiclesRoutes from './routes/vehicles.js';
import schedulesRoutes from './routes/schedules.js';
import zonesRoutes from './routes/zones.js';
import driversRoutes from './routes/drivers.js';
import reportsRoutes from './routes/reports.js';
import alertsRoutes from './routes/alerts.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

for (const name of ['DATABASE_URL', 'GOVERNANCE_TENANT_ID']) {
  if (!process.env[name]) throw new Error(`${name} is required`);
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

const app = express();
const PORT = process.env.PORT || process.env.BACKEND_PORT || 3001;
const generatedRoutesEnabled = process.env.ENABLE_GENERATED_FEATURES === 'true' && process.env.NODE_ENV !== 'production';

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', generatedRoutesEnabled, timestamp: new Date().toISOString() });
});

app.use('/api', auth);
app.use('/api/governance', governanceRouter);
app.use('/api/routes', routesRoutes);
app.use('/api/bins', binsRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/zones', zonesRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/alerts', alertsRoutes);

if (generatedRoutesEnabled) {
  const generated = await Promise.all([
    import('./routes/ai.js'), import('./routes/customFeatures.js'), import('./routes/customViews.js')
  ]);
  app.use('/api/ai', generated[0].default);
  app.use('/api/custom', generated[1].default);
  app.use('/api/custom-views', generated[2].default);
}

app.use((req, res) => res.status(404).json({ error: 'not found', path: req.originalUrl }));
app.use((err, req, res, next) => {
  console.error('Unhandled request error:', err.message);
  res.status(500).json({ error: 'internal server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
