const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "wa_gateway",
});

const initDatabase = async () => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS devices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_key VARCHAR(255) UNIQUE NOT NULL,
      device_name VARCHAR(255),
      phone_number VARCHAR(20),
      status VARCHAR(50),
      server_id VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_key VARCHAR(255),
      device_name VARCHAR(255),
      sender VARCHAR(50),
      message_text TEXT,
      is_me TINYINT(1) DEFAULT 0,
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
    )`
  ];

  try {
    for (let query of tables) {
      await db.promise().query(query);
    }
    console.log("✅ Database & Tabel Siap");
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