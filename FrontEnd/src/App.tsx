// src/App.tsx
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

// CAFE
import CafePage from "./pages/CafePage";
import CafeDetail from "./pages/CafeDetail";

// TRANS BANYUMAS
import TransBanyumas from "./pages/TransBanyumas";

// WISATA
import WisataPage from "./pages/WisataPage";
import WisataDetail from "./pages/WisataDetail";

// CHAT
import ChatButton from "./components/chat/ChatButton";
import ChatPopup from "./components/chat/ChatPopup";

// CONTEXT CHAT
import { ChatProvider } from "./context/ChatContext";

// ADMIN (Import Halaman Login Admin & Dashboard)
import AdminDashboard from "./pages/AdminDashboard";
import AdminLoginPage from "./pages/AdminLoginPage"; // <--- TAMBAHAN PENTING

// AUTH
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <ChatProvider>
      <Routes>
        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* AUTH USER BIASA */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* === ADMIN AREA (HIDDEN/RAHASIA) === */}
        {/* Akses manual di browser: localhost:5173/loginadmin */}
        <Route path="/loginadmin" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* CAFE */}
        <Route path="/cafes" element={<CafePage />} />
        <Route path="/cafes/:slug" element={<CafeDetail />} />

        {/* WISATA */}
        <Route path="/wisata" element={<WisataPage />} />
        <Route path="/wisata/:slug" element={<WisataDetail />} />

        {/* TRANS BANYUMAS */}
        <Route path="/trans" element={<TransBanyumas />} />

        {/* (OPSIONAL) FALLBACK 404 → Arahkan ke Home jika halaman tidak ada */}
        <Route path="*" element={<Home />} />
      </Routes>

      {/* GLOBAL CHAT BOT */}
      <ChatButton />
      <ChatPopup />
    </ChatProvider>
  );
}

export default App;