const mysql = require("mysql2");
const bcrypt = require("bcrypt");

// Koneksi ke Database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "wa_gateway",
}).promise();

async function createAdmin() {
  const email = "admin@satupintu.com";
  const password = "admin123"; // Password yang akan kamu pakai login
  const username = "Super Admin";

  try {
    console.log("--- PROSES PEMBUATAN AKUN ADMIN ---");

    // 1. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Cek apakah email sudah ada
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    
    if (existing.length > 0) {
      console.log("⚠️ Akun admin sudah ada sebelumnya.");
      process.exit();
    }

    // 3. Masukkan ke database
    await db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    console.log("✅ Berhasil membuat akun admin dummy!");
    console.log("------------------------------------");
    console.log(`Email    : ${email}`);
    console.log(`Password : ${password}`);
    console.log("------------------------------------");
    console.log("Silakan login di halaman SatuPintu.");

  } catch (err) {
    console.error("❌ Gagal membuat admin:", err.message);
  } finally {
    process.exit();
  }
}

createAdmin();