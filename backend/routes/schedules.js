import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schedules ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schedules WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { route_id, vehicle_id, driver_id, day_of_week, start_time, end_time, status, frequency } = req.body;
    const result = await pool.query(
      'INSERT INTO schedules (route_id, vehicle_id, driver_id, day_of_week, start_time, end_time, status, frequency) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [route_id, vehicle_id, driver_id, day_of_week, start_time, end_time, status || 'active', frequency]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { route_id, vehicle_id, driver_id, day_of_week, start_time, end_time, status, frequency } = req.body;
    const result = await pool.query(
      'UPDATE schedules SET route_id=$1, vehicle_id=$2, driver_id=$3, day_of_week=$4, start_time=$5, end_time=$6, status=$7, frequency=$8 WHERE id=$9 RETURNING *',
      [route_id, vehicle_id, driver_id, day_of_week, start_time, end_time, status, frequency, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM schedules WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ message: 'Schedule deleted', schedule: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
