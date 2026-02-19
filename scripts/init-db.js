const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'tuning.db'), { verbose: console.log });

// Create Users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'dealer')) NOT NULL DEFAULT 'dealer',
    name TEXT,
    company_name TEXT,
    phone TEXT,
    credits INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Create Files table
db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vehicle_make TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    engine_code TEXT,
    ecu_type TEXT,
    original_file_path TEXT,
    modded_file_path TEXT,
    status TEXT CHECK(status IN ('pending', 'processing', 'completed', 'rejected')) DEFAULT 'pending',
    options TEXT, -- JSON string
    cost INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Create Messages table
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL, -- Sender
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(file_id) REFERENCES files(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Create Transactions table
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Create ECUs table (for Bosch tool)
db.exec(`
  CREATE TABLE IF NOT EXISTS ecus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bosch_number TEXT UNIQUE NOT NULL, -- e.g., 0281013328
    oem_number TEXT,
    vehicle_info TEXT, -- JSON or text desc
    price REAL, -- If selling ECUs
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Create Payment Requests table
db.exec(`
  CREATE TABLE IF NOT EXISTS payment_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Create Settings table (Key-Value store)
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Seed Initial Settings (IBAN)
const ibanCheck = db.prepare("SELECT * FROM settings WHERE key = 'iban'").get();
if (!ibanCheck) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('iban', 'TR00 0000 0000 0000 0000 0000 00');
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('account_holder', 'Ozan Abi Tuning');
}

// Seed Admin User
const adminEmail = 'admin@tuningportal.com';
const adminPassword = 'admin';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(adminPassword, salt);

const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
const user = stmt.get(adminEmail);

if (!user) {
  const insert = db.prepare('INSERT INTO users (email, password, role, name, credits) VALUES (?, ?, ?, ?, ?)');
  insert.run(adminEmail, hash, 'admin', 'Super Admin', 999999);
  console.log('Admin user created');
} else {
  console.log('Admin user already exists');
}

console.log('Database initialized successfully.');
