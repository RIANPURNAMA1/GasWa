import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast"; // Tambahkan Toaster di sini
import { Mail, Lock, LogIn, Loader2 } from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // ===============================
    // ✅ VALIDASI CLIENT
    // ===============================
    if (!email || !password) {
      toast.error("Email dan password wajib diisi ❌", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      toast.error("Format email tidak valid ❌");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // ===============================
      // ✅ LOGIN BERHASIL
      // ===============================
      if (response.ok && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast.success("Login berhasil! Mengalihkan... 🎉");

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } 
      // ===============================
      // ❌ LOGIN GAGAL (SERVER RESPONSE)
      // ===============================
      else {
        toast.error(data.message || "Email atau password salah ❌");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Koneksi gagal. Pastikan server aktif ⚠️");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a] p-4 font-sans">
      {/* Container Toast - Penting agar alert muncul */}
      <Toaster />

      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <div className="max-w-md w-full relative">
        <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 md:p-10">
          
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Satu<span className="text-blue-600">Pintu</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Kelola pesan WhatsApp Anda dengan mudah
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-blue-500'}`} size={18} />
                <input 
                  type="email" 
                  value={email}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="name@company.com"
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Lupa password?
                </button>
              </div>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-blue-500'}`} size={18} />
                <input 
                  type="password" 
                  value={password}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 ${loading ? 'opacity-70' : 'group-hover:scale-105'}`} />
              <div className="relative py-3.5 px-4 flex items-center justify-center gap-2 text-white font-bold tracking-wide">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Akun</span>
                    <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Create Account Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
             <p className="text-sm text-slate-500 dark:text-slate-400">
               Belum punya akun? {' '}
               <a href="#" className="text-blue-600 font-bold hover:underline transition-all">Daftar sekarang</a>
             </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">
          &copy; 2026 satuPintu Ecosystem &bull; Secure Access
        </p>
      </div>
    </div>
  );
};

export default Login;