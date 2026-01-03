// src/pages/WisataDetail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiMapPin, FiClock, FiDollarSign, FiTag } from "react-icons/fi";

const WisataDetail: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams(); 
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch(`${API_BASE}/wisata_alam`),
          fetch(`${API_BASE}/wisata_pendidikan`)
        ]);
        const combined = [...(await r1.json()), ...(await r2.json())];
        // Bandingkan ID sebagai String agar kecocokan 100% akurat
        const found = combined.find(i => String(i.id) === String(slug));
        setData(found);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [slug, API_BASE]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse text-slate-400 font-medium">Memuat rincian destinasi...</div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-sm max-w-sm w-full">
        <p className="text-red-500 font-bold mb-4">Destinasi Tidak Ditemukan</p>
        <p className="text-slate-500 text-sm mb-6">Maaf, data wisata dengan ID {slug} tidak ada di database kami.</p>
        <button onClick={() => navigate(-1)} className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-medium">Kembali</button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full shadow-sm hover:shadow-md transition-all text-slate-700 font-medium">
          <FiArrowLeft/> Kembali
        </button>
        
        <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border border-slate-100">
          <div className="h-[400px] relative">
            <img src={data.link_foto || data.pictures || "https://placehold.co/1200x600"} className="w-full h-full object-cover" alt={data.nama_tempat} />
            <div className="absolute top-6 left-6">
               <span className="bg-white/90 backdrop-blur px-4 py-1 rounded-full text-[10px] font-black uppercase text-blue-600 shadow-sm">{data.kategori}</span>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <h1 className="text-4xl font-bold text-slate-900 font-playfair">{data.nama_tempat || data.name}</h1>
            <p className="mt-6 text-slate-600 leading-relaxed text-lg">
               {data.deskripsi || "Destinasi wisata unggulan di Banyumas. Nikmati pengalaman seru bersama teman dan keluarga di tempat yang asri dan penuh edukasi ini."}
            </p>
            
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-10">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FiMapPin size={20}/></div>
                <div><h4 className="font-bold text-slate-800">Lokasi</h4><p className="text-slate-500 text-sm leading-relaxed">{data.alamat}</p></div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><FiClock size={20}/></div>
                <div><h4 className="font-bold text-slate-800">Operasional</h4><p className="text-slate-500 text-sm">{data.jam_buka} - {data.jam_tutup}</p></div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><FiDollarSign size={20}/></div>
                <div><h4 className="font-bold text-slate-800">Tiket Masuk</h4><p className="text-slate-500 text-sm">Rp {(data.htm || 0).toLocaleString('id-ID')}</p></div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><FiTag size={20}/></div>
                <div>
                  <h4 className="font-bold text-slate-800">Fasilitas</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Array.isArray(data.tags) && data.tags.map((t:any) => (
                      <span key={t} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((data.nama_tempat || data.name) + " " + data.alamat)}`, "_blank")}
              className="mt-12 w-full bg-[#001845] text-white py-4 rounded-2xl font-bold hover:bg-black transition-colors shadow-lg shadow-blue-900/10"
            >
              Petunjuk Arah (Google Maps)
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default WisataDetail;
