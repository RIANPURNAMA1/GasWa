const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const API_KEY = "8eedad2c-ad5a-4123-b682-25b103b08fc9";
const PORT = 3000;

/* ===============================
   🔹 FUNGSI KIRIM PESAN
================================ */
async function kirimPesan(nomor, pesan) {
  try {
    const res = await axios.post(
      "https://api.starsender.online/api/send",
      {
        messageType: "text",
        to: nomor,
        body: pesan
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": API_KEY
        }
      }
    );

    console.log("Pesan terkirim:", res.data);
  } catch (err) {
    console.error("Gagal kirim:", err.response?.data || err.message);
  }
}

/* ===============================
   🔹 ENDPOINT TEST KIRIM MANUAL
   buka di browser:
   http://localhost:3000/test
================================ */
app.get("/test", async (req, res) => {
  await kirimPesan("082118364415", "Halo, ini pesan test dari server Node 🚀");
  res.send("Pesan dikirim, cek WhatsApp tujuan.");
});

/* ===============================
   🔹 WEBHOOK TERIMA PESAN MASUK
================================ */
app.post("/webhook", async (req, res) => {
  const data = req.body;

  console.log("Pesan masuk:", data);

  const pengirim = data.from || data.sender || "";
  const isiPesan = data.message || data.body || "";

  // ===== AUTO REPLY =====
  if (isiPesan.toLowerCase() === "halo") {
    await kirimPesan(pengirim, "Halo juga! Ada yang bisa dibantu?");
  }

  res.sendStatus(200);
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
