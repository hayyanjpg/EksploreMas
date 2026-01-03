// src/pages/WisataPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaParking, FaMoneyBillAlt, FaCamera, FaLeaf, FaWater } from "react-icons/fa";

// Konfigurasi Tags yang Konsisten dengan Database
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

const allTagFilters = ["Area Parkir Luas", "Tiket Murah", "Spot Foto/Instagrammable", "Pemandangan Alam", "Wahana Air"];

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
        
        // Gabungkan data dengan penanda sumber asli agar tidak tertukar saat klik detail
        setWisataList([...dataAlam, ...dataPend]);
      } catch (e) {
        console.error("Gagal memuat data:", e);
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
      
      // PERBAIKAN: Gunakan perbandingan string eksak untuk kategori
      const matchKategori = !activeKategori || kategori === activeKategori.toLowerCase();
      
      const matchTag = !activeTag || tags.includes(activeTag);

      return matchSearch && matchKategori && matchTag;
    });
  }, [wisataList, search, activeTag, activeKategori]);

  return (
    <section className="bg-pageRadial min-h-screen pb-20 px-4">
      <div className="max-w-6xl mx-auto pt-10">
        <h1 className="text-3xl font-bold text-[#001845]">Nature & Tourism</h1>
        
        {/* Search */}
        <div className="mt-6 bg-white rounded-full border px-6 py-3 shadow-sm flex items-center gap-3">
          <input 
            className="w-full outline-none" 
            placeholder="Cari wisata alam atau pendidikan..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Kategori Filter */}
        <div className="mt-4 flex flex-wrap gap-2">
          {["Wisata Alam", "Wisata Pendidikan"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveKategori(activeKategori === cat ? null : cat)}
              className={`px-4 py-2 rounded-full border text-sm transition ${activeKategori === cat ? "bg-[#001845] text-white" : "bg-white text-slate-600"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Fasilitas Filter - Dipastikan Tetap Muncul */}
        <div className="mt-4 flex flex-wrap gap-2">
          {allTagFilters.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition ${activeTag === tag ? "bg-[#001845] text-white" : "bg-white text-slate-600"}`}
            >
              {tagConfig[tag]?.icon} {tagConfig[tag]?.label}
            </button>
          ))}
        </div>

        {/* Grid List */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWisata.map((w) => (
            <Link key={`${w.id}-${w.kategori}`} to={`/wisata/${w.id}`}>
              <div className="bg-white rounded-[32px] shadow-lg overflow-hidden h-full flex flex-col hover:-translate-y-1 transition">
                <img src={w.link_foto || w.pictures || "https://placehold.co/600x400"} className="h-52 w-full object-cover" alt={w.nama_tempat} />
                <div className="p-6 flex-1 flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-blue-600 mb-1">{w.kategori}</span>
                  <h2 className="text-xl font-bold text-[#001845]">{w.nama_tempat || w.name}</h2>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">📍 {w.alamat}</p>
                  
                  {/* Fasilitas Icons */}
                  <div className="mt-auto pt-4 flex gap-2 flex-wrap">
                    {Array.isArray(w.tags) && w.tags.map((t: string) => tagConfig[t] && (
                      <div key={t} className="p-2 bg-slate-50 rounded-full text-slate-500 border border-slate-100" title={tagConfig[t].label}>
                        {tagConfig[t].icon}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WisataPage;
