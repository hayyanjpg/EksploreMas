// src/pages/WisataPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaParking, FaLeaf, FaWater, FaCamera, FaWalking } from "react-icons/fa";
import { MdFamilyRestroom } from "react-icons/md";

type Facility = string;
type WisataUI = {
  uniqueId: string;
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  address: string;
  detailInfo: string;
  priceRange: string;
  facilities: Facility[];
  kategori: string;
};

// === CONFIG ===
const facilityLabel: Record<string, string> = {
  "Area Parkir Luas": "Parkir", "parking": "Parkir",
  "Pemandangan Alam": "Alam", "nature": "Alam",
  "Wahana Air": "Air", "water": "Air",
  "Spot Foto/Instagrammable": "Spot Foto", "instagrammable": "Spot Foto",
  "Ramah Keluarga": "Keluarga", "family": "Keluarga",
  "Akses Mudah": "Akses Mudah", "walking": "Akses Mudah",
};

const facilityIcon: Record<string, React.ReactNode> = {
  "Area Parkir Luas": <FaParking />, "parking": <FaParking />,
  "Pemandangan Alam": <FaLeaf />, "nature": <FaLeaf />,
  "Wahana Air": <FaWater />, "water": <FaWater />,
  "Spot Foto/Instagrammable": <FaCamera />, "instagrammable": <FaCamera />,
  "Ramah Keluarga": <MdFamilyRestroom />, "family": <MdFamilyRestroom />,
  "Akses Mudah": <FaWalking />, "walking": <FaWalking />,
};

const allWisataFilters = ["Area Parkir Luas", "Pemandangan Alam", "Wahana Air", "Spot Foto/Instagrammable", "Ramah Keluarga"];

// Helper Functions
const pickString = (obj: Record<string, any>, keys: string[], fallback = "") => {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return fallback;
};

const formatRupiah = (value: any) => {
  if (typeof value === "number") return `Rp ${value.toLocaleString("id-ID")}`;
  const s = String(value ?? "").trim();
  if (!s) return "";
  const n = Number(s);
  if (!Number.isNaN(n)) return `Rp ${n.toLocaleString("id-ID")}`;
  return s;
};

const WisataPage: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeKategori, setActiveKategori] = useState<string | null>(null);

  // SET LIMIT AWAL JADI 9
  const [visibleLimit, setVisibleLimit] = useState<number>(9);

  const [wisatas, setWisatas] = useState<WisataUI[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    let alive = true;
    const run = async () => {
        try {
            setLoading(true);
            const [resAlam, resEdu] = await Promise.all([
            fetch(`${API_BASE}/wisata_alam`),
            fetch(`${API_BASE}/wisata_pendidikan`),
            ]);

            const dataAlam = await resAlam.json();
            const dataEdu = await resEdu.json();

            const mapToUI = (raw: any, prefix: string) => ({
                uniqueId: `${prefix}-${raw.id}`,
                id: String(raw.id),
                name: raw.nama_tempat || raw.name,
                description: raw.deskripsi && raw.deskripsi !== "-" ? raw.deskripsi : `Jelajahi keindahan destinasi ${raw.nama_tempat}`,
                imageUrl: raw.link_foto,
                address: raw.alamat,
                detailInfo: `${raw.jam_buka} - ${raw.jam_tutup}`,
                priceRange: raw.htm ? `Rp ${raw.htm.toLocaleString("id-ID")}` : "Gratis",
                facilities: Array.isArray(raw.tags) ? raw.tags : [],
                kategori: (raw.kategori || "").toLowerCase(),
            });

            const mappedAlam = dataAlam.map((raw: any) => mapToUI(raw, "ALAM"));
            const mappedEdu = dataEdu.map((raw: any) => mapToUI(raw, "EDU"));

            if (!alive) return;
            setWisatas([...mappedAlam, ...mappedEdu]);
        } catch (e) {
            console.error(e);
        } finally {
            if (alive) setLoading(false);
        }
    };
    run();
    return () => { alive = false; };
  }, []);

  // FILTER LOGIC
  const filteredWisatas = useMemo(() => {
    return wisatas.filter((w) => {
      const matchSearch = w.name.toLowerCase().includes(search.toLowerCase());
      const matchKategori = !activeKategori || w.kategori === activeKategori.toLowerCase();
      
      const matchFilter = activeFilters.length === 0 || activeFilters.every(filter => {
        return w.facilities.some(tag => {
            const normalizedTag = tag.toLowerCase();
            const normalizedFilter = filter.toLowerCase();
            return normalizedTag === normalizedFilter || 
                   (normalizedFilter === "area parkir luas" && normalizedTag === "parking") ||
                   (normalizedFilter === "pemandangan alam" && normalizedTag === "nature") ||
                   (normalizedFilter === "wahana air" && normalizedTag === "water") ||
                   (normalizedFilter === "spot foto/instagrammable" && normalizedTag === "instagrammable");
        });
      });
      return matchSearch && matchKategori && matchFilter;
    });
  }, [wisatas, search, activeKategori, activeFilters]);

  const toggleFilter = (f: string) => {
    setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  useEffect(() => {
    setVisibleLimit(9);
  }, [search, activeKategori, activeFilters]);

  return (
    <div className="flex justify-center px-4 py-8 md:py-16 bg-slate-50 min-h-screen">
      <div className="w-full max-w-7xl">
        
        {/* Header Responsive */}
        <div className="text-center md:text-left mb-8">
            <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#001845]">Nature & Tourism</h1>
            <p className="mt-2 text-sm md:text-base text-slate-600">Jelajahi keindahan alam Purwokerto</p>
        </div>

        {/* Search Bar */}
        <div className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 md:px-6 md:py-4 flex items-center gap-3 shadow-sm hover:shadow-md transition">
          <span className="text-slate-400">🔍</span>
          <input 
            className="flex-1 outline-none text-slate-700 text-sm md:text-base" 
            placeholder="Cari tempat wisata..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        {/* Filter Container */}
        <div className="mt-6 flex flex-col gap-4">
            {/* Kategori */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {["Wisata Alam", "Wisata Pendidikan"].map(cat => (
                <button
                key={cat}
                onClick={() => setActiveKategori(activeKategori === cat ? null : cat)}
                className={`px-4 py-2 md:px-5 md:py-2.5 rounded-full border text-xs md:text-sm font-medium transition active:scale-95 ${activeKategori === cat ? "bg-[#001845] text-white shadow-lg" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                {cat}
                </button>
            ))}
            </div>

            {/* Fasilitas (Scrollable di HP) */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 md:flex-wrap no-scrollbar">
            {allWisataFilters.map(f => (
                <button
                key={f}
                onClick={() => toggleFilter(f)}
                className={`whitespace-nowrap flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-full border text-[11px] md:text-xs transition active:scale-95 ${activeFilters.includes(f) ? "bg-[#001845] text-white shadow" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                {facilityIcon[f]} {facilityLabel[f] || f}
                </button>
            ))}
            </div>
        </div>

        {loading && <p className="mt-20 text-center text-slate-400 animate-pulse">Memuat destinasi wisata...</p>}

        {/* Content Grid */}
        {!loading && (
          <div className="mt-8 md:mt-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredWisatas.slice(0, visibleLimit).map((w) => (
                <Link key={w.uniqueId} to={`/wisata/${w.uniqueId}`} className="group h-full">
                  <article className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full border border-slate-100">
                    <div className="h-48 md:h-56 overflow-hidden relative">
                      <img 
                          src={w.imageUrl && w.imageUrl !== "-" ? w.imageUrl : "https://placehold.co/800x600?text=No+Image"} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          alt={w.name} 
                          loading="lazy"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-800 shadow-sm">
                          {w.kategori}
                      </div>
                    </div>
                    
                    <div className="p-4 md:p-6 flex flex-col flex-1">
                      <h2 className="font-playfair text-lg md:text-xl font-bold text-[#001845] leading-tight mb-2">{w.name}</h2>
                      <p className="text-xs md:text-sm text-slate-500 line-clamp-2 mb-4">{w.description}</p>
                      
                      <div className="mt-auto pt-4 border-t border-slate-50 text-[11px] md:text-xs text-slate-400 space-y-1.5">
                        <p className="flex items-center gap-1.5">📍 <span className="truncate">{w.address}</span></p>
                        <p className="flex items-center gap-1.5">🕒 {w.detailInfo}</p>
                        <p className="flex items-center gap-1.5">💸 {w.priceRange}</p>
                      </div>

                      <div className="mt-4 flex gap-1.5 flex-wrap">
                        {w.facilities.slice(0, 5).map(f => facilityIcon[f] && (
                          <div key={f} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 text-xs" title={facilityLabel[f] || f}>
                            {facilityIcon[f]}
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {filteredWisatas.length > 0 && (
              <div className="mt-12 flex flex-col items-center gap-4 border-t border-slate-200 pt-8">
                 <p className="text-xs md:text-sm text-slate-500">
                    Menampilkan <span className="font-bold text-[#001845]">{Math.min(visibleLimit, filteredWisatas.length)}</span> dari {filteredWisatas.length} destinasi
                 </p>
                 
                 <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                    {[9, 18, 36].map((limit) => (
                       <button
                         key={limit}
                         onClick={() => setVisibleLimit(limit)}
                         className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium transition active:scale-95 ${
                            visibleLimit === limit 
                            ? "bg-[#001845] text-white shadow-md" 
                            : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                         }`}
                       >
                         {limit}
                       </button>
                    ))}
                    
                    <button
                       onClick={() => setVisibleLimit(filteredWisatas.length)}
                       className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium transition active:scale-95 ${
                          visibleLimit >= filteredWisatas.length
                          ? "bg-[#001845] text-white shadow-md" 
                          : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                       }`}
                    >
                       Tampilkan Semua
                    </button>
                 </div>
              </div>
            )}

            {filteredWisatas.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-slate-400 mb-2">Tidak ada tempat yang cocok.</p>
                    <button onClick={() => {setSearch(""); setActiveKategori(null); setActiveFilters([])}} className="text-[#001845] font-semibold text-sm underline">Reset Filter</button>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WisataPage;
