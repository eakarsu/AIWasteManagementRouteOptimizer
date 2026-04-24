import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM zones ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM zones WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Zone not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, area_sqkm, population, households, waste_type, collection_frequency, priority } = req.body;
    const result = await pool.query(
      'INSERT INTO zones (name, area_sqkm, population, households, waste_type, collection_frequency, priority) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, area_sqkm, population, households, waste_type, collection_frequency, priority]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, area_sqkm, population, households, waste_type, collection_frequency, priority } = req.body;
    const result = await pool.query(
      'UPDATE zones SET name=$1, area_sqkm=$2, population=$3, households=$4, waste_type=$5, collection_frequency=$6, priority=$7 WHERE id=$8 RETURNING *',
      [name, area_sqkm, population, households, waste_type, collection_frequency, priority, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Zone not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM zones WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Zone not found' });
    res.json({ message: 'Zone deleted', zone: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
