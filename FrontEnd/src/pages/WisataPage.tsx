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
  
  // STATE BARU: Limit item
  const [visibleLimit, setVisibleLimit] = useState<number>(9);

  const [wisatas, setWisatas] = useState<WisataUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        const mapToUI = (raw: any, idx: number, prefix: string): Omit<WisataUI, "uniqueId"> => {
            const kategori = pickString(raw, ["kategori"], prefix === "ALAM" ? "wisata alam" : "wisata pendidikan");
            return {
              id: String(raw.id),
              name: pickString(raw, ["nama_tempat", "name"]),
              description: raw.deskripsi && raw.deskripsi !== "-" ? raw.deskripsi : `Jelajahi keindahan destinasi ${raw.nama_tempat}`,
              imageUrl: raw.link_foto,
              address: raw.alamat,
              detailInfo: `${raw.jam_buka} - ${raw.jam_tutup}`,
              priceRange: formatRupiah(raw.htm),
              facilities: Array.isArray(raw.tags) ? raw.tags : [],
              kategori: kategori.toLowerCase(),
            };
        };

        const mappedAlam = dataAlam.map((raw: any, idx: number) => ({
          ...mapToUI(raw, idx, "ALAM"),
          uniqueId: `ALAM-${raw.id}`,
        }));

        const mappedEdu = dataEdu.map((raw: any, idx: number) => ({
          ...mapToUI(raw, idx, "EDU"),
          uniqueId: `EDU-${raw.id}`,
        }));

        if (!alive) return;
        setWisatas([...mappedAlam, ...mappedEdu]);
      } catch (e: any) {
        if (alive) setError("Gagal mengambil data wisata.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => { alive = false; };
  }, []);

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

  // Reset limit saat filter berubah
  useEffect(() => {
    setVisibleLimit(9);
  }, [search, activeKategori, activeFilters]);

  return (
    <div className="flex justify-center px-4 py-10 md:py-16 bg-slate-50 min-h-screen">
      <div className="w-full max-w-6xl">
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#001845]">Nature & Tourism</h1>
        <p className="mt-2 text-slate-600">Discover the breathtaking landscapes of Purwokerto</p>

        {/* SEARCH */}
        <div className="mt-6 w-full rounded-full border border-slate-200 bg-white px-6 py-3 flex items-center gap-3 shadow-sm">
          <span>🔍</span>
          <input 
            className="flex-1 outline-none text-slate-700" 
            placeholder="Cari tempat wisata..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        {/* KATEGORI */}
        <div className="mt-4 flex flex-wrap gap-2">
          {["Wisata Alam", "Wisata Pendidikan"].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveKategori(activeKategori === cat ? null : cat)}
              className={`px-4 py-2 rounded-full border text-sm transition ${activeKategori === cat ? "bg-[#001845] text-white" : "bg-white text-slate-600"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FASILITAS */}
        <div className="mt-3 flex flex-wrap gap-2">
          {allWisataFilters.map(f => (
            <button
              key={f}
              onClick={() => toggleFilter(f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition ${activeFilters.includes(f) ? "bg-[#001845] text-white" : "bg-white text-slate-600"}`}
            >
              {facilityIcon[f]} {facilityLabel[f] || f}
            </button>
          ))}
        </div>

        {loading && <p className="mt-10 text-center text-slate-400 animate-pulse">Memuat destinasi wisata...</p>}
        {error && <p className="mt-10 text-center text-red-500">{error}</p>}

        {/* LIST GRID */}
        {!loading && (
          <div className="mt-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* SLICE DATA */}
              {filteredWisatas.slice(0, visibleLimit).map((w) => (
                <Link key={w.uniqueId} to={`/wisata/${w.uniqueId}`} className="group">
                  <article className="bg-white rounded-[32px] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-slate-100">
                    <div className="h-60 overflow-hidden">
                      <img 
                          src={w.imageUrl || "https://placehold.co/800x600?text=Wisata"} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          alt={w.name} 
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">{w.kategori}</span>
                      <h2 className="font-playfair text-xl font-bold text-[#001845]">{w.name}</h2>
                      <p className="mt-2 text-sm text-slate-500 line-clamp-2">{w.description}</p>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-1">
                        <p>📍 {w.address}</p>
                        <p>🕒 {w.detailInfo}</p>
                        <p>💸 {w.priceRange}</p>
                      </div>

                      <div className="mt-6 flex gap-2 flex-wrap">
                        {w.facilities.map(f => facilityIcon[f] && (
                          <div key={f} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100" title={facilityLabel[f] || f}>
                            {facilityIcon[f]}
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* --- KONTROL LIMIT DISPLAY --- */}
            {filteredWisatas.length > 0 && (
              <div className="mt-12 flex flex-col items-center gap-4 border-t border-slate-200 pt-8">
                 <p className="text-sm text-slate-500">
                    Menampilkan <span className="font-bold text-[#001845]">{Math.min(visibleLimit, filteredWisatas.length)}</span> dari {filteredWisatas.length} destinasi
                 </p>
                 
                 <div className="flex flex-wrap justify-center gap-3">
                    {[9, 18].map((limit) => (
                       <button
                         key={limit}
                         onClick={() => setVisibleLimit(limit)}
                         className={`px-5 py-2 rounded-full text-sm font-medium transition ${
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
                       className={`px-5 py-2 rounded-full text-sm font-medium transition ${
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
                <p className="text-center text-slate-500 mt-10">Data tidak ditemukan.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WisataPage;
