import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bins ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bins WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bin not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { bin_code, location, zone_id, type, capacity_liters, fill_level, last_collected, status, lat, lng } = req.body;
    const result = await pool.query(
      'INSERT INTO bins (bin_code, location, zone_id, type, capacity_liters, fill_level, last_collected, status, lat, lng) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [bin_code, location, zone_id, type, capacity_liters, fill_level || 0, last_collected, status || 'active', lat, lng]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { bin_code, location, zone_id, type, capacity_liters, fill_level, last_collected, status, lat, lng } = req.body;
    const result = await pool.query(
      'UPDATE bins SET bin_code=$1, location=$2, zone_id=$3, type=$4, capacity_liters=$5, fill_level=$6, last_collected=$7, status=$8, lat=$9, lng=$10 WHERE id=$11 RETURNING *',
      [bin_code, location, zone_id, type, capacity_liters, fill_level, last_collected, status, lat, lng, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bin not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM bins WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bin not found' });
    res.json({ message: 'Bin deleted', bin: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
