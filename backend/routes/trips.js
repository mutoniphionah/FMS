const express = require('express');
const router = express.Router();
const db = require('../db');

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized.' });
  next();
}

// GET all trips (with vehicle name)
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, v.VehicleName, v.PlateNumber
      FROM Trip t
      JOIN Vehicle v ON t.VehicleID = v.VehicleID
      ORDER BY t.TripDate DESC, t.TripID DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET daily trip report — MUST be before /:id
router.get('/report/daily', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        t.TripDate,
        v.VehicleName,
        v.PlateNumber,
        t.TripDistance,
        t.TransportCost,
        t.TripID
      FROM Trip t
      JOIN Vehicle v ON t.VehicleID = v.VehicleID
      ORDER BY t.TripDate DESC, t.TripID DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET single trip
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, v.VehicleName, v.PlateNumber
      FROM Trip t
      JOIN Vehicle v ON t.VehicleID = v.VehicleID
      WHERE t.TripID = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Trip not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST create trip
router.post('/', requireAuth, async (req, res) => {
  const { VehicleID, TripDistance, TransportCost, TripDate } = req.body;
  if (!VehicleID || !TripDistance || !TransportCost || !TripDate) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO Trip (VehicleID, TripDistance, TransportCost, TripDate) VALUES (?, ?, ?, ?)',
      [VehicleID, TripDistance, TransportCost, TripDate]
    );
    res.status(201).json({ message: 'Trip recorded successfully.', TripID: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT update trip
router.put('/:id', requireAuth, async (req, res) => {
  const { VehicleID, TripDistance, TransportCost, TripDate } = req.body;
  if (!VehicleID || !TripDistance || !TransportCost || !TripDate) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const [result] = await db.query(
      'UPDATE Trip SET VehicleID=?, TripDistance=?, TransportCost=?, TripDate=? WHERE TripID=?',
      [VehicleID, TripDistance, TransportCost, TripDate, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Trip not found.' });
    res.json({ message: 'Trip updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE trip
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Trip WHERE TripID = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Trip not found.' });
    res.json({ message: 'Trip deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
