/**
 * Run this script once to initialize the database and create the admin user.
 * Usage: node initDb.js
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function init() {
  // Connect without specifying a database first
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  console.log('Connected to MySQL server.');

  // Create database
  await conn.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
  await conn.query(`USE ${process.env.DB_NAME}`);
  console.log(`Database "${process.env.DB_NAME}" ready.`);

  // Create Vehicle table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS Vehicle (
      VehicleID INT AUTO_INCREMENT PRIMARY KEY,
      VehicleName VARCHAR(100) NOT NULL,
      PlateNumber VARCHAR(20) NOT NULL UNIQUE,
      Category VARCHAR(50) NOT NULL,
      FuelType VARCHAR(30) NOT NULL,
      Capacity INT NOT NULL
    )
  `);

  // Create Trip table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS Trip (
      TripID INT AUTO_INCREMENT PRIMARY KEY,
      VehicleID INT NOT NULL,
      TripDistance DECIMAL(10,2) NOT NULL,
      TransportCost DECIMAL(10,2) NOT NULL,
      TripDate DATE NOT NULL,
      FOREIGN KEY (VehicleID) REFERENCES Vehicle(VehicleID) ON DELETE CASCADE
    )
  `);

  // Create Maintenance table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS Maintenance (
      MaintenanceID INT AUTO_INCREMENT PRIMARY KEY,
      VehicleID INT NOT NULL,
      MaintenanceType VARCHAR(100) NOT NULL,
      MaintenanceCost DECIMAL(10,2) NOT NULL,
      MaintenanceDate DATE NOT NULL,
      FOREIGN KEY (VehicleID) REFERENCES Vehicle(VehicleID) ON DELETE CASCADE
    )
  `);

  // Create Users table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS Users (
      UserID INT AUTO_INCREMENT PRIMARY KEY,
      Username VARCHAR(50) NOT NULL UNIQUE,
      Password VARCHAR(255) NOT NULL,
      CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('All tables created.');

  // Create default admin user (username: admin, password: Admin@2026!)
  const hashedPassword = await bcrypt.hash('Admin@2026!', 12);
  await conn.query(
    `INSERT IGNORE INTO Users (Username, Password) VALUES (?, ?)`,
    ['admin', hashedPassword]
  );
  console.log('Admin user created: username=admin, password=Admin@2026!');

  await conn.end();
  console.log('Database initialization complete.');
}

init().catch((err) => {
  console.error('Initialization failed:', err.message);
  process.exit(1);
});
