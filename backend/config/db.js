const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "wa_gateway",
});

const initDatabase = async () => {
  const tables = [
    // TABEL USERS: Untuk Fitur Login
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100),
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS devices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_key VARCHAR(255) UNIQUE NOT NULL,
      device_name VARCHAR(255),
      phone_number VARCHAR(20),
      status VARCHAR(50),
      server_id VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // TABEL MESSAGES: Tambahkan is_read (untuk notif)
    `CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_key VARCHAR(255),
      device_name VARCHAR(255),
      sender VARCHAR(50),
      message_text TEXT,
      is_me TINYINT(1) DEFAULT 0,
      is_read TINYINT(1) DEFAULT 0, 
      message_type VARCHAR(20) DEFAULT 'text',
      received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      phone VARCHAR(20) UNIQUE,
      status VARCHAR(50) DEFAULT 'Offline',
      initials VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS labels (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS sender_labels (
      sender VARCHAR(50) PRIMARY KEY,
      label_name VARCHAR(100),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  ];

  try {
    for (let query of tables) {
      await db.promise().query(query);
    }
    
    // BACKWARD COMPATIBILITY: 
    // Cek jika kolom is_read belum ada di tabel messages (jika tabel sudah terlanjur dibuat)
    const [cols] = await db.promise().query("SHOW COLUMNS FROM messages LIKE 'is_read'");
    if (cols.length === 0) {
      await db.promise().query("ALTER TABLE messages ADD COLUMN is_read TINYINT(1) DEFAULT 0 AFTER is_me");
      console.log("✅ Kolom is_read ditambahkan ke tabel messages");
    }

    console.log("✅ Database & Tabel Siap (Termasuk Tabel User & Notif)");
  } catch (err) {
    console.error("❌ Gagal Inisialisasi Tabel:", err.message);
  }
};

db.connect((err) => {
  if (err) return console.error("❌ DB Error:", err.message);
  console.log("✅ Terkoneksi MySQL");
  initDatabase();
});

module.exports = db;