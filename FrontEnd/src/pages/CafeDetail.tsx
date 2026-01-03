// src/pages/CafeDetail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiWifi,
  FiWind,
  FiZap,
  FiCamera,
  FiCoffee
} from "react-icons/fi";

const CafeDetail: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>(); // slug berisi Unique ID (contoh: CAFE-5 atau KUL-30)
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    if (!slug) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        
        // Memecah Unique ID menjadi Prefix dan ID Database asli
        const parts = slug.split("-");
        if (parts.length < 2) {
            setLoading(false);
            return;
        }
        
        const prefix = parts[0]; // "CAFE" atau "KUL"
        const id = parts[1];     // ID asli (integer)
        
        // Menentukan endpoint berdasarkan prefix
        const endpoint = prefix === "KUL" ? "get_kuliner" : "tempat_nongkrong";

        const response = await fetch(`${API_BASE}/${endpoint}`);
        const list = await response.json();
        
        // Mencari data yang ID-nya cocok
        const found = list.find((item: any) => String(item.id) === String(id));
        setData(found);
      } catch (e) {
        console.error("Error fetching detail:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug, API_BASE]);

  // Fungsi Helper untuk membuka Google Maps
  const handleOpenMaps = () => {
    if (data?.alamat) {
      const query = encodeURIComponent(`${data.nama_tempat} ${data.alamat}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400 font-medium">Memuat rincian kuliner...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm max-w-sm w-full border border-slate-100">
          <p className="text-red-500 font-bold mb-2">Data Tidak Ditemukan</p>
          <p className="text-slate-500 text-sm mb-6">Maaf, rincian tempat kuliner atau cafe tidak tersedia di database kami.</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-black transition"
          >
            Kembali ke Daftar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 md:py-10">
      <div className="mx-auto w-full max-w-5xl">
        {/* Tombol kembali */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          <FiArrowLeft />
          <span>Kembali</span>
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* BAGIAN KIRI - INFO UTAMA */}
          <section className="overflow-hidden rounded-[40px] bg-white shadow-xl border border-slate-100">
            {/* Foto Hero */}
            <div className="h-[300px] md:h-[400px] overflow-hidden relative">
              <img
                src={data.link_foto !== "-" ? data.link_foto : "https://placehold.co/1000x600?text=Cafe+Purwokerto"}
                alt={data.nama_tempat}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-6 left-6">
                <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-600 shadow-sm">
                  {data.kategori}
                </span>
              </div>
            </div>

            <div className="p-8 md:p-10 space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 font-playfair leading-tight">
                  {data.nama_tempat}
                </h1>
                <p className="mt-4 text-slate-600 leading-relaxed italic">
                  {data.deskripsi && data.deskripsi !== "-" 
                    ? data.deskripsi 
                    : "Nikmati suasana santai dengan hidangan berkualitas di salah satu tempat favorit Purwokerto ini."}
                </p>
              </div>

              <div className="grid gap-4 border-t border-slate-100 pt-6">
                <div className="flex gap-4 items-start">
                   <div className="p-2.5 bg-red-50 text-red-500 rounded-xl"><FiMapPin size={18}/></div>
                   <div>
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Lokasi & Alamat</h4>
                     <p className="text-sm text-slate-700 mt-0.5">{data.alamat}</p>
                   </div>
                </div>

                <div className="flex gap-4 items-start">
                   <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl"><FiClock size={18}/></div>
                   <div>
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Jam Operasional</h4>
                     <p className="text-sm text-slate-700 mt-0.5">{data.jam_buka} - {data.jam_tutup}</p>
                   </div>
                </div>

                <div className="flex gap-4 items-start">
                   <div className="p-2.5 bg-green-50 text-green-500 rounded-xl"><FiDollarSign size={18}/></div>
                   <div>
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Estimasi Budget</h4>
                     <p className="text-sm text-slate-700 mt-0.5">Mulai dari Rp {(data.htm || 0).toLocaleString('id-ID')}</p>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* BAGIAN KANAN - FASILITAS & PETA */}
          <aside className="space-y-6">
            <section className="bg-white p-8 rounded-[40px] shadow-lg border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <FiCoffee className="text-amber-500"/> Fasilitas & Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(data.tags) && data.tags.length > 0 ? (
                  data.tags.map((tag: string) => (
                    <span 
                      key={tag} 
                      className="px-4 py-2 bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Informasi fasilitas segera diperbarui.</p>
                )}
              </div>
            </section>

            <section className="bg-[#001845] p-8 rounded-[40px] shadow-lg text-white">
              <h3 className="text-lg font-bold mb-2">Siap untuk berkunjung?</h3>
              <p className="text-blue-200 text-xs mb-6 leading-relaxed">
                Gunakan navigasi Google Maps untuk memudahkan perjalanan kamu menuju lokasi.
              </p>
              <button
                onClick={handleOpenMaps}
                className="w-full bg-white text-[#001845] py-4 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all shadow-md shadow-black/20"
              >
                Buka di Google Maps
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CafeDetail;
