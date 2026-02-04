const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));

console.log(process.env.STARSENDER_KEY);

const API_KEY = "8eedad2c-ad5a-4123-b682-25b103b08fc9";
const API_KEY_AKUN = "f272bd85-1ea1-4bcc-9d88-b585b2bda634";
const PORT = 3000;

// ===============================
// 🔹 KONFIGURASI DATABASE MYSQL
// ===============================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "wa_gateway",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Gagal koneksi Database:", err.message);
    return;
  }
  console.log("✅ Terkoneksi ke Database MySQL");
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===============================
// 🔹 FUNGSI KIRIM PESAN
// ===============================
async function kirimPesanAman(nomor, pesan) {
  try {
    const res = await axios.post(
      "https://api.starsender.online/api/send",
      { messageType: "text", to: nomor, body: pesan },
      {
        headers: { "Content-Type": "application/json", Authorization: API_KEY },
      },
    );
    await delay(2000);
    return res.data;
  } catch (err) {
    console.error("Gagal kirim WA:", err.message);
    throw err;
  }
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
  try {
    const response = await axios.get("https://api.starsender.online/api/devices", {
      headers: { Authorization: API_KEY_AKUN },
    });

    const devices = response.data.data?.devices || response.data.data || [];

    if (!Array.isArray(devices)) {
      return res.status(400).json({ success: false, message: "Data bukan array" });
    }

    for (const dev of devices) {
      const deviceKey = dev.device_key || dev.key || dev.id;
      const deviceName = dev.name || dev.device_name || "Unknown";
      
      // Fokus di sini: StarSender mengirim "no_hp"
      const phone = dev.no_hp || dev.phone || dev.phone_number || dev.number || null;
      
      const serverId = dev.server_id || dev.server || null;

      const rawStatus = String(dev.status || "").toLowerCase();
      // Perhatikan: di log kamu ada status "not connected", pastikan mappingnya pas
      const status = (rawStatus === "connected" || rawStatus === "ready") 
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
        [deviceKey, deviceName, phone, status, serverId]
      );
    }

    res.json({ success: true, message: "Sync berhasil! Nomor HP sekarang terisi." });
  } catch (err) {
    console.error("🔥 ERROR DETAIL:", err.response?.data || err.message);
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
  const { filter, device } = req.query; // Menangkap parameter 'device'

  // 1. Mapping Waktu
  const filterMap = {
    "Hari ini": "DATE(received_at) = CURDATE()",
    Kemarin: "DATE(received_at) = SUBDATE(CURDATE(), 1)",
    Minggu: "received_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
    Bulan: "received_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)",
  };

  let timeCondition = filterMap[filter] || filterMap["Hari ini"];

  // 2. Logika Filter Device
  // Kita buat array untuk menampung kondisi SQL agar lebih rapi
  let conditions = [timeCondition];

  // Jika user memilih device spesifik, tambahkan ke kondisi WHERE
  if (device && device !== "Semua Device") {
    // Sesuaikan 'device_name' dengan nama kolom di database kamu
    conditions.push(`device_name = ${db.escape(device)}`);
  }

  // Gabungkan semua kondisi dengan AND
  const finalWhereClause = conditions.join(" AND ");

  try {
    // 3. Eksekusi Query dengan filter yang sudah digabung
    const [msgRows] = await db.promise().query(`
      SELECT 
        SUM(CASE WHEN is_me = 0 THEN 1 ELSE 0 END) as pesanMasuk,
        SUM(CASE WHEN is_me = 1 THEN 1 ELSE 0 END) as pesanKeluar
      FROM messages 
      WHERE ${finalWhereClause}
    `);

    // 4. Ambil data device dari StarSender untuk mengisi dropdown
    const response = await axios.get(
      "https://api.starsender.online/api/devices",
      {
        headers: { Authorization: API_KEY_AKUN },
      },
    );
    const allDevices = response.data.data.devices || [];

    res.json({
      success: true,
      devices: allDevices,
      stats: {
        pesanMasuk: msgRows[0].pesanMasuk || 0,
        pesanKeluar: msgRows[0].pesanKeluar || 0,
        totalDevice: allDevices.length,
        deviceConnected: allDevices.filter((d) => d.status === "connected")
          .length,
        percakapanAktif: Math.floor((msgRows[0].pesanMasuk || 0) * 0.7),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// Endpoint Logout (Memutus Sesi)
app.post("/device/logout", async (req, res) => {
  try {
    // Logika StarSender untuk disconnect biasanya via endpoint khusus
    // Jika tidak ada, kita bisa mengosongkan status di lokal saja
    res.json({ success: true, message: "Sesi berhasil diputuskan" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
app.get("/device/sync", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.starsender.online/api/devices",
      {
        headers: {
          Authorization: API_KEY_AKUN,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("📡 RAW DEVICES:", response.data);

    if (!response.data.success) {
      return res.status(400).json({
        success: false,
        message: "Gagal ambil device list",
      });
    }

    // ✅ STRUKTUR BENAR
    const devices = response.data.data.devices || [];

    for (const d of devices) {
      const deviceKey = d.device_key;
      const deviceName = d.name;
      const phone = d.phone || null;
      const status =
        d.status === "connected" || d.status === "ready"
          ? "connected"
          : "disconnected";

      await db.promise().query(
        `
        INSERT INTO devices (device_key, device_name, phone_number, status)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          device_name = VALUES(device_name),
          phone_number = VALUES(phone_number),
          status = VALUES(status)
        `,
        [deviceKey, deviceName, phone, status],
      );
    }

    res.json({ success: true, message: "Sync sukses" });
  } catch (err) {
    console.error("🔥 SYNC ERROR:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "Sync gagal",
      error: err.message,
    });
  }
});

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

// ===============================
// 🔹 WEBHOOK TERIMA PESAN (INCOMING)
// ===============================
app.post("/webhook", (req, res) => {
  const data = req.body;

  const deviceKey = data.device_key || null;
  const deviceName = data.device_name || null;
  const pengirim = data.from || "";
  const isiPesan = data.message || "";

  const query = `
    INSERT INTO messages 
    (sender, message_text, is_me, device_key, device_name) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [pengirim, isiPesan, false, deviceKey, deviceName],
    async (err) => {
      if (err) {
        console.error("❌ Gagal simpan pesan masuk:", err);
      } else {
        console.log(`✅ Pesan masuk dari ${pengirim} (Device: ${deviceName})`);

        if (isiPesan.toLowerCase() === "ping") {
          await axios.post(
            "https://api.starsender.online/api/send",
            { messageType: "text", to: pengirim, body: "PONG! 🚀" },
            { headers: { Authorization: deviceKey } }, // 🔥 kirim pakai API KEY device itu
          );
        }
      }
    },
  );

  app.get("/messages", (req, res) => {
    const { device } = req.query;

    let query = `
    SELECT id, sender as 'from', message_text as 'text',
    DATE_FORMAT(received_at, '%H:%i') as 'time',
    is_me as 'isMe'
    FROM messages
  `;

    let params = [];

    if (device) {
      query += " WHERE device_name = ?";
      params.push(device);
    }

    query += " ORDER BY id ASC";

    db.query(query, params, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🚀 Server SatuPintu berjalan di http://localhost:${PORT}`);
});
