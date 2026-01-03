// src/pages/WisataPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaParking, FaMoneyBillAlt, FaCamera, FaLeaf, FaWater } from "react-icons/fa";

type WisataTag = string;

interface Wisata {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  address: string;
  openingHours: string;
  priceRange: string;
  tags: WisataTag[];
  kategori: string;
}

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
  const [wisataList, setWisataList] = useState<Wisata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mapWisata = (raw: any, idx: number): Wisata => {
    const name = raw.nama_tempat || raw.name || `Wisata ${idx + 1}`;
    // Normalisasi Kategori untuk Filter agar konsisten (lowercase)
    const kategori = String(raw.kategori || "").toLowerCase().trim();
    const jamBuka = raw.jam_buka || "";
    const jamTutup = raw.jam_tutup || "";
    
    return {
      id: String(raw.id),
      name,
      description: raw.deskripsi || `Jelajahi keindahan ${name}`,
      imageUrl: raw.link_foto || "https://placehold.co/800x600?text=Wisata",
      address: raw.alamat || "Banyumas, Jawa Tengah",
      openingHours: jamBuka && jamTutup ? `${jamBuka} - ${jamTutup}` : jamBuka || "08:00 - 17:00",
      priceRange: typeof raw.htm === 'number' ? `Rp ${raw.htm.toLocaleString('id-ID')}` : (raw.htm || "Gratis"),
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      kategori: kategori,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resAlam, resPend] = await Promise.all([
          fetch(`${API_BASE}/wisata_alam`),
          fetch(`${API_BASE}/wisata_pendidikan`)
        ]);
        const dataAlam = await resAlam.json();
        const dataPend = await resPend.json();
        const merged = [...dataAlam, ...dataPend].map((item, i) => mapWisata(item, i));
        setWisataList(merged);
      } catch (e) {
        setError("Gagal memuat data destinasi.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE]);

  const filteredWisata = useMemo(() => {
    return wisataList.filter((w) => {
      const matchSearch = w.name.toLowerCase().includes(search.toLowerCase());
      const matchTag = !activeTag || w.tags.includes(activeTag);
      // Pengecekan Kategori yang lebih fleksibel
      const matchKategori = !activeKategori || w.kategori.includes(activeKategori);
      return matchSearch && matchTag && matchKategori;
    });
  }, [wisataList, search, activeTag, activeKategori]);

  return (
    <section className="bg-pageRadial min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <h1 className="text-3xl font-bold text-[#001845]">Nature & Tourism</h1>
        
        {/* Search Bar */}
        <div className="mt-6 bg-white rounded-full border px-6 py-3 shadow-sm flex items-center gap-3">
          <span>🔍</span>
          <input 
            className="w-full outline-none bg-transparent" 
            placeholder="Cari destinasi..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Kategori Filter */}
        <div className="mt-4 flex flex-wrap gap-2">
          {["Wisata Alam", "Wisata Pendidikan"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveKategori(activeKategori === cat.toLowerCase() ? null : cat.toLowerCase())}
              className={`px-4 py-2 rounded-full border text-sm transition ${activeKategori === cat.toLowerCase() ? "bg-[#001845] text-white" : "bg-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tag Filter */}
        <div className="mt-3 flex flex-wrap gap-2">
          {allTagFilters.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition ${activeTag === tag ? "bg-[#001845] text-white" : "bg-white"}`}
            >
              {tagConfig[tag]?.icon} {tagConfig[tag]?.label}
            </button>
          ))}
        </div>

        {/* Grid List - Perbaikan agar Responsif Mobile */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWisata.map((w) => (
            <Link key={w.id} to={`/wisata/${w.id}`}>
              <article className="bg-white rounded-[32px] shadow-lg overflow-hidden hover:-translate-y-2 transition duration-300">
                <img src={w.imageUrl} className="w-full h-52 object-cover" alt={w.name} />
                <div className="p-6">
                  <h2 className="text-xl font-bold text-[#001845]">{w.name}</h2>
                  <div className="mt-3 text-sm text-slate-500 space-y-1">
                    <p>📍 {w.address.substring(0, 40)}...</p>
                    <p>💸 {w.priceRange}</p>
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {w.tags.map(t => tagConfig[t] && (
                      <span key={t} className="p-2 bg-slate-100 rounded-full text-slate-600">{tagConfig[t].icon}</span>
                    ))}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
        
        {!loading && filteredWisata.length === 0 && (
          <p className="text-center mt-10 text-slate-400 italic">Destinasi tidak ditemukan...</p>
        )}
      </div>
    </section>
  );
};

export default WisataPage;
