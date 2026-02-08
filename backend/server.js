// ==========================================
// 🔧 LOAD ENV (HARUS PALING ATAS)
// ==========================================
require("dotenv").config();

// Debug (boleh hapus setelah yakin)
console.log("JWT_SECRET:", process.env.JWT_SECRET);

// ==========================================
// 📦 IMPORT
// ==========================================
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const db = require("./config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// ==========================================
// 🔧 CONFIGURATION
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY_AKUN = "f272bd85-1ea1-4bcc-9d88-b585b2bda634";
const WEBHOOK_URL_BASE = "https://aulic-pyridic-jaylen.ngrok-free.dev/webhook";

// ==========================================
// 🔧 MIDDLEWARE
// ==========================================
// ❌ body-parser sudah deprecated
// ✅ pakai bawaan Express
app.use(express.json());

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// ==========================================
// 🔐 LOGIN AUTH (TANPA CONTROLLER & ROUTE)
// ==========================================
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // validasi
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email dan password wajib diisi",
    });
  }

  try {
    // ambil user dari DB
    const [rows] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const user = rows[0];

    // cek password hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // response
    res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role || "user",
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

/**
 * GET /dashboard/stats
 * Mengambil statistik dashboard dengan filter waktu dan device
 */
app.get("/dashboard/stats", async (req, res) => {
  const { filter, device } = req.query;

  // Mapping filter waktu
  const filterMap = {
    "Hari ini": "DATE(received_at) = CURDATE()",
    Kemarin: "DATE(received_at) = SUBDATE(CURDATE(), 1)",
    Minggu: "received_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
    Bulan: "received_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)",
  };

  const timeCondition = filterMap[filter] || filterMap["Hari ini"];
  const conditions = [timeCondition];
  let deviceCondition = "";

  // Filter berdasarkan device jika dipilih
  if (device && device !== "Semua Device") {
    deviceCondition = ` AND device_name = ${db.escape(device)}`;
    conditions.push(`device_name = ${db.escape(device)}`);
  }

  const finalWhereClause = conditions.join(" AND ");

  try {
    // Query 1: Pesan Masuk & Keluar
    const [msgRows] = await db.promise().query(`
      SELECT 
        SUM(CASE WHEN is_me = 0 THEN 1 ELSE 0 END) as pesanMasuk,
        SUM(CASE WHEN is_me = 1 THEN 1 ELSE 0 END) as pesanKeluar
      FROM messages 
      WHERE ${finalWhereClause}
    `);

    // Query 2: Lead Masuk (Nomor baru)
    const [leadRows] = await db.promise().query(`
      SELECT COUNT(*) as totalLeads FROM (
        SELECT sender
        FROM messages
        WHERE is_me = 0 ${deviceCondition}
        GROUP BY sender
        HAVING MIN(received_at) ${timeCondition.includes('CURDATE()') ? ">= CURDATE()" : ">= DATE_SUB(NOW(), INTERVAL 30 DAY)"}
      ) as subquery_leads
    `);

    // Query 3: Pesan Masuk Hari Ini
    const [incomingToday] = await db.promise().query(`
      SELECT COUNT(*) as totalToday 
      FROM messages 
      WHERE is_me = 0 
        AND DATE(received_at) = CURDATE()
        ${deviceCondition}
    `);

    // Query 4: Slow Response (> 10 Menit)
    const [slowResponseRows] = await db.promise().query(`
      SELECT COUNT(*) as slowCount FROM (
        SELECT 
          sender,
          MAX(CASE WHEN is_me = 0 THEN received_at END) as last_customer_msg,
          MAX(CASE WHEN is_me = 1 THEN received_at END) as last_my_msg
        FROM messages
        WHERE ${finalWhereClause}
        GROUP BY sender
        HAVING 
          (last_my_msg IS NULL AND TIMESTAMPDIFF(MINUTE, last_customer_msg, NOW()) > 10)
          OR 
          (last_my_msg < last_customer_msg AND TIMESTAMPDIFF(MINUTE, last_customer_msg, NOW()) > 10)
      ) as subquery
    `);

    // Query 5: Tak Terjawab (> 24 Jam)
    const [unansweredRows] = await db.promise().query(`
      SELECT COUNT(*) as unansweredCount FROM (
        SELECT 
          sender,
          MAX(CASE WHEN is_me = 0 THEN received_at END) as last_customer_msg,
          MAX(CASE WHEN is_me = 1 THEN received_at END) as last_my_msg
        FROM messages
        WHERE ${finalWhereClause}
        GROUP BY sender
        HAVING 
          (last_my_msg IS NULL AND TIMESTAMPDIFF(HOUR, last_customer_msg, NOW()) >= 24)
          OR 
          (last_my_msg < last_customer_msg AND TIMESTAMPDIFF(HOUR, last_customer_msg, NOW()) >= 24)
      ) as subquery
    `);

    // Query 6: Lead Aktif (30 menit terakhir)
    const [liveChatRows] = await db.promise().query(`
      SELECT COUNT(DISTINCT sender) as liveCount 
      FROM messages 
      WHERE received_at >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
        ${deviceCondition}
    `);

    // Query 7: Total Pesan Masuk (All Time)
    const [totalIncomingRows] = await db.promise().query(`
      SELECT COUNT(*) as totalAllTime 
      FROM messages 
      WHERE (is_me = 0 OR is_me IS FALSE)
        ${deviceCondition}
    `);

    // Query 8: Ambil data device dari StarSender API
    const response = await axios.get(
      "https://api.starsender.online/api/devices",
      { headers: { Authorization: API_KEY_AKUN } }
    );
    const allDevices = response.data.data.devices || [];

    // Response
    res.json({
      success: true,
      stats: {
        pesanMasuk: totalIncomingRows[0].totalAllTime || 0,
        pesanMasukToday: incomingToday[0].totalToday || 0,
        pesanKeluar: msgRows[0].pesanKeluar || 0,
        totalDevice: allDevices.length,
        deviceConnected: allDevices.filter((d) => d.status === "connected").length,
        leadMasuk: leadRows[0].totalLeads || 0,
        leadAktif: liveChatRows[0].liveCount || 0,
        slowResponse: slowResponseRows[0].slowCount || 0,
        unanswered: unansweredRows[0].unansweredCount || 0,
      },
      devices: allDevices,
    });
  } catch (err) {
    console.error("Dashboard Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 📱 DEVICE MANAGEMENT ROUTES
// ==========================================

/**
 * POST /device/add-scan
 * Menambahkan device baru dengan QR scan
 */
app.post("/device/add-scan", async (req, res) => {
  const { deviceName } = req.body;

  if (!deviceName) {
    return res.status(400).json({
      success: false,
      message: "Nama device wajib diisi",
    });
  }

  try {
    const response = await axios.post(
      "https://api.starsender.online/api/devices/create/scan",
      { name: deviceName },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: API_KEY_AKUN,
        },
      }
    );

    console.log("⭐ RESPONSE QR:", response.data);

    const starData = response.data.data || {};
    const qrCode = starData.kode_gambar || starData.qr || starData.qrcode || null;

    if (!qrCode) {
      return res.status(500).json({
        success: false,
        message: "QR Code tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Silakan scan QR",
      qrCode,
    });
  } catch (err) {
    console.error("🔥 ERROR QR:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "Server StarSender error",
    });
  }
});

/**
 * GET /device/sync
 * Sinkronisasi device dari StarSender API ke database lokal
 */
app.get("/device/sync", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.starsender.online/api/devices",
      { headers: { Authorization: API_KEY_AKUN } }
    );

    const devices = response.data.data?.devices || response.data.data || [];

    for (const dev of devices) {
      const deviceKey = dev.device_key || dev.key || dev.id;
      const deviceName = dev.name || dev.device_name || "Unknown";
      const phone = dev.no_hp || dev.phone || dev.phone_number || null;
      const serverId = dev.server_id || dev.server || null;
      const rawStatus = String(dev.status || "").toLowerCase();
      const status = 
        rawStatus === "connected" || rawStatus === "ready"
          ? "connected"
          : "disconnected";

      if (!deviceKey) continue;

      // Set webhook otomatis
      const autoWebhookUrl = `${WEBHOOK_URL_BASE}?name=${encodeURIComponent(deviceName)}`;
      
      try {
        await axios.post(
          "https://api.starsender.online/api/devices/update",
          {
            device_key: deviceKey,
            webhook: autoWebhookUrl,
          },
          { headers: { Authorization: API_KEY_AKUN } }
        );
        console.log(`✅ Webhook otomatis diatur untuk: ${deviceName}`);
      } catch (err) {
        console.error(`❌ Gagal set webhook untuk ${deviceName}:`, err.message);
      }

      // Simpan ke database lokal
      await db.promise().query(
        `INSERT INTO devices (device_key, device_name, phone_number, status, server_id)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           device_name = VALUES(device_name),
           phone_number = VALUES(phone_number),
           status = VALUES(status),
           server_id = VALUES(server_id)`,
        [deviceKey, deviceName, phone, status, serverId]
      );
    }

    res.json({ success: true, message: "Sync & Auto-Webhook berhasil!" });
  } catch (err) {
    console.error("Sync Error:", err.message);
    res.status(500).json({ success: false, message: "Gagal Sinkronisasi" });
  }
});

/**
 * GET /device/all
 * Mengambil semua device dari StarSender API
 */
app.get("/device/all", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.starsender.online/api/devices",
      { headers: { Authorization: API_KEY_AKUN } }
    );

    const deviceArray = response.data.data.devices || [];
    const allDevices = deviceArray.map((device) => ({
      id: device.id,
      name: device.name,
      number: device.no_hp || "Belum Tertaut",
      status: device.status === "connected" ? "Connected" : "Disconnected",
      apiKey: device.device_key,
      server: device.server_id,
    }));

    res.json({ success: true, devices: allDevices });
  } catch (err) {
    console.error("Get All Devices Error:", err.message);
    res.status(500).json({ success: false, message: "Gagal mengambil device" });
  }
});

/**
 * GET /device/status
 * Mengecek status koneksi device berdasarkan nama
 */
app.get("/device/status", async (req, res) => {
  const { name } = req.query;
  
  try {
    const response = await axios.get(
      "https://api.starsender.online/api/devices",
      { headers: { Authorization: API_KEY_AKUN } }
    );

    const devices = response.data.data.devices;
    const currentDevice = devices.find(
      (d) => d.name === name && d.status === "connected"
    );

    if (currentDevice) {
      res.json({ isConnected: true, deviceName: currentDevice.name });
    } else {
      res.json({ isConnected: false });
    }
  } catch (err) {
    console.error("Device Status Error:", err.message);
    res.status(500).json({ isConnected: false });
  }
});

/**
 * POST /device/delete/:id
 * Menghapus device dari StarSender dan database lokal
 */
app.post("/device/delete/:id", async (req, res) => {
  const deviceId = req.params.id;
  console.log("Memproses hapus untuk ID:", deviceId);

  try {
    // Hapus di StarSender Cloud
    try {
      await axios.post(
        `https://api.starsender.online/api/devices/${deviceId}/delete`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: API_KEY_AKUN,
          },
        }
      );
      console.log("✅ Terhapus di StarSender Cloud");
    } catch (apiErr) {
      console.warn("⚠️ Gagal di StarSender Cloud, lanjut hapus lokal...");
    }

    // Hapus di database lokal
    const [result] = await db
      .promise()
      .query("DELETE FROM devices WHERE id = ?", [deviceId]);

    if (result.affectedRows > 0) {
      console.log(`✅ Berhasil hapus ${result.affectedRows} baris di database lokal.`);
      res.json({
        success: true,
        message: "Device berhasil dihapus secara total.",
      });
    } else {
      console.error("❌ Data tidak ditemukan di database lokal!");
      res.status(404).json({
        success: false,
        message: "Data tidak ditemukan di database lokal.",
      });
    }
  } catch (err) {
    console.error("🔥 Server Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat menghapus.",
    });
  }
});

/**
 * POST /device/reconnect/:id
 * Menghubungkan ulang device yang terputus
 */
app.post("/device/reconnect/:id", async (req, res) => {
  const deviceId = req.params.id;

  try {
    // Ambil device_key dari database
    const [rows] = await db
      .promise()
      .query("SELECT device_key FROM devices WHERE id = ?", [deviceId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Device tidak ditemukan" 
      });
    }

    const deviceKey = rows[0].device_key;

    // Panggil API Reconnect StarSender
    const response = await axios.post(
      `https://api.starsender.online/api/devices/${deviceKey}/reconnect`,
      {},
      { headers: { Authorization: API_KEY_AKUN } }
    );

    // Update status di database lokal
    await db
      .promise()
      .query("UPDATE devices SET status = 'disconnected' WHERE id = ?", [deviceId]);

    res.json({
      success: true,
      message: "Sesi telah direset. Silakan lakukan scan ulang.",
      data: response.data,
    });
  } catch (err) {
    console.error("Reconnect Error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "Gagal menghubungkan ulang ke server StarSender.",
    });
  }
});

// ==========================================
// 💬 MESSAGE ROUTES
// ==========================================

/**
 * GET /api/messages/history
 * Mengambil riwayat pesan berdasarkan sender
 */
app.get("/api/messages/history", async (req, res) => {
  const { sender } = req.query;
  
  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM messages WHERE sender = ? ORDER BY id ASC", [sender]);
    
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Message History Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/messages/all
 * Mengambil semua pesan dengan informasi device
 */
app.get("/api/messages/all", async (req, res) => {
  const query = `
    SELECT 
      m.id, 
      m.device_key, 
      d.device_name AS received_via, 
      d.status AS device_status,
      m.sender, 
      m.message_text, 
      DATE_FORMAT(m.received_at, '%Y-%m-%d %H:%i:%s') as received_at,
      m.is_me
    FROM messages m
    LEFT JOIN devices d ON m.device_key = d.device_key
    ORDER BY m.received_at DESC
  `;

  try {
    const [results] = await db.promise().query(query);
    res.json({
      success: true,
      total: results.length,
      data: results,
    });
  } catch (err) {
    console.error("❌ Error Fetching Inbox:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/messages
 * Mengambil pesan dengan filter device
 */
app.get("/api/messages", (req, res) => {
  const { device_name } = req.query;

  let query = `
    SELECT 
      id, 
      sender as 'from', 
      message_text as 'text', 
      DATE_FORMAT(received_at, '%H:%i') as 'time', 
      is_me as 'isMe', 
      device_name
    FROM messages
  `;

  const params = [];

  if (device_name && device_name !== "Semua Device") {
    query += " WHERE device_name = ?";
    params.push(device_name);
  }

  query += " ORDER BY received_at ASC";

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Get Messages Error:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: results });
  });
});

/**
 * GET /all
 * Legacy endpoint - mengambil semua pesan
 */
app.get("/all", (req, res) => {
  const query = `
    SELECT 
      id, 
      sender as 'from', 
      message_text as 'text', 
      DATE_FORMAT(received_at, '%H:%i') as 'time', 
      is_me as 'isMe' 
    FROM messages 
    ORDER BY id ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Get All Messages Error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

/**
 * POST /api/send
 * Khusus untuk Fitur "Compose" di Frontend
 * Mengambil device pertama yang 'connected' secara otomatis
 */
app.post("/api/send", async (req, res) => {
  const { number, message } = req.body;

  // 1. Validasi Input
  if (!number || !message) {
    return res.status(400).json({ 
      success: false, 
      error: "Nomor tujuan dan isi pesan tidak boleh kosong." 
    });
  }

  try {
    // 2. Ambil Device yang sedang 'connected' dari database
    const [devices] = await db.promise().query(
      "SELECT device_key, device_name FROM devices WHERE status = 'connected' LIMIT 1"
    );

    if (devices.length === 0) {
      return res.status(503).json({ 
        success: false, 
        error: "Tidak ada WhatsApp Device yang terhubung. Mohon hubungkan device terlebih dahulu." 
      });
    }

    const { device_key, device_name } = devices[0];

    // 3. Kirim ke API StarSender
    const response = await axios.post(
      "https://api.starsender.online/api/send",
      {
        messageType: "text",
        to: number,
        body: message,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: device_key, // Menggunakan device_key yang aktif
        },
      }
    );

    // 4. Simpan ke Database sebagai pesan keluar (is_me = 1)
    await db.promise().query(
      `INSERT INTO messages 
       (device_key, device_name, sender, message_text, is_me, received_at) 
       VALUES (?, ?, ?, ?, 1, NOW())`,
      [device_key, device_name, number, message]
    );

    // 5. Kirim respon sukses ke FE
    res.status(200).json({ 
      success: true, 
      message: "Pesan berhasil dikirim via " + device_name 
    });

  } catch (err) {
    console.error("🔥 Error Compose Send:", err.response?.data || err.message);
    res.status(500).json({ 
      success: false, 
      error: "Gagal mengirim pesan melalui provider." 
    });
  }
});

/**
 * POST /api/send-message
 * Mengirim pesan melalui StarSender API
 */
app.post("/api/send-message", async (req, res) => {
  const { to, message, deviceKey } = req.body;

  // Validasi input
  if (!to || !message || !deviceKey) {
    console.error("❌ Data tidak lengkap dari FE:", req.body);
    return res.status(400).json({
      success: false,
      message: "Data tidak lengkap. Pastikan field: to, message, dan deviceKey terisi.",
    });
  }

  // Bersihkan nomor tujuan
  const cleanTo = to.toString().replace(/\D/g, "");

  try {
    // Ambil nama device dari database
    const [deviceRows] = await db
      .promise()
      .query("SELECT device_name FROM devices WHERE device_key = ?", [deviceKey]);

    const deviceName = deviceRows.length > 0 
      ? deviceRows[0].device_name 
      : "Unknown Device";

    // Kirim ke API StarSender
    console.log(`📤 Mengirim pesan ke ${cleanTo} via ${deviceName}...`);

    const response = await axios.post(
      "https://api.starsender.online/api/send",
      {
        messageType: "text",
        to: cleanTo,
        body: message,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: deviceKey,
        },
      }
    );

    // Simpan ke database
    const insertQuery = `
      INSERT INTO messages 
      (device_key, device_name, sender, message_text, is_me, message_type, received_at) 
      VALUES (?, ?, ?, ?, 1, 'text', NOW())
    `;

    await db
      .promise()
      .query(insertQuery, [deviceKey, deviceName, cleanTo, message]);

    console.log(`✅ Sukses Terkirim & Disimpan ke DB`);

    res.json({
      success: true,
      data: response.data,
    });
  } catch (err) {
    const errorDetail = err.response?.data || err.message;
    console.error("🔥 Error StarSender:", errorDetail);

    res.status(err.response?.status || 500).json({
      success: false,
      message: "Gagal kirim pesan ke StarSender",
      error: errorDetail,
    });
  }
});

/**
 * POST /webhook
 * Menerima webhook dari StarSender
 */
app.post("/webhook", async (req, res) => {
  const data = req.body;
  const pengirim = data.from || "";
  const isiPesan = data.message || "";
  const deviceNameFromQuery = req.query.name;

  try {
    if (!deviceNameFromQuery) {
      console.error("⚠️ Webhook masuk tanpa parameter Nama Device di URL!");
      return res.status(400).send("Parameter name is missing");
    }

    // Cari device di database
    const [rows] = await db
      .promise()
      .query(
        "SELECT device_key, device_name FROM devices WHERE device_name = ?",
        [deviceNameFromQuery]
      );

    if (rows.length === 0) {
      console.error(`❌ Device [${deviceNameFromQuery}] tidak terdaftar di database lokal.`);
      return res.status(404).send("Device not found in database");
    }

    const finalKey = rows[0].device_key;
    const finalName = rows[0].device_name;

    // Simpan pesan ke database
    await db.promise().query(
      `INSERT INTO messages (sender, message_text, is_me, device_key, device_name, received_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [pengirim, isiPesan, 0, finalKey, finalName]
    );

    console.log(`✅ Pesan Berhasil Disimpan! Via: ${finalName}`);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

// ==========================================
// 👥 CONTACT ROUTES
// ==========================================

/**
 * GET /api/contacts
 * Mengambil semua kontak dengan fitur pencarian
 */
app.get("/api/contacts", async (req, res) => {
  const { search } = req.query;
  let query = "SELECT * FROM contacts";
  let params = [];

  if (search) {
    query += " WHERE name LIKE ? OR phone LIKE ?";
    params = [`%${search}%`, `%${search}%`];
  }

  query += " ORDER BY name ASC";

  try {
    const [rows] = await db.promise().query(query, params);

    const total = rows.length;
    const online = rows.filter((c) => c.status === "Online").length;

    res.json({
      success: true,
      data: rows,
      stats: { total, online },
    });
  } catch (err) {
    console.error("Get Contacts Error:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Gagal mengambil data kontak" 
    });
  }
});

/**
 * POST /api/contacts
 * Menambah kontak baru
 */
app.post("/api/contacts", async (req, res) => {
  const { name, phone, status } = req.body;

  // Generate initials
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  try {
    await db
      .promise()
      .query(
        "INSERT INTO contacts (name, phone, status, initials) VALUES (?, ?, ?, ?)",
        [name, phone, status || "Offline", initials]
      );
    
    res.json({ success: true, message: "Kontak berhasil ditambahkan" });
  } catch (err) {
    console.error("Add Contact Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Nomor sudah terdaftar atau error sistem",
    });
  }
});

// ==========================================
// 🏷️ LABEL ROUTES
// ==========================================

/**
 * GET /api/labels
 * Mengambil semua kategori label
 */
app.get("/api/labels", async (req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM labels ORDER BY name ASC");
    
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Get Labels Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/labels
 * Menambah kategori label baru
 */
app.post("/api/labels", async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ 
      success: false, 
      message: "Nama label wajib diisi" 
    });
  }

  try {
    const [result] = await db
      .promise()
      .query("INSERT INTO labels (name) VALUES (?)", [name]);
    
    res.json({
      success: true,
      message: "Label berhasil dibuat",
      id: result.insertId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ 
        success: false, 
        message: "Label sudah ada" 
      });
    }
    console.error("Add Label Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/labels/:id
 * Menghapus kategori label
 */
app.delete("/api/labels/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.promise().query("DELETE FROM labels WHERE id = ?", [id]);
    res.json({ success: true, message: "Label berhasil dihapus" });
  } catch (err) {
    console.error("Delete Label Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/labels/assignments
 * Mengambil semua penugasan label (mapping nomor -> label)
 */
app.get("/api/labels/assignments", async (req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query("SELECT sender, label_name FROM sender_labels");

    // Format menjadi object untuk kemudahan akses
    const mapping = {};
    rows.forEach((row) => {
      mapping[row.sender] = row.label_name;
    });

    res.json({ success: true, data: mapping });
  } catch (err) {
    console.error("Get Label Assignments Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/labels/assign
 * Menetapkan atau menghapus label dari nomor pengirim
 */
app.post("/api/labels/assign", async (req, res) => {
  const { sender, label } = req.body;
  
  if (!sender) {
    return res.status(400).json({ 
      success: false, 
      message: "Sender wajib diisi" 
    });
  }

  try {
    // Jika label kosong, hapus label dari nomor
    if (!label || label === "") {
      await db
        .promise()
        .query("DELETE FROM sender_labels WHERE sender = ?", [sender]);
      
      return res.json({ 
        success: true, 
        message: "Label dilepas dari nomor" 
      });
    }

    // Assign atau update label
    const query = `
      INSERT INTO sender_labels (sender, label_name) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE label_name = VALUES(label_name)
    `;
    
    await db.promise().query(query, [sender, label]);
    res.json({ success: true, message: "Label berhasil ditugaskan" });
  } catch (err) {
    console.error("Assign Label Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 🚀 START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server SatuPintu berjalan di http://localhost:${PORT}`);
});