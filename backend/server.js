const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const db = require("./config/db");

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));

console.log(process.env.STARSENDER_KEY);

const API_KEY = "8eedad2c-ad5a-4123-b682-25b103b08fc9";
const API_KEY_AKUN = "f272bd85-1ea1-4bcc-9d88-b585b2bda634";
const PORT = 3000;


function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}



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
      },
    );

    console.log("⭐ RESPONSE QR:", response.data);

    const starData = response.data.data || {};

    const qrCode =
      starData.kode_gambar || starData.qr || starData.qrcode || null;

    if (!qrCode) {
      return res.status(500).json({
        success: false,
        message: "QR Code tidak ditemukan",
      });
    }

    // ⛔ HAPUS VALIDASI deviceKey
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

app.get("/device/sync", async (req, res) => {
  const WEBHOOK_URL_BASE =
    "https://aulic-pyridic-jaylen.ngrok-free.dev/webhook";

  try {
    const response = await axios.get(
      "https://api.starsender.online/api/devices",
      {
        headers: { Authorization: API_KEY_AKUN },
      },
    );

    const devices = response.data.data?.devices || response.data.data || [];

    for (const dev of devices) {
      const deviceKey = dev.device_key || dev.key || dev.id;
      const deviceName = dev.name || dev.device_name || "Unknown";

      // 1. Susun URL Webhook otomatis dengan parameter nama
      const autoWebhookUrl = `${WEBHOOK_URL_BASE}?name=${encodeURIComponent(deviceName)}`;

      // 2. Perintah ke StarSender untuk set Webhook secara otomatis
      try {
        await axios.post(
          "https://api.starsender.online/api/devices/update",
          {
            device_key: deviceKey,
            webhook: autoWebhookUrl,
          },
          { headers: { Authorization: API_KEY_AKUN } },
        );
        console.log(`✅ Webhook otomatis diatur untuk: ${deviceName}`);
      } catch (err) {
        console.error(
          `❌ Gagal set webhook otomatis untuk ${deviceName}:`,
          err.message,
        );
      }

      // 3. Simpan ke database lokal kita (seperti sebelumnya)
      const phone = dev.no_hp || dev.phone || dev.phone_number || null;
      const serverId = dev.server_id || dev.server || null;
      const rawStatus = String(dev.status || "").toLowerCase();
      const status =
        rawStatus === "connected" || rawStatus === "ready"
          ? "connected"
          : "disconnected";

      if (!deviceKey) continue;

      await db.promise().query(
        `INSERT INTO devices (device_key, device_name, phone_number, status, server_id)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           device_name = VALUES(device_name),
           phone_number = VALUES(phone_number),
           status = VALUES(status),
           server_id = VALUES(server_id)`,
        [deviceKey, deviceName, phone, status, serverId],
      );
    }

    res.json({ success: true, message: "Sync & Auto-Webhook berhasil!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal Sinkronisasi" });
  }
});
// ===============================
// 🔹 FEATURE: DEVICE STATUS (REAL-TIME)
// ===============================
// ===============================
app.get("/device/all", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.starsender.online/api/devices",
      {
        headers: { Authorization: API_KEY_AKUN },
      },
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
    res.status(500).json({ success: false });
  }
});


app.post("/device/delete/:id", async (req, res) => {
  const deviceId = req.params.id;
  console.log("Memproses hapus untuk ID:", deviceId);

  try {
    // 1. Coba hapus di StarSender (Cloud)
    // Kita bungkus try-catch internal supaya kalau Cloud gagal, lokal tetap lanjut hapus
    try {
      await axios.post(
        `https://api.starsender.online/api/devices/${deviceId}/delete`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": API_KEY_AKUN,
          },
        }
      );
      console.log("✅ Terhapus di StarSender Cloud");
    } catch (apiErr) {
      console.warn("⚠️ Gagal di StarSender Cloud (mungkin sudah terhapus), lanjut hapus lokal...");
    }

    // 2. EKSEKUSI HAPUS DI MYSQL LOKAL
    // Kita gunakan ID (Primary Key)
    const [result] = await db.promise().query(
      "DELETE FROM devices WHERE id = ?", 
      [deviceId]
    );

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

app.get("/api/messages/history", async (req, res) => {
  const { sender } = req.query;
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM messages WHERE sender = ? ORDER BY id ASC",
      [sender]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// device status
app.get("/device/status", async (req, res) => {
  const { name } = req.query; // Ambil nama dari query params
  try {
    const response = await axios.get(
      "https://api.starsender.online/api/devices",
      {
        headers: { Authorization: API_KEY_AKUN },
      },
    );

    const devices = response.data.data.devices;
    // Cari device yang namanya sesuai DAN statusnya sudah 'connected'
    const currentDevice = devices.find(
      (d) => d.name === name && d.status === "connected",
    );

    if (currentDevice) {
      res.json({ isConnected: true, deviceName: currentDevice.name });
    } else {
      res.json({ isConnected: false });
    }
  } catch (err) {
    res.status(500).json({ isConnected: false });
  }
});
app.get("/dashboard/stats", async (req, res) => {
  const { filter, device } = req.query;

  // 1. Mapping Waktu untuk Filter Global
  const filterMap = {
    "Hari ini": "DATE(received_at) = CURDATE()",
    "Kemarin": "DATE(received_at) = SUBDATE(CURDATE(), 1)",
    "Minggu": "received_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
    "Bulan": "received_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)",
  };

  let timeCondition = filterMap[filter] || filterMap["Hari ini"];
  let conditions = [timeCondition];

  // Logic filter device untuk digunakan di berbagai query
  let deviceCondition = "";
  if (device && device !== "Semua Device") {
    deviceCondition = ` AND device_name = ${db.escape(device)}`;
    conditions.push(`device_name = ${db.escape(device)}`);
  }

  const finalWhereClause = conditions.join(" AND ");

  try {
    // 2. Query Utama: Pesan Masuk & Keluar (Berdasarkan Filter Dropdown)
    const [msgRows] = await db.promise().query(`
      SELECT 
        SUM(CASE WHEN is_me = 0 THEN 1 ELSE 0 END) as pesanMasuk,
        SUM(CASE WHEN is_me = 1 THEN 1 ELSE 0 END) as pesanKeluar,
        COUNT(DISTINCT CASE WHEN is_me = 0 THEN sender END) as leadMasuk
      FROM messages 
      WHERE ${finalWhereClause}
    `);

    // 3. Query Khusus: Pesan Masuk HARI INI (Selalu Real-time per hari ini)
    const [incomingToday] = await db.promise().query(`
      SELECT COUNT(*) as totalToday 
      FROM messages 
      WHERE is_me = 0 
      AND DATE(received_at) = CURDATE()
      ${deviceCondition}
    `);

    // 4. Query Slow Response (> 10 Menit)
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

    // 5. Query Tak Terjawab (> 24 Jam)
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

    // 6. Query Lead Aktif (Interaksi dalam 30 menit terakhir)
    const [liveChatRows] = await db.promise().query(`
      SELECT COUNT(DISTINCT sender) as liveCount 
      FROM messages 
      WHERE received_at >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
      ${deviceCondition}
    `);

    // 7. Ambil data device dari StarSender API
    const response = await axios.get(
      "https://api.starsender.online/api/devices",
      { headers: { Authorization: API_KEY_AKUN } }
    );
    const allDevices = response.data.data.devices || [];

    // 8. Kirim Response ke Frontend
    res.json({
      success: true,
      devices: allDevices,
      stats: {
        pesanMasuk: msgRows[0].pesanMasuk || 0,        // Sesuai filter dropdown
        pesanMasukToday: incomingToday[0].totalToday || 0, // Kunci per hari ini
        pesanKeluar: msgRows[0].pesanKeluar || 0,
        totalDevice: allDevices.length,
        deviceConnected: allDevices.filter((d) => d.status === "connected").length,
        leadMasuk: msgRows[0].leadMasuk || 0,         // Total customer unik (filter)
        leadAktif: liveChatRows[0].liveCount || 0,     // Chat aktif 30 menit terakhir
        slowResponse: slowResponseRows[0].slowCount || 0,
        unanswered: unansweredRows[0].unansweredCount || 0
      },
    });

  } catch (err) {
    console.error("Dashboard Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});



// ROUTE RECONNECT (HUBUNGKAN ULANG)
app.post("/device/reconnect/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.promise().query("SELECT device_key FROM devices WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "ID tidak ada" });

    // Panggil API Reconnect StarSender
    await axios.post(`https://api.starsender.online/api/devices/${rows[0].device_key}/reconnect`, {}, {
      headers: { "Authorization": API_KEY_AKUN }
    });

    res.json({ success: true, message: "Silakan scan ulang QR Code" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menghubungkan ulang" });
  }
});



app.post("/device/reconnect/:id", async (req, res) => {
  const deviceId = req.params.id;

  try {
    // 1. Beritahu StarSender untuk menyiapkan sesi pairing baru
    // Endpoint ini biasanya mengembalikan status 'pairing' atau 'waiting qr'
    const response = await axios.post(
      `https://api.starsender.online/api/devices/${deviceId}/reconnect`,
      {},
      {
        headers: {
          "Authorization": API_KEY_AKUN,
        },
      }
    );

    // 2. Update status di DB lokal agar UI berubah jadi 'disconnected' atau 'pairing'
    await db.promise().query(
      "UPDATE devices SET status = 'disconnected' WHERE id = ?", 
      [deviceId]
    );

    res.json({
      success: true,
      message: "Sesi telah direset. Silakan lakukan scan ulang.",
      data: response.data // Biasanya berisi data QR jika diperlukan
    });
  } catch (err) {
    console.error("Reconnect Error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "Gagal menghubungkan ulang ke server StarSender.",
    });
  }
});

// contact
// Endpoint untuk mengambil semua kontak
app.get("/api/contacts", async (req, res) => {
  const { search } = req.query;
  let query = "SELECT * FROM contacts";
  let params = [];

  // Jika ada parameter search, filter berdasarkan nama atau nomor
  if (search) {
    query += " WHERE name LIKE ? OR phone LIKE ?";
    params = [`%${search}%`, `%${search}%`];
  }

  query += " ORDER BY name ASC";

  try {
    const [rows] = await db.promise().query(query, params);

    // Hitung statistik singkat untuk header
    const total = rows.length;
    const online = rows.filter((c) => c.status === "Online").length;

    res.json({
      success: true,
      data: rows,
      stats: { total, online },
    });
  } catch (err) {
    console.error("Database Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data kontak" });
  }
});

// Endpoint untuk tambah kontak baru
app.post("/api/contacts", async (req, res) => {
  const { name, phone, status } = req.body;

  // Buat initial otomatis (Contoh: Admin Rian -> AR)
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
        [name, phone, status || "Offline", initials],
      );
    res.json({ success: true, message: "Kontak berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Nomor sudah terdaftar atau error sistem",
    });
  }
});
// app.get("/device/sync", async (req, res) => {
//   try {
//     const response = await axios.get(
//       "https://api.starsender.online/api/devices",
//       {
//         headers: {
//           Authorization: API_KEY_AKUN,
//           "Content-Type": "application/json",
//         },
//       },
//     );

//     console.log("📡 RAW DEVICES:", response.data);

//     if (!response.data.success) {
//       return res.status(400).json({
//         success: false,
//         message: "Gagal ambil device list",
//       });
//     }

//     // ✅ STRUKTUR BENAR
//     const devices = response.data.data.devices || [];

//     for (const d of devices) {
//       const deviceKey = d.device_key;
//       const deviceName = d.name;
//       const phone = d.phone || null;
//       const status =
//         d.status === "connected" || d.status === "ready"
//           ? "connected"
//           : "disconnected";

//       await db.promise().query(
//         `
//         INSERT INTO devices (device_key, device_name, phone_number, status)
//         VALUES (?, ?, ?, ?)
//         ON DUPLICATE KEY UPDATE
//           device_name = VALUES(device_name),
//           phone_number = VALUES(phone_number),
//           status = VALUES(status)
//         `,
//         [deviceKey, deviceName, phone, status],
//       );
//     }

//     res.json({ success: true, message: "Sync sukses" });
//   } catch (err) {
//     console.error("🔥 SYNC ERROR:", err.response?.data || err.message);
//     res.status(500).json({
//       success: false,
//       message: "Sync gagal",
//       error: err.message,
//     });
//   }
// });

// ===============================
// 🔹 ENDPOINT AMBIL SEMUA PESAN
// ===============================
app.get("/all", (req, res) => {
  const query = `
        SELECT id, sender as 'from', message_text as 'text', 
        DATE_FORMAT(received_at, '%H:%i') as 'time', 
        is_me as 'isMe' 
        FROM messages 
        ORDER BY id ASC
    `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.post("/webhook", async (req, res) => {
  const data = req.body;
  const pengirim = data.from || "";
  const isiPesan = data.message || "";

  // Ambil nama dari parameter URL: /webhook?name=tesssss
  const deviceNameFromQuery = req.query.name;

  try {
    if (!deviceNameFromQuery) {
      console.error("⚠️ Webhook masuk tanpa parameter Nama Device di URL!");
      return res.status(400).send("Parameter name is missing");
    }

    // 1. Cari data device di database berdasarkan nama
    const [rows] = await db
      .promise()
      .query(
        "SELECT device_key, device_name FROM devices WHERE device_name = ?",
        [deviceNameFromQuery],
      );

    // 2. Validasi: Jika nama device tidak ditemukan di database
    if (rows.length === 0) {
      console.error(
        `❌ Device [${deviceNameFromQuery}] tidak terdaftar di database lokal.`,
      );
      return res.status(404).send("Device not found in database");
    }

    const finalKey = rows[0].device_key;
    const finalName = rows[0].device_name;

    // 3. Simpan ke tabel messages
    // Pastikan kolom 'device_name' di tabel messages juga ada jika kamu menggunakannya
    await db.promise().query(
      `INSERT INTO messages (sender, message_text, is_me, device_key, device_name, received_at) 
             VALUES (?, ?, ?, ?, ?, NOW())`,
      [pengirim, isiPesan, 0, finalKey, finalName],
    );

    console.log(`✅ Pesan Berhasil Disimpan! Via: ${finalName}`);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/api/messages/all", async (req, res) => {
  // TAMBAHKAN m.device_key di bawah m.id
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
// ===============================
// 🔹 FETCH MESSAGES: FILTER BERDASARKAN DEVICE
// ===============================
app.get("/api/messages", (req, res) => {
  const { device_name } = req.query; // Ambil parameter dari frontend

  let query = `
    SELECT id, sender as 'from', message_text as 'text', 
    DATE_FORMAT(received_at, '%H:%i') as 'time', 
    is_me as 'isMe', device_name
    FROM messages
  `;

  const params = [];

  // Jika user memilih device tertentu di UI, filter datanya
  if (device_name && device_name !== "Semua Device") {
    query += " WHERE device_name = ?";
    params.push(device_name);
  }

  query += " ORDER BY received_at ASC";

  db.query(query, params, (err, results) => {
    if (err)
      return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: results });
  });
});

// ===============================
// 🔹 ENDPOINT: KIRIM PESAN (REPLY)
// ===============================
app.post("/api/send-message", async (req, res) => {
  // 1. Destrukturisasi sesuai dengan yang dikirim FE
  const { to, message, deviceKey } = req.body;

  // 2. Validasi Input
  if (!to || !message || !deviceKey) {
    console.error("❌ Data tidak lengkap dari FE:", req.body);
    return res.status(400).json({ 
      success: false, 
      message: "Data tidak lengkap. Pastikan field: to, message, dan deviceKey terisi." 
    });
  }

  // 3. Bersihkan nomor tujuan (Hanya angka)
  // Contoh: +62 821-1836-4415 -> 6282118364415
  const cleanTo = to.toString().replace(/\D/g, "");

  try {
    // 4. Ambil Nama Device dari DB Lokal (Agar log sinkron di database)
    const [deviceRows] = await db.promise().query(
      "SELECT device_name FROM devices WHERE device_key = ?", 
      [deviceKey]
    );

    const deviceName = deviceRows.length > 0 
      ? deviceRows[0].device_name 
      : "Unknown Device";

    // 5. Kirim ke API StarSender
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
          "Authorization": deviceKey, // Device Key bertindak sebagai API Key per device
        },
      }
    );

    // 6. Simpan ke tabel messages (is_me = 1 artinya pesan keluar/balasan kita)
    const insertQuery = `
      INSERT INTO messages 
      (device_key, device_name, sender, message_text, is_me, message_type, received_at) 
      VALUES (?, ?, ?, ?, 1, 'text', NOW())
    `;

    await db.promise().query(insertQuery, [
      deviceKey, 
      deviceName, 
      cleanTo, 
      message
    ]);

    console.log(`✅ Sukses Terkirim & Disimpan ke DB`);

    // 7. Berikan respon sukses ke Frontend
    res.json({ 
      success: true, 
      data: response.data 
    });

  } catch (err) {
    // Log error lengkap di terminal backend untuk debugging
    const errorDetail = err.response?.data || err.message;
    console.error("🔥 Error StarSender:", errorDetail);

    res.status(err.response?.status || 500).json({
      success: false,
      message: "Gagal kirim pesan ke StarSender",
      error: errorDetail,
    });
  }
});






// jalan
app.listen(PORT, () => {
  console.log(`🚀 Server SatuPintu berjalan di http://localhost:${PORT}`);
});
