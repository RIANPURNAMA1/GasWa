const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
    const { email, password } = req.body;
    
    // CEK DISINI: Apakah db dikirim lewat middleware atau harus import manual?
    const db = req.db || require('../../db'); // Sesuaikan path jika import manual

    try {
        if (!db) {
            throw new Error("Koneksi database (db) tidak ditemukan di objek request.");
        }

        // 1. Cari user
        const [users] = await db.promise().query(
            "SELECT * FROM users WHERE email = ?", 
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: "Email atau password salah" 
            });
        }

        const user = users[0];

        // 2. Bandingkan password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Email atau password salah" 
            });
        }

        // 3. Buat Token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || '9d15505c776ca580f07281cec6ef7ef85aef82bde41da34165ecde8f38cb1111',
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            message: "Login berhasil",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        // LIHAT TERMINAL: Error aslinya muncul di sini
        console.error("❌ Login Error Detail:", err.message);
        res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan server",
            error: err.message // Kirimkan ini sementara untuk debug
        });
    }
};

module.exports = { login };