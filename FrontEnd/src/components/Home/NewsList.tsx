import { useEffect, useState } from "react";
import { Calendar, Clock, ArrowRight } from "lucide-react";

// Tipe Data Berita
type NewsItem = {
  id: number;
  title: string;
  category: string;
  date: string;
  image_url: string;
  content: string;
  read_minutes: number;
};

export default function NewsList() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA DARI BACKEND
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        const res = await fetch(`${API_BASE}/api/news`); // Pakai backtick (``)
        if (res.ok) {
          const data = await res.json();
          setNews(data);
        }
      } catch (err) {
        console.error("Gagal ambil berita:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Jika loading, tampilkan skeleton sederhana atau kosong dulu
  if (loading) return null;

  // Jika tidak ada berita, sembunyikan section ini
  if (news.length === 0) return null;

  return (
    <section className="py-16 bg-slate-50">
      <div className="w-[min(1120px,92%)] mx-auto">
        
        {/* Header Section */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Kabar Banyumas</h2>
            <p className="text-slate-500">Informasi terkini seputar wisata dan event lokal.</p>
          </div>
          {/* Tombol Lihat Semua (Opsional) */}
          <button className="hidden md:flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700 transition">
            Lihat Semua <ArrowRight className="w-4 h-4 ml-1"/>
          </button>
        </div>

        {/* Grid Berita */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {news.map((item) => (
            <article key={item.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col md:flex-row h-full md:h-[200px]">
              
              {/* Gambar (Sebelah kiri/atas) */}
              <div className="md:w-5/12 h-48 md:h-full relative overflow-hidden">
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {item.category}
                </div>
              </div>

              {/* Konten (Sebelah kanan/bawah) */}
              <div className="p-6 md:w-7/12 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3"/> {item.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3"/> {item.read_minutes} min read
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                  {item.content}
                </p>

                <div className="mt-auto">
                  <span className="text-xs font-bold text-indigo-600 flex items-center group-hover:gap-2 transition-all">
                    Baca Selengkapnya <ArrowRight className="w-3 h-3 ml-1"/>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}