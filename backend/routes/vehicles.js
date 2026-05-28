const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware: require login
function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized.' });
  next();
}

// GET all vehicles
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Vehicle ORDER BY VehicleID DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET single vehicle
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Vehicle WHERE VehicleID = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST create vehicle
router.post('/', requireAuth, async (req, res) => {
  const { VehicleName, PlateNumber, Category, FuelType, Capacity } = req.body;
  if (!VehicleName || !PlateNumber || !Category || !FuelType || !Capacity) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO Vehicle (VehicleName, PlateNumber, Category, FuelType, Capacity) VALUES (?, ?, ?, ?, ?)',
      [VehicleName, PlateNumber, Category, FuelType, Capacity]
    );
    res.status(201).json({ message: 'Vehicle added successfully.', VehicleID: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Plate number already exists.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT update vehicle
router.put('/:id', requireAuth, async (req, res) => {
  const { VehicleName, PlateNumber, Category, FuelType, Capacity } = req.body;
  if (!VehicleName || !PlateNumber || !Category || !FuelType || !Capacity) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const [result] = await db.query(
      'UPDATE Vehicle SET VehicleName=?, PlateNumber=?, Category=?, FuelType=?, Capacity=? WHERE VehicleID=?',
      [VehicleName, PlateNumber, Category, FuelType, Capacity, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json({ message: 'Vehicle updated successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Plate number already exists.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE vehicle
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Vehicle WHERE VehicleID = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json({ message: 'Vehicle deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
