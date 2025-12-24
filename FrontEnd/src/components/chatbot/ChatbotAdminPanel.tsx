import { FormEvent, useMemo, useState, useEffect } from "react";
import {
  MessageCircle,
  PlusCircle,
  Trash2,
  TrendingUp,
  Users,
  MessageSquare,
  HelpCircle
} from "lucide-react";
import { useChat } from "../../context/ChatContext"; // Tetap pakai ini untuk FAQ
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
  YAxis
} from "recharts";

// URL BACKEND
const API_BASE = "http://localhost:3000";

export default function ChatbotAdminPanel() {
  // Ambil fungsi FAQ dari Context lama (supaya fitur FAQ tidak hilang)
  const { faqs, addFaq, deleteFaq } = useChat();

  // State untuk Statistik dari Database
  const [dbStats, setDbStats] = useState({ 
    total_chats: 0, 
    total_questions: 0 
  });

  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqError, setFaqError] = useState("");

  // 1. FETCH DATA STATISTIK DARI BACKEND (REAL TIME)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chat/stats`);
        if (res.ok) {
          const data = await res.json();
          setDbStats(data);
        }
      } catch (err) {
        console.error("Gagal koneksi ke backend chatbot:", err);
      }
    };
    
    // Panggil saat load & set interval biar update tiap 5 detik
    fetchStats();
    const interval = setInterval(fetchStats, 5000); 
    return () => clearInterval(interval);
  }, []);

  // 2. HANDLER FORM FAQ (Masih Client-Side / Local)
  function handleFaqSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      setFaqError("Pertanyaan (kata kunci) dan jawaban wajib diisi.");
      return;
    }
    addFaq(faqQuestion, faqAnswer);
    setFaqQuestion("");
    setFaqAnswer("");
    setFaqError("");
  }

  // 3. DATA UNTUK GRAFIK (Gabungan Data DB & FAQ)
  const chartData = useMemo(
    () => [
      {
        key: "user",
        label: "Pertanyaan User",
        value: dbStats.total_questions, // Dari Database
      },
      {
        key: "bot",
        label: "Jawaban Bot",
        value: dbStats.total_questions, // Asumsi 1 tanya = 1 jawab
      },
      {
        key: "faq",
        label: "Jawaban FAQ",
        value: faqs.length, // Dari Context Local
      },
    ],
    [dbStats, faqs]
  );

  return (
    <section className="bg-white border border-border rounded-2xl shadow-soft p-5 space-y-6">
      {/* HEADER CHATBOT */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-brand/5">
            <MessageCircle className="w-5 h-5 text-brand" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brandSoft font-semibold">
              Chatbot
            </p>
            <h2 className="text-base font-semibold text-brand">
              Insight MasBot & FAQ
            </h2>
            <p className="text-xs text-muted mt-1 max-w-xl">
              Pantau performa chatbot (Realtime DB) dan atur FAQ.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 border border-border">
            Total FAQ:
            <span className="font-semibold text-brand">{faqs.length}</span>
          </span>
        </div>
      </div>

      {/* STAT & DIAGRAM */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.5fr)] items-stretch">
        
        {/* 4 KARTU STATISTIK (DATA ASLI DARI DB) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Total Sesi */}
          <div className="border border-border rounded-xl px-3 py-2 bg-slate-50/60 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1 text-muted">
               <Users className="w-3.5 h-3.5" /> Total Sesi
            </div>
            <p className="text-lg font-bold text-brand">
              {dbStats.total_chats}
            </p>
          </div>

          {/* Pertanyaan User */}
          <div className="border border-border rounded-xl px-3 py-2 bg-slate-50/60 flex flex-col justify-center">
             <div className="flex items-center gap-2 mb-1 text-muted">
               <HelpCircle className="w-3.5 h-3.5" /> Pertanyaan User
            </div>
            <p className="text-lg font-bold text-brand">
              {dbStats.total_questions}
            </p>
          </div>

          {/* Jawaban Bot */}
          <div className="border border-border rounded-xl px-3 py-2 bg-slate-50/60 flex flex-col justify-center">
             <div className="flex items-center gap-2 mb-1 text-muted">
               <MessageSquare className="w-3.5 h-3.5" /> Jawaban Bot
            </div>
            <p className="text-lg font-bold text-brand">
              {dbStats.total_questions}
            </p>
          </div>

          {/* FAQ (Masih Local) */}
          <div className="border border-border rounded-xl px-3 py-2 bg-slate-50/60 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1 text-muted">
               <TrendingUp className="w-3.5 h-3.5" /> Total FAQ
            </div>
            <p className="text-lg font-bold text-brand">
              {faqs.length}
            </p>
          </div>
        </div>

        {/* DIAGRAM AREA CHART */}
        <div className="border border-border rounded-xl px-4 py-3 bg-slate-50/80 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand" />
              <p className="text-xs font-semibold text-brand">
                Diagram Aktivitas
              </p>
            </div>
            <span className="text-[10px] text-muted">
              Live Data from Database
            </span>
          </div>

          <div className="w-full h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="chatbotArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4C74B9" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4C74B9" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 9, fill: "#64748B" }}
                  interval={0}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: "#64748B" }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ stroke: "#CBD5F5", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: 11,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="none"
                  fill="url(#chatbotArea)"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4C74B9"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FORM FAQ + LIST FAQ (TETAP ADA) */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)] items-start pt-4 border-t border-border/60 mt-4">
        {/* FORM TAMBAH FAQ */}
        <div>
          <h3 className="text-sm font-semibold text-brand mb-2">
            Tambah FAQ Baru
          </h3>
          <p className="text-xs text-muted mb-3">
            Kata kunci ini akan dijawab otomatis oleh sistem (Disimpan Local).
          </p>

          {faqError && (
            <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {faqError}
            </div>
          )}

          <form className="grid gap-2 text-xs" onSubmit={handleFaqSubmit}>
            <div className="grid gap-1">
              <label className="font-medium">Kata kunci pertanyaan</label>
              <input
                className="border border-border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-brand/50"
                placeholder="Contoh: jadwal trans banyumas"
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <label className="font-medium">Jawaban chatbot</label>
              <textarea
                className="border border-border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-brand/50 min-h-[90px]"
                placeholder="Tulis jawaban..."
                value={faqAnswer}
                onChange={(e) => setFaqAnswer(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="mt-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-black transition"
            >
              <PlusCircle className="w-4 h-4" />
              Simpan FAQ
            </button>
          </form>
        </div>

        {/* LIST FAQ */}
        <div>
          <h3 className="text-sm font-semibold text-brand mb-2">
            Daftar FAQ Aktif
          </h3>
          <p className="text-xs text-muted mb-3">
            Daftar pertanyaan yang sudah dikenali MasBot.
          </p>

          {faqs.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
               <p className="text-xs text-muted">Belum ada data FAQ.</p>
            </div>
          ) : (
            <ul className="space-y-2 text-xs h-[300px] overflow-y-auto pr-1">
              {faqs.map((f) => (
                <li
                  key={f.id}
                  className="border border-border rounded-lg px-3 py-2 flex justify-between gap-3 bg-slate-50/60"
                >
                  <div>
                    <p className="font-semibold mb-1 text-brand">{f.question}</p>
                    <p className="text-muted line-clamp-2">{f.answer}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteFaq(f.id)}
                    className="self-start text-[11px] text-slate-400 hover:text-red-600 transition p-1"
                    title="Hapus FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}