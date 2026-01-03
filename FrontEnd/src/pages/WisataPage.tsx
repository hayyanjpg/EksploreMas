// src/pages/WisataPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaParking, FaMoneyBillAlt, FaCamera, FaLeaf, FaWater } from "react-icons/fa";

const tagConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  "Area Parkir Luas": { label: "Area Parkir Luas", icon: <FaParking /> },
  "Tiket Murah": { label: "Tiket Murah", icon: <FaMoneyBillAlt /> },
  "Spot Foto/Instagrammable": { label: "Spot Foto", icon: <FaCamera /> },
  "Pemandangan Alam": { label: "Pemandangan Alam", icon: <FaLeaf /> },
  "Wahana Air": { label: "Wahana Air", icon: <FaWater /> },
  parking: { label: "Parkir", icon: <FaParking /> },
  cheap: { label: "Murah", icon: <FaMoneyBillAlt /> },
  nature: { label: "Alam", icon: <FaLeaf /> },
};

const WisataPage: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeKategori, setActiveKategori] = useState<string | null>(null);
  const [wisataList, setWisataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resAlam, resPend] = await Promise.all([
          fetch(`${API_BASE}/wisata_alam`),
          fetch(`${API_BASE}/wisata_pendidikan`)
        ]);
        const dataAlam = await resAlam.json();
        const dataPend = await resPend.json();
        setWisataList([...dataAlam, ...dataPend]);
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE]);

  const filteredWisata = useMemo(() => {
    return wisataList.filter((w) => {
      const name = (w.nama_tempat || w.name || "").toLowerCase();
      const kategori = (w.kategori || "").toLowerCase().trim();
      const tags = Array.isArray(w.tags) ? w.tags : [];

      const matchSearch = name.includes(search.toLowerCase());
      const matchKategori = !activeKategori || kategori === activeKategori.toLowerCase();
      const matchTag = !activeTag || tags.includes(activeTag);

      return matchSearch && matchKategori && matchTag;
    });
  }, [wisataList, search, activeTag, activeKategori]);

  return (
    <section id="wisata" className="bg-pageRadial min-h-screen pb-20 px-4">
      <div className="max-w-6xl mx-auto pt-10">
        <h1 className="text-3xl font-bold text-[#001845] font-playfair">Nature & Tourism</h1>
        <p className="text-slate-500 mt-2">Temukan keajaiban alam dan edukasi di Purwokerto</p>
        
        <div className="mt-6 bg-white rounded-full border border-slate-200 px-6 py-3 shadow-sm flex items-center gap-3">
          <span className="text-slate-400">🔍</span>
          <input 
            className="w-full outline-none text-slate-700" 
            placeholder="Cari destinasi favorit..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["Wisata Alam", "Wisata Pendidikan"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveKategori(activeKategori === cat ? null : cat)}
              className={`px-5 py-2 rounded-full border text-sm font-medium transition-all ${
                activeKategori === cat ? "bg-[#001845] text-white border-[#001845]" : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWisata.map((w) => (
            <Link key={w.id} to={`/wisata/${w.id}`} className="group">
              <div className="bg-white rounded-[32px] shadow-lg overflow-hidden h-full flex flex-col border border-slate-100 group-hover:-translate-y-2 transition-transform duration-300">
                <div className="h-52 overflow-hidden">
                   <img src={w.link_foto || w.pictures || "https://placehold.co/600x400"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={w.nama_tempat} />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{w.kategori}</span>
                    <span className="text-xs font-bold text-slate-900">Rp {(w.htm || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#001845] line-clamp-1">{w.nama_tempat || w.name}</h2>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2 italic">📍 {w.alamat}</p>
                  <div className="mt-auto pt-5 flex gap-2">
                    {Array.isArray(w.tags) && w.tags.map((t: string) => tagConfig[t] && (
                      <div key={t} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 border border-slate-100" title={tagConfig[t].label}>
                        {tagConfig[t].icon}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && filteredWisata.length === 0 && (
          <div className="text-center py-20 bg-white/50 rounded-3xl mt-10 border border-dashed border-slate-300">
            <p className="text-slate-400 font-medium">Destinasi tidak ditemukan dengan kriteria tersebut.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default WisataPage;
