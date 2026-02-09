const mysql = require("mysql2");

// CREATE POOL (WAJIB untuk server production)
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "wa_gateway",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// TEST KONEKSI
(async () => {
  try {
    const connection = await db.promise().getConnection();
    console.log("✅ MySQL Pool Connected");
    connection.release();
    await initDatabase();
  } catch (err) {
    console.error("❌ MySQL Connection Failed:", err.message);
  }
})();

// INIT DATABASE & TABLE
async function initDatabase() {
  const tables = [
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
    )`,
  ];

  try {
    for (const query of tables) {
      await db.promise().query(query);
    }
    console.log("✅ Semua tabel siap");
  } catch (err) {
    console.error("❌ Gagal inisialisasi tabel:", err.message);
  }
}

module.exports = db;
