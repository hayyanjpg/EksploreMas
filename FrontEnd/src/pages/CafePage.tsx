// src/pages/CafePage.tsx
import React, { useEffect, useMemo, useRef, useState, MouseEvent } from "react";
import { Link } from "react-router-dom";

// React Icons
import { FiWifi } from "react-icons/fi";
import { PiPlugBold } from "react-icons/pi";
import { TbAirConditioning } from "react-icons/tb";
import { MdAccessTimeFilled } from "react-icons/md";
import { FaParking, FaBookOpen } from "react-icons/fa";

// Sesuaikan Facility dengan label yang ada di database dump kamu
type Facility = string;

type ApiItem = Record<string, any>;

type CafeUI = {
  uniqueId: string; // Menggunakan Prefix (KUL- atau CAFE-)
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

// === LABEL & ICON SINKRON DENGAN DB ===
const facilityLabel: Record<string, string> = {
  "Wifi Gratis": "Wifi Gratis",
  "wifi": "Wifi Gratis",
  "Colokan": "Colokan",
  "socket": "Colokan",
  "AC": "AC",
  "ac": "AC",
  "24 Jam": "24 Jam",
  "24h": "24 Jam",
  "Area Parkir Luas": "Parkir",
  "parking": "Parkir",
  "Nugas Friendly": "Nugas Friendly",
  "studyFriendly": "Nugas Friendly",
};

const facilityIcon: Record<string, React.ReactNode> = {
  "Wifi Gratis": <FiWifi />,
  "wifi": <FiWifi />,
  "Colokan": <PiPlugBold />,
  "socket": <PiPlugBold />,
  "AC": <TbAirConditioning />,
  "ac": <TbAirConditioning />,
  "24 Jam": <MdAccessTimeFilled />,
  "24h": <MdAccessTimeFilled />,
  "Area Parkir Luas": <FaParking />,
  "parking": <FaParking />,
  "Nugas Friendly": <FaBookOpen />,
  "studyFriendly": <FaBookOpen />,
};

// List filter untuk UI
const allFacilityFilters = ["Wifi Gratis", "24 Jam", "Colokan", "AC", "Area Parkir Luas", "Nugas Friendly"];

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

const CafePage: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeKategori, setActiveKategori] = useState<string | null>(null);

  const [cafes, setCafes] = useState<CafeUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // === FETCH & MAPPING ===
  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        setLoading(true);
        const [resNongkrong, resKuliner] = await Promise.all([
          fetch(`${API_BASE}/tempat_nongkrong`),
          fetch(`${API_BASE}/get_kuliner`),
        ]);

        const dataNongkrong = await resNongkrong.json();
        const dataKuliner = await resKuliner.json();

        // MAPPING DENGAN PREFIX UNTUK MENCEGAH ID COLLISION
        const mappedNongkrong = dataNongkrong.map((raw: any, idx: number) => ({
          ...mapToUI(raw, idx, "CAFE"),
          uniqueId: `CAFE-${raw.id}`,
        }));

        const mappedKuliner = dataKuliner.map((raw: any, idx: number) => ({
          ...mapToUI(raw, idx, "KUL"),
          uniqueId: `KUL-${raw.id}`,
        }));

        if (!alive) return;
        setCafes([...mappedNongkrong, ...mappedKuliner]);
      } catch (e: any) {
        if (alive) setError("Gagal mengambil data dari database.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => { alive = false; };
  }, []);

  const mapToUI = (raw: any, idx: number, prefix: string): Omit<CafeUI, "uniqueId"> => {
    const kategori = pickString(raw, ["kategori"], prefix === "CAFE" ? "tempat nongkrong" : "kuliner");
    return {
      id: String(raw.id),
      name: pickString(raw, ["nama_tempat", "name"]),
      description: raw.deskripsi && raw.deskripsi !== "-" ? raw.deskripsi : `Nikmati suasana terbaik di ${raw.nama_tempat}`,
      imageUrl: raw.link_foto,
      address: raw.alamat,
      detailInfo: `${raw.jam_buka} - ${raw.jam_tutup}`,
      priceRange: formatRupiah(raw.htm),
      facilities: Array.isArray(raw.tags) ? raw.tags : [],
      kategori: kategori.toLowerCase(),
    };
  };

  // === FILTER LOGIC ===
  const filteredCafes = useMemo(() => {
    return cafes.filter((cafe) => {
      const matchSearch = cafe.name.toLowerCase().includes(search.toLowerCase());
      const matchKategori = !activeKategori || cafe.kategori === activeKategori.toLowerCase();
      
      // Multi Filter Fasilitas (Mendukung alias tag di database)
      const matchFilter = activeFilters.length === 0 || activeFilters.every(filter => {
        return cafe.facilities.some(tag => {
            const normalizedTag = tag.toLowerCase();
            const normalizedFilter = filter.toLowerCase();
            // Cek kesamaan langsung atau via mapping label
            return normalizedTag === normalizedFilter || 
                   (normalizedFilter === "wifi gratis" && normalizedTag === "wifi") ||
                   (normalizedFilter === "area parkir luas" && normalizedTag === "parking") ||
                   (normalizedFilter === "24 jam" && normalizedTag === "24h");
        });
      });

      return matchSearch && matchKategori && matchFilter;
    });
  }, [cafes, search, activeKategori, activeFilters]);

  const toggleFilter = (f: string) => {
    setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  return (
    <div className="flex justify-center px-4 py-10 md:py-16 bg-slate-50 min-h-screen">
      <div className="w-full max-w-6xl">
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#001845]">Cafe & Culinary</h1>
        <p className="mt-2 text-slate-600">Discover the best spots in Purwokerto</p>

        {/* SEARCH */}
        <div className="mt-6 w-full rounded-full border border-slate-200 bg-white px-6 py-3 flex items-center gap-3 shadow-sm">
          <span>🔍</span>
          <input 
            className="flex-1 outline-none text-slate-700" 
            placeholder="Cari nama tempat..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        {/* KATEGORI */}
        <div className="mt-4 flex flex-wrap gap-2">
          {["Tempat Nongkrong", "Kuliner"].map(cat => (
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
          {allFacilityFilters.map(f => (
            <button
              key={f}
              onClick={() => toggleFilter(f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition ${activeFilters.includes(f) ? "bg-[#001845] text-white" : "bg-white text-slate-600"}`}
            >
              {facilityIcon[f]} {f}
            </button>
          ))}
        </div>

        {loading && <p className="mt-10 text-center text-slate-400 animate-pulse">Memuat data...</p>}

        {/* LIST GRID (Perbaikan Layout Mobile agar tidak bertumpuk) */}
        {!loading && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCafes.map((cafe) => (
              <Link key={cafe.uniqueId} to={`/cafes/${cafe.uniqueId}`} className="group">
                <article className="bg-white rounded-[32px] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-slate-100">
                  <div className="h-60 overflow-hidden">
                    <img 
                        src={cafe.imageUrl || "https://placehold.co/800x600?text=Cafe"} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        alt={cafe.name} 
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">{cafe.kategori}</span>
                    <h2 className="font-playfair text-xl font-bold text-[#001845]">{cafe.name}</h2>
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">{cafe.description}</p>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-1">
                      <p>📍 {cafe.address}</p>
                      <p>🕒 {cafe.detailInfo}</p>
                    </div>

                    <div className="mt-6 flex gap-2 flex-wrap">
                      {cafe.facilities.map(f => facilityIcon[f] && (
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
        )}
      </div>
    </div>
  );
};

export default CafePage;
