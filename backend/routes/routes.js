import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM collection_routes ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM collection_routes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Route not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, zone_id, distance_km, estimated_time, status, stops, optimized } = req.body;
    const result = await pool.query(
      'INSERT INTO collection_routes (name, zone_id, distance_km, estimated_time, status, stops, optimized) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, zone_id, distance_km, estimated_time, status || 'active', stops, optimized || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, zone_id, distance_km, estimated_time, status, stops, optimized } = req.body;
    const result = await pool.query(
      'UPDATE collection_routes SET name=$1, zone_id=$2, distance_km=$3, estimated_time=$4, status=$5, stops=$6, optimized=$7 WHERE id=$8 RETURNING *',
      [name, zone_id, distance_km, estimated_time, status, stops, optimized, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Route not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM collection_routes WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Route not found' });
    res.json({ message: 'Route deleted', route: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
