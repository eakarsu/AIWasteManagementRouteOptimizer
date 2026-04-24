import express from 'express';
import cors from 'cors';
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

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
