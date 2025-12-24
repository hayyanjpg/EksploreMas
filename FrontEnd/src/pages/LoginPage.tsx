import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom"; // TAMBAHAN: Untuk pindah halaman
import loginMascot from "../assets/images/maskot/login.png";

const LoginPage: React.FC = () => {
  const navigate = useNavigate(); // Hook navigasi

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  
  // TAMBAHAN: State untuk loading & error backend
  const [isLoading, setIsLoading] = useState(false);
  const [backendError, setBackendError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBackendError(""); // Reset error lama

    // Validasi input kosong
    if (!email || !password) {
      setShowErrors(true);
      return;
    }

    try {
      setIsLoading(true);

      // 1. Kirim data ke Backend
      // Backend kamu menggunakan endpoint /login dan meminta 'username' & 'password'
      // Karena loginmu pakai email, kita perlu pastikan backend login pakai email atau username?
      // Berdasarkan kode user.rs backend kamu: "SELECT * FROM users WHERE username = $1"
      // ARTINYA: Backend login pakai USERNAME, bukan email.
      // TAPI: Di form ini inputnya "Email". 
      
      // SOLUSI: Sementara kita kirim 'email' ini sebagai 'username' ke backend
      // (Asumsi user mendaftar pakai email sebagai username, atau backend perlu diubah nanti)
      
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email, // Kirim email sebagai field 'username' ke backend
          password: password,
        }),
      });

      // 2. Cek Jawaban Backend
      if (!response.ok) {
        // Jika 401 (Salah password) atau 404 (User tidak ada)
        const errorMessage = await response.text(); 
        throw new Error(errorMessage || "Login gagal. Periksa email/password.");
      }

      // 3. Jika Sukses (200 OK)
      const data = await response.text(); // Backend membalas text "Logged in"
      console.log("Login Success:", data);

      // Simpan status login (opsional, bisa pakai localStorage)
      // localStorage.setItem("isLoggedIn", "true");

      alert("Login Berhasil!");
      navigate("/"); // PINDAH KE HALAMAN HOME

    } catch (error: any) {
      console.error("Login Error:", error);
      setBackendError("Email atau kata sandi salah.");
    } finally {
      setIsLoading(false);
    }
  };

  const emailError = showErrors && !email;
  const passwordError = showErrors && !password;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-[#f5f4ff]">
      <div className="w-[min(420px,92%)] bg-white shadow-[0_18px_45px_rgba(12,27,76,0.14)] rounded-3xl p-8 border border-[#E3E6F5]">

        {/* ===== MASKOT LOGIN ===== */}
        <div className="flex justify-center -mt-20 mb-2">
          <img
            src={loginMascot}
            alt="Login Mascot"
            className="w-[120px] h-auto"
          />
        </div>

        {/* ===== HEADER ===== */}
        <div className="mb-6 text-center">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#5E6282] uppercase">
            Welcome back
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-[#181E4B]">
            Masuk ke akunmu
          </h1>
          <p className="text-xs mt-2 text-[#5E6282]">
            Lanjutkan eksplorasi dan nikmati slow–living di Purwokerto.
          </p>
        </div>

        {/* TAMBAHAN: Pesan Error Backend */}
        {backendError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-center">
            <p className="text-xs text-red-600 font-medium">{backendError}</p>
          </div>
        )}

        {/* ===== FORM ===== */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email / Username */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#181E4B]">
              Username / Email
            </label>
            <input
              type="text" // Ganti type email jadi text biar fleksibel
              className={`w-full rounded-2xl border px-3.5 py-2.5 text-sm outline-none transition
              ${
                emailError
                  ? "border-[#f87171] ring-1 ring-[#fca5a5]"
                  : "border-[#E3E6F5] focus:border-[#0f1f56] focus:ring-1 focus:ring-[#0f1f56]/40"
              } bg-white`}
              placeholder="Masukkan username saat daftar"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (showErrors) setShowErrors(false);
                setBackendError(""); // Hilangkan error saat mengetik
              }}
            />
            {emailError && (
              <p className="text-[11px] text-[#b91c1c]">
                Username tidak boleh kosong.
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#181E4B]">
              Kata sandi
            </label>
            <input
              type="password"
              className={`w-full rounded-2xl border px-3.5 py-2.5 text-sm outline-none transition
              ${
                passwordError
                  ? "border-[#f87171] ring-1 ring-[#fca5a5]"
                  : "border-[#E3E6F5] focus:border-[#0f1f56] focus:ring-1 focus:ring-[#0f1f56]/40"
              } bg-white`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (showErrors) setShowErrors(false);
                setBackendError("");
              }}
            />
            {passwordError && (
              <p className="text-[11px] text-[#b91c1c]">
                Kata sandi tidak boleh kosong.
              </p>
            )}
          </div>

          {/* Remember */}
          <div className="flex items-center justify-between text-[11px] mt-1">
            <label className="inline-flex items-center gap-2 text-[#5E6282]">
              <input type="checkbox" className="rounded border-[#E3E6F5]" />
              <span>Ingat saya</span>
            </label>
            <button
              type="button"
              className="text-[#0f1f56] hover:underline"
            >
              Lupa kata sandi?
            </button>
          </div>

          {/* Button */}
          <div className="mt-4 relative">
            <span
              aria-hidden
              className="absolute left-1/2 -translate-x-1/2 bottom-[-10px] w-[180px] h-[42px] rounded-full
              bg-[radial-gradient(closest-side,rgba(255,210,150,0.42),rgba(255,210,150,0)_78%)]
              blur-[10px]"
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`relative z-10 w-full rounded-2xl py-2.5 text-sm font-semibold
              text-white shadow-[0_12px_28px_rgba(12,27,76,0.35)]
              transition ${
                isLoading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-[#0f1f56] hover:opacity-95 active:scale-[0.99]"
              }`}
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </div>
        </form>

        {/* Register link */}
        <p className="mt-6 text-center text-[11px] text-[#5E6282]">
          Belum punya akun?{" "}
          <a
            href="/register"
            className="font-semibold text-[#0f1f56] hover:underline"
          >
            Daftar sekarang
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;