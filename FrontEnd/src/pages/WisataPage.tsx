// src/pages/WisataPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaParking, FaMoneyBillAlt, FaCamera, FaLeaf, FaWater } from "react-icons/fa";

// === TIPE DATA TAG ===
// Diperbarui agar mendukung string bebas agar tidak error saat mapping database
type WisataTag = string;

// === TIPE DATA UI ===
interface Wisata {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  address: string;
  openingHours: string;
  priceRange: string;
  tags: WisataTag[];
  kategori: "wisata alam" | "wisata pendidikan" | string;
}

type ApiItem = Record<string, any>;

// === LABEL & ICON TAG ===
// Nama kunci (key) di sini HARUS SAMA PERSIS dengan yang dipilih di Admin Dashboard / SQL
const tagConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  "Area Parkir Luas": { label: "Area Parkir Luas", icon: <FaParking /> },
  "Tiket Murah": { label: "Tiket Murah", icon: <FaMoneyBillAlt /> },
  "Spot Foto/Instagrammable": { label: "Spot Foto", icon: <FaCamera /> },
  "Pemandangan Alam": { label: "Pemandangan Alam", icon: <FaLeaf /> },
  "Wahana Air": { label: "Wahana Air", icon: <FaWater /> },
  // Fallback untuk data lama
  parking: { label: "Parkir", icon: <FaParking /> },
  cheap: { label: "Murah", icon: <FaMoneyBillAlt /> },
  instagrammable: { label: "Instagrammable", icon: <FaCamera /> },
  nature: { label: "Alam", icon: <FaLeaf /> },
  waterpark: { label: "Waterpark", icon: <FaWater /> },
};

// Daftar filter yang akan muncul di tombol atas
const allTagFilters = [
  "Area Parkir Luas", 
  "Tiket Murah", 
  "Spot Foto/Instagrammable", 
  "Pemandangan Alam", 
  "Wahana Air"
];

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

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const mapWisata = (raw: ApiItem, idx: number): Wisata => {
  const name = pickString(raw, ["nama_tempat", "name", "nama", "judul", "title"], `Wisata ${idx + 1}`);
  const id = String(raw.id ?? raw.uuid ?? raw.slug ?? raw.nama_tempat ?? slugify(name) ?? idx);

  const rawKategori = pickString(raw, ["kategori"], "wisata alam").toLowerCase();
  
  const jamBuka = pickString(raw, ["jam_buka", "openingHours", "opening_hours", "jam"], "");
  const jamTutup = pickString(raw, ["jam_tutup"], "");
  const openingHours = jamBuka && jamTutup ? `${jamBuka} – ${jamTutup}` : jamBuka || "";

  const description =
    pickString(raw, ["deskripsi", "description", "desc"], "") || `Kategori: ${rawKategori}`;

  const imageUrl = pickString(raw, ["link_foto", "imageUrl", "image", "gambar", "foto"], "");
  const address = pickString(raw, ["alamat", "address", "lokasi"], "");
  const priceRange = formatRupiah(raw?.htm ?? raw?.harga ?? raw?.tiket);

  const tags: WisataTag[] = Array.isArray(raw.tags) ? raw.tags : [];

  return {
    id,
    name,
    description,
    imageUrl,
    address,
    openingHours,
    priceRange,
    tags,
    kategori: rawKategori,
  };
};

const WisataPage: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeKategori, setActiveKategori] = useState<"wisata alam" | "wisata pendidikan" | null>(null);

  const [wisataList, setWisataList] = useState<Wisata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const normalizeToArray = (data: any): ApiItem[] => {
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (data) return [data];
      return [];
    };

    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const [resAlam, resPendidikan] = await Promise.all([
          fetch(`${API_BASE}/wisata_alam`),
          fetch(`${API_BASE}/wisata_pendidikan`),
        ]);

        if (!resAlam.ok || !resPendidikan.ok) throw new Error("Gagal mengambil data dari server");

        const dataAlam = normalizeToArray(await resAlam.json());
        const dataPendidikan = normalizeToArray(await resPendidikan.json());

        const merged = [...dataAlam, ...dataPendidikan].map(mapWisata);

        if (!alive) return;
        setWisataList(merged);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Terjadi kesalahan koneksi.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    run();
    return () => { alive = false; };
  }, [API_BASE]);

  const filteredWisata = useMemo(() => {
    return wisataList.filter((w) => {
      const matchSearch =
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.description.toLowerCase().includes(search.toLowerCase());

      const matchTag = !activeTag || (w.tags && w.tags.includes(activeTag));
      const matchKategori = !activeKategori || w.kategori === activeKategori;

      return matchSearch && matchTag && matchKategori;
    });
  }, [wisataList, search, activeTag, activeKategori]);

  return (
    <section id="wisata" className="bg-pageRadial">
      <div className="flex justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-6xl">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#001845]">
            Nature &amp; Tourism
          </h1>
          <p className="mt-2 text-slate-600">Explore the natural beauty of Purwokerto</p>

          <div className="mt-6 w-full rounded-full border border-slate-300 bg-white px-6 py-3 flex items-center gap-3 shadow-sm">
            <span className="text-lg">🔍</span>
            <input
              type="text"
              placeholder="Cari destinasi favorit kamu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm md:text-base text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveKategori(activeKategori === "wisata alam" ? null : "wisata alam")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm border transition-colors ${
                activeKategori === "wisata alam" ? "bg-[#001845] text-white" : "bg-white text-slate-700"
              }`}
            >
              <FaLeaf className="text-sm" /> Wisata Alam
            </button>
            <button
              onClick={() => setActiveKategori(activeKategori === "wisata pendidikan" ? null : "wisata pendidikan")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm border transition-colors ${
                activeKategori === "wisata pendidikan" ? "bg-[#001845] text-white" : "bg-white text-slate-700"
              }`}
            >
              <FaCamera className="text-sm" /> Wisata Pendidikan
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {allTagFilters.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm border transition-colors ${
                  activeTag === tag ? "bg-[#001845] text-white" : "bg-white text-slate-700"
                }`}
              >
                {/* SAFE CHECK: Render icon hanya jika tag terdaftar */}
                <span className="text-sm">{tagConfig[tag]?.icon}</span>
                <span>{tagConfig[tag]?.label || tag}</span>
              </button>
            ))}
          </div>

          {loading && <p className="mt-6 text-slate-600 text-center">Memuat data wisata...</p>}
          {error && <div className="mt-6 text-red-600 text-center">{error}</div>}

          {!loading && !error && (
            <div className="mt-10 overflow-x-auto no-scrollbar">
              <div className="flex gap-6">
                {filteredWisata.map((w) => (
                  <Link key={w.id} to={`/wisata/${w.id}`} className="block min-w-[260px] sm:min-w-[340px]">
                    <article className="bg-white rounded-[32px] shadow-lg overflow-hidden hover:-translate-y-1 transition h-full">
                      <img
                        src={w.imageUrl || "https://placehold.co/800x600?text=Wisata"}
                        className="w-full h-64 object-cover"
                        alt={w.name}
                      />
                      <div className="px-6 py-5">
                        <h2 className="font-playfair text-xl font-semibold text-[#001845]">{w.name}</h2>
                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{w.description}</p>
                        <div className="mt-4 border-t pt-3 space-y-1 text-xs text-slate-500">
                          <p>📍 {w.address}</p>
                          <p>🕒 {w.openingHours}</p>
                          <p>💸 {w.priceRange}</p>
                        </div>
                        <div className="mt-4 flex gap-2 border-t pt-3 flex-wrap">
                          {/* SAFE CHECK: Mencegah Layar Putih */}
                          {w.tags.map((tag) => {
                            if (!tagConfig[tag]) return null;
                            return (
                              <div key={tag} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center" title={tagConfig[tag].label}>
                                {tagConfig[tag].icon}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WisataPage;
