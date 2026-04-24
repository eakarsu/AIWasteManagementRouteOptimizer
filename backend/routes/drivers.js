import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drivers ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drivers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Driver not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, license_number, phone, email, status, experience_years, rating, assigned_vehicle_id } = req.body;
    const result = await pool.query(
      'INSERT INTO drivers (name, license_number, phone, email, status, experience_years, rating, assigned_vehicle_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, license_number, phone, email, status || 'active', experience_years, rating, assigned_vehicle_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, license_number, phone, email, status, experience_years, rating, assigned_vehicle_id } = req.body;
    const result = await pool.query(
      'UPDATE drivers SET name=$1, license_number=$2, phone=$3, email=$4, status=$5, experience_years=$6, rating=$7, assigned_vehicle_id=$8 WHERE id=$9 RETURNING *',
      [name, license_number, phone, email, status, experience_years, rating, assigned_vehicle_id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Driver not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM drivers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Driver not found' });
    res.json({ message: 'Driver deleted', driver: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
