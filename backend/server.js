const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));

const API_KEY = "8eedad2c-ad5a-4123-b682-25b103b08fc9";
const PORT = 3000;

// ===============================
// 🔹 KONFIGURASI DATABASE MYSQL
// ===============================
const db = mysql.createConnection({
    host: "localhost",
    user: "root",      // sesuaikan user mysql anda
    password: "",      // sesuaikan password mysql anda
    database: "wa_gateway"
});

db.connect((err) => {
    if (err) {
        console.error("Gagal koneksi Database:", err.message);
        return;
    }
    console.log("✅ Terkoneksi ke Database MySQL");
});

// ===============================
// 🔹 LOG PENGIRIMAN PESAN (ANTI-DUPLIKAT)
// ===============================
const sentLog = new Set();

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
            { headers: { "Content-Type": "application/json", Authorization: API_KEY } }
        );
        await delay(2000);
        return res.data;
    } catch (err) {
        console.error("Gagal kirim WA:", err.message);
        throw err;
    }
}

// ===============================
// 🔹 ENDPOINT KIRIM PESAN (OUTGOING)
// ===============================
app.post("/send", async (req, res) => {
    // Menambahkan namaBlast dan device jika Anda ingin menyimpannya nanti
    const { nomorTujuan, pesan, namaBlast, device } = req.body;

    // Validasi input minimal
    if (!nomorTujuan || !pesan) {
        return res.status(400).json({ 
            success: false, 
            message: "Nomor tujuan dan isi pesan wajib diisi." 
        });
    }

    try {
        // 1. Eksekusi pengiriman via API Starsender
        await kirimPesanAman(nomorTujuan, pesan);

        // 2. SIMPAN KE DATABASE (is_me = true)
        // Kita simpan namaBlast di kolom message_text atau kolom baru jika Anda menambahkannya
        const logPesan = namaBlast ? `[${namaBlast}] ${pesan}` : pesan;
        const query = "INSERT INTO messages (sender, message_text, is_me) VALUES (?, ?, ?)";
        
        db.query(query, [nomorTujuan, logPesan, true], (err, result) => {
            if (err) {
                console.error("❌ Database Error:", err);
                // Kita tetap kirim success karena pesan WA-nya sendiri sudah terkirim
            } else {
                console.log("✅ Pesan keluar tersimpan ke Database. ID:", result.insertId);
            }
        });

        // 3. Beri respon ke Frontend
        res.json({ 
            success: true, 
            message: "Pesan berhasil masuk antrean dan tersimpan di database." 
        });

    } catch (err) {
        console.error("❌ Gagal proses pengiriman:", err.message);
        res.status(500).json({ 
            success: false, 
            message: "Gagal mengirim pesan.",
            error: err.message 
        });
    }
});
// ===============================
// 🔹 ENDPOINT AMBIL SEMUA PESAN (DARI DATABASE)
// ===============================
app.get("/all", (req, res) => {
    // Mengambil data dari database, bukan array
    const query = "SELECT id, sender as 'from', message_text as 'text', received_at as 'time', is_me as 'isMe' FROM messages ORDER BY id DESC";
    
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
    console.log("Pesan masuk:", data);

    const pengirim = data.from || "";
    const isiPesan = data.message || "";

    // SIMPAN KE DATABASE (is_me = false)
    const query = "INSERT INTO messages (sender, message_text, is_me) VALUES (?, ?, ?)";
    db.query(query, [pengirim, isiPesan, false], async (err) => {
        if (err) {
            console.error("Gagal simpan pesan masuk ke DB:", err);
        } else {
            console.log("✅ Pesan masuk tersimpan di MySQL");
            
            // Auto-reply sederhana
            if (isiPesan.toLowerCase() === "halo") {
                await kirimPesanAman(pengirim, "Halo! Ada yang bisa kami bantu? 😊");
            }
        }
    });

    res.sendStatus(200);
});

// ===============================
// 🔹 START SERVER
// ===============================
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});