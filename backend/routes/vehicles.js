import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { plate_number, type, capacity_tons, status, driver_id, fuel_level, mileage, last_maintenance } = req.body;
    const result = await pool.query(
      'INSERT INTO vehicles (plate_number, type, capacity_tons, status, driver_id, fuel_level, mileage, last_maintenance) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [plate_number, type, capacity_tons, status || 'active', driver_id, fuel_level, mileage, last_maintenance]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { plate_number, type, capacity_tons, status, driver_id, fuel_level, mileage, last_maintenance } = req.body;
    const result = await pool.query(
      'UPDATE vehicles SET plate_number=$1, type=$2, capacity_tons=$3, status=$4, driver_id=$5, fuel_level=$6, mileage=$7, last_maintenance=$8 WHERE id=$9 RETURNING *',
      [plate_number, type, capacity_tons, status, driver_id, fuel_level, mileage, last_maintenance, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted', vehicle: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
