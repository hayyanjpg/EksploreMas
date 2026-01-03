// src/pages/WisataPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaParking, FaMoneyBillAlt, FaCamera, FaLeaf, FaWater } from "react-icons/fa";

// Interface untuk tipe data Wisata agar konsisten
interface WisataUI {
  uniqueId: string;
  id: string;
  nama_tempat: string;
  kategori: string;
  alamat: string;
  link_foto: string;
  htm: number;
  tags: string[];
  jam_buka: string;
  jam_tutup: string;
}

const tagConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  "Area Parkir Luas": { label: "Area Parkir Luas", icon: <FaParking /> },
  "Tiket Murah": { label: "Tiket Murah", icon: <FaMoneyBillAlt /> },
  "Spot Foto/Instagrammable": { label: "Spot Foto", icon: <FaCamera /> },
  "Pemandangan Alam": { label: "Pemandangan Alam", icon: <FaLeaf /> },
  "Wahana Air": { label: "Wahana Air", icon: <FaWater /> },
  parking: { label: "Parkir", icon: <FaParking /> },
  nature: { label: "Alam", icon: <FaLeaf /> },
};

const allTagFilters = ["Area Parkir Luas", "Tiket Murah", "Spot Foto/Instagrammable", "Pemandangan Alam", "Wahana Air"];

const WisataPage: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeKategori, setActiveKategori] = useState<string | null>(null);
  const [wisataList, setWisataList] = useState<WisataUI[]>([]);
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
        
        // Menambahkan Unique ID Prefix untuk mencegah ID tertukar di halaman detail
        const mappedAlam = dataAlam.map((item: any) => ({ ...item, uniqueId: `ALAM-${item.id}` }));
        const mappedPend = dataPend.map((item: any) => ({ ...item, uniqueId: `EDU-${item.id}` }));

        setWisataList([...mappedAlam, ...mappedPend]);
      } catch (e) {
        console.error("Gagal mengambil data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE]);

  const filteredWisata = useMemo(() => {
    return wisataList.filter((w) => {
      const name = (w.nama_tempat || "").toLowerCase();
      const kategori = (w.kategori || "").toLowerCase().trim();
      const tags = Array.isArray(w.tags) ? w.tags : [];

      const matchSearch = name.includes(search.toLowerCase());
      const matchKategori = !activeKategori || kategori === activeKategori.toLowerCase();
      
      // Menggunakan tipe string eksplisit pada parameter 't' untuk menghindari error build
      const matchTag = !activeTag || tags.some((t: string) => 
        t === activeTag || 
        (activeTag === "Area Parkir Luas" && t === "parking") ||
        (activeTag === "Pemandangan Alam" && t === "nature")
      );

      return matchSearch && matchKategori && matchTag;
    });
  }, [wisataList, search, activeTag, activeKategori]);

  return (
    <section className="bg-pageRadial min-h-screen pb-20 px-4">
      <div className="max-w-6xl mx-auto pt-10">
        <h1 className="text-3xl font-bold text-[#001845] font-playfair">Nature & Tourism</h1>
        
        {/* Search Input */}
        <div className="mt-6 bg-white rounded-full border border-slate-200 px-6 py-3 shadow-sm flex items-center gap-3">
          <input 
            className="w-full outline-none text-slate-700" 
            placeholder="Cari destinasi favorit..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Kategori */}
        <div className="mt-4 flex flex-wrap gap-2">
          {["Wisata Alam", "Wisata Pendidikan"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveKategori(activeKategori === cat ? null : cat)}
              className={`px-5 py-2 rounded-full border text-sm font-medium transition-all ${
                activeKategori === cat ? "bg-[#001845] text-white" : "bg-white text-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filter Fasilitas */}
        <div className="mt-3 flex flex-wrap gap-2">
          {allTagFilters.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition ${
                activeTag === tag ? "bg-[#001845] text-white" : "bg-white text-slate-600"
              }`}
            >
              {tagConfig[tag]?.icon} {tagConfig[tag]?.label}
            </button>
          ))}
        </div>

        {/* Render Grid Card */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWisata.map((w) => (
            <Link key={w.uniqueId} to={`/wisata/${w.uniqueId}`}>
              <div className="bg-white rounded-[32px] shadow-lg overflow-hidden h-full flex flex-col border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                <div className="h-52 overflow-hidden">
                   <img 
                    src={w.link_foto !== "-" ? w.link_foto : "https://placehold.co/600x400"} 
                    className="w-full h-full object-cover" 
                    alt={w.nama_tempat} 
                   />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 w-fit">
                    {w.kategori}
                  </span>
                  <h2 className="text-xl font-bold text-[#001845]">{w.nama_tempat}</h2>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">📍 {w.alamat}</p>
                  
                  {/* Ikon Fasilitas pada Card */}
                  <div className="mt-auto pt-5 flex gap-2 flex-wrap">
                    {w.tags && w.tags.map((t: string) => tagConfig[t] && (
                      <div 
                        key={t} 
                        className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 border border-slate-100" 
                        title={tagConfig[t].label}
                      >
                        {tagConfig[t].icon}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {loading && <p className="text-center mt-10 animate-pulse text-slate-400">Memuat data destinasi...</p>}
      </div>
    </section>
  );
};

export default WisataPage;
