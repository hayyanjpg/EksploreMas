import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom"; 
// Ganti path gambar ini sesuai lokasi gambar maskot login kamu
import loginMascot from "../assets/images/maskot/login.png"; 

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username dan password wajib diisi");
      return;
    }

    try {
      setIsLoading(true);

      // --- PERUBAHAN UTAMA DI SINI ---
      // Gunakan environment variable jika ada (saat hosting), 
      // atau pakai localhost jika di komputer sendiri.
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      
      const response = await fetch(`${API_BASE}/admin_login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username, 
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Login gagal. Cek username/password admin.");
      }

      const data = await response.text();
      console.log("Admin Login Success:", data);

      // Simpan penanda bahwa admin sedang login
      localStorage.setItem("role", "admin");

      alert("Welcome Admin! Mengalihkan ke Dashboard...");
      navigate("/admin"); // Redirect ke Dashboard Admin

    } catch (err: any) {
      console.error(err);
      setError("Akses ditolak. Pastikan akun admin sudah dibuat di database.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-[min(400px,92%)] bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Hiasan Background */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        {/* Header Khusus Admin */}
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold tracking-[0.2em] text-indigo-600 uppercase mb-2">
            Restricted Area
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Admin Portal
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Masukkan kredensial khusus pengelola.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Username Admin</label>
            <input
              type="text"
              className="w-full rounded-xl border-slate-200 border bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border-slate-200 border bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition transform active:scale-[0.98]
              ${isLoading 
                ? "bg-slate-400 cursor-not-allowed" 
                : "bg-slate-900 hover:bg-black shadow-lg hover:shadow-xl hover:shadow-indigo-500/20"}
            `}
          >
            {isLoading ? "Memverifikasi..." : "Masuk Dashboard"}
          </button>
        </form>

        <div className="mt-8 text-center">
            <a href="/" className="text-xs text-slate-400 hover:text-slate-600 transition">
                ← Kembali ke Halaman Utama
            </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;