// src/pages/WisataPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaParking, FaMoneyBillAlt, FaCamera, FaLeaf, FaWater } from "react-icons/fa";

const tagConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  "Area Parkir Luas": { label: "Area Parkir Luas", icon: <FaParking /> },
  "Tiket Murah": { label: "Tiket Murah", icon: <FaMoneyBillAlt /> },
  "Spot Foto/Instagrammable": { label: "Spot Foto", icon: <FaCamera /> },
  "Pemandangan Alam": { label: "Pemandangan Alam", icon: <FaLeaf /> },
  "Wahana Air": { label: "Wahana Air", icon: <FaWater /> }
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
        
        // Gabungkan data
        setWisataList([...dataAlam, ...dataPend]);
      } catch (e) {
        console.error(e);
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
      
      // PERBAIKAN: Filter fasilitas menggunakan tags
      const matchTag = !activeTag || tags.includes(activeTag);

      return matchSearch && matchKategori && matchTag;
    });
  }, [wisataList, search, activeTag, activeKategori]);

  return (
    <section className="bg-pageRadial min-h-screen pb-20 px-4">
      <div className="max-w-6xl mx-auto pt-10">
        <h1 className="text-3xl font-bold text-[#001845]">Nature & Tourism</h1>
        
        <div className="mt-6 bg-white rounded-full border px-6 py-3 shadow-sm flex items-center gap-3">
          <input 
            className="w-full outline-none" 
            placeholder="Cari wisata..." 
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
              className={`px-4 py-2 rounded-full border text-sm ${activeKategori === cat ? "bg-[#001845] text-white" : "bg-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filter Fasilitas (Tags) */}
        <div className="mt-3 flex flex-wrap gap-2">
          {allTagFilters.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs ${activeTag === tag ? "bg-[#001845] text-white" : "bg-white"}`}
            >
              {tagConfig[tag]?.icon} {tagConfig[tag]?.label}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWisata.map((w) => (
            <Link key={`${w.id}-${w.kategori}`} to={`/wisata/${w.id}?kategori=${encodeURIComponent(w.kategori)}`}>
              <div className="bg-white rounded-[32px] shadow-lg overflow-hidden h-full flex flex-col hover:-translate-y-1 transition">
                <img src={w.link_foto || "https://placehold.co/600x400"} className="h-52 w-full object-cover" />
                <div className="p-6 flex-1 flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-blue-600 mb-1">{w.kategori}</span>
                  <h2 className="text-xl font-bold text-[#001845]">{w.nama_tempat}</h2>
                  <div className="mt-auto pt-4 flex gap-2">
                    {Array.isArray(w.tags) && w.tags.map((t: string) => tagConfig[t] && (
                      <div key={t} className="p-2 bg-slate-50 rounded-full text-slate-500" title={tagConfig[t].label}>
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
