import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM citizen_reports ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM citizen_reports WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { citizen_name, phone, location, type, description, status, priority } = req.body;
    const result = await pool.query(
      'INSERT INTO citizen_reports (citizen_name, phone, location, type, description, status, priority) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [citizen_name, phone, location, type, description, status || 'pending', priority || 'medium']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { citizen_name, phone, location, type, description, status, priority, resolved_at } = req.body;
    const result = await pool.query(
      'UPDATE citizen_reports SET citizen_name=$1, phone=$2, location=$3, type=$4, description=$5, status=$6, priority=$7, resolved_at=$8 WHERE id=$9 RETURNING *',
      [citizen_name, phone, location, type, description, status, priority, resolved_at, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM citizen_reports WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Report deleted', report: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
