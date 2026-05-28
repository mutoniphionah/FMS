const express = require('express');
const router = express.Router();
const db = require('../db');

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized.' });
  next();
}

// GET all maintenance records (with vehicle name)
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, v.VehicleName, v.PlateNumber
      FROM Maintenance m
      JOIN Vehicle v ON m.VehicleID = v.VehicleID
      ORDER BY m.MaintenanceDate DESC, m.MaintenanceID DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET maintenance status report — MUST be before /:id
router.get('/report/status', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        v.VehicleName,
        v.PlateNumber,
        COALESCE(SUM(t.TripDistance), 0) AS TotalTripDistance,
        m.MaintenanceCost,
        m.MaintenanceDate,
        m.MaintenanceType,
        m.MaintenanceID
      FROM Maintenance m
      JOIN Vehicle v ON m.VehicleID = v.VehicleID
      LEFT JOIN Trip t ON t.VehicleID = v.VehicleID
      GROUP BY m.MaintenanceID, v.VehicleName, v.PlateNumber, m.MaintenanceCost, m.MaintenanceDate, m.MaintenanceType
      ORDER BY m.MaintenanceDate DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET single maintenance record
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, v.VehicleName, v.PlateNumber
      FROM Maintenance m
      JOIN Vehicle v ON m.VehicleID = v.VehicleID
      WHERE m.MaintenanceID = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Maintenance record not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST create maintenance record
router.post('/', requireAuth, async (req, res) => {
  const { VehicleID, MaintenanceType, MaintenanceCost, MaintenanceDate } = req.body;
  if (!VehicleID || !MaintenanceType || !MaintenanceCost || !MaintenanceDate) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO Maintenance (VehicleID, MaintenanceType, MaintenanceCost, MaintenanceDate) VALUES (?, ?, ?, ?)',
      [VehicleID, MaintenanceType, MaintenanceCost, MaintenanceDate]
    );
    res.status(201).json({ message: 'Maintenance record added successfully.', MaintenanceID: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT update maintenance record
router.put('/:id', requireAuth, async (req, res) => {
  const { VehicleID, MaintenanceType, MaintenanceCost, MaintenanceDate } = req.body;
  if (!VehicleID || !MaintenanceType || !MaintenanceCost || !MaintenanceDate) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const [result] = await db.query(
      'UPDATE Maintenance SET VehicleID=?, MaintenanceType=?, MaintenanceCost=?, MaintenanceDate=? WHERE MaintenanceID=?',
      [VehicleID, MaintenanceType, MaintenanceCost, MaintenanceDate, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Maintenance record not found.' });
    res.json({ message: 'Maintenance record updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE maintenance record
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Maintenance WHERE MaintenanceID = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Maintenance record not found.' });
    res.json({ message: 'Maintenance record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
