const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'tuning.db'), { verbose: console.log });

// Add 'status' column to users if not exists
try {
    db.exec(`ALTER TABLE users ADD COLUMN status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved'`);
    console.log('Added status column to users');
} catch (e) {
    console.log('users.status column already exists or error:', e.message);
}

// Add 'approved_at' column to users if not exists
try {
    db.exec(`ALTER TABLE users ADD COLUMN approved_at DATETIME`);
    console.log('Added approved_at column to users');
} catch (e) {
    console.log('users.approved_at column already exists');
}

// Add 'rejection_reason' column to users if not exists
try {
    db.exec(`ALTER TABLE users ADD COLUMN rejection_reason TEXT`);
    console.log('Added rejection_reason column to users');
} catch (e) {
    console.log('users.rejection_reason already exists');
}

// Create Services table (for admin-defined service prices)
db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL DEFAULT 0,
    category TEXT DEFAULT 'genel',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default services if empty
const svcCount = (db.prepare('SELECT COUNT(*) as c FROM services').get()).c;
if (svcCount === 0) {
    const insertSvc = db.prepare('INSERT INTO services (name, description, price, category) VALUES (?, ?, ?, ?)');
    insertSvc.run('DPF Off', 'DPF filtresini devre dışı bırakma', 50, 'emisyon');
    insertSvc.run('EGR Off', 'EGR valfini devre dışı bırakma', 40, 'emisyon');
    insertSvc.run('AdBlue Off', 'AdBlue sistemini devre dışı bırakma', 60, 'emisyon');
    insertSvc.run('Stage 1 Tune', 'Standart performans paketi', 80, 'performans');
    insertSvc.run('Stage 2 Tune', 'Gelişmiş performans paketi', 120, 'performans');
    insertSvc.run('Pop & Bang', 'Egzoz patırtı efekti', 30, 'performans');
    insertSvc.run('Launch Control', 'Çıkış kontrolü aktifleştirme', 35, 'performans');
    insertSvc.run('Speed Limiter Off', 'Hız sınırı kaldırma', 25, 'diger');
    insertSvc.run('Bosch ECU Sorgulama', 'Bosch ECU numara sorgulama', 10, 'sorgulama');
    insertSvc.run('Immo Off', 'İmmobilizer devre dışı bırakma', 45, 'guvenlik');
    console.log('Default services seeded.');
}

// Create direct_messages table (user <-> admin messaging, not tied to a file)
db.exec(`
  CREATE TABLE IF NOT EXISTS direct_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sender_role TEXT CHECK(sender_role IN ('user', 'admin')) NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Update existing admin users to approved status
db.prepare("UPDATE users SET status = 'approved' WHERE role = 'admin'").run();
// Update existing dealer users that have no status (NULL) to approved (they were pre-existing)
db.prepare("UPDATE users SET status = 'approved' WHERE role = 'dealer' AND status IS NULL").run();

console.log('Migration completed successfully.');
