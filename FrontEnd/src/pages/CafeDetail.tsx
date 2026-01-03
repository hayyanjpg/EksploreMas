// src/pages/CafeDetail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiMapPin, FiClock, FiDollarSign, FiCoffee } from "react-icons/fi";

const CafeDetail: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch(`${API_BASE}/tempat_nongkrong`),
          fetch(`${API_BASE}/get_kuliner`)
        ]);
        const combined = [...(await r1.json()), ...(await r2.json())];
        const found = combined.find(i => String(i.id) === String(slug));
        setData(found);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [slug, API_BASE]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse">Loading kuliner...</div></div>;
  
  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
       <button onClick={() => navigate(-1)} className="mb-4 bg-slate-200 px-6 py-2 rounded-full text-sm">Kembali</button>
       <p className="text-slate-400">Kuliner tidak ditemukan di database.</p>
    </div>
  );

  return (
     <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-4xl mx-auto">
           <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full shadow-sm text-slate-700 font-medium">
              <FiArrowLeft/> Kembali
           </button>
           
           <div className="bg-white rounded-[40px] shadow-xl overflow-hidden">
              <img src={data.link_foto || "https://placehold.co/1000x500?text=Kuliner"} className="w-full h-[350px] object-cover" alt={data.nama_tempat} />
              <div className="p-8 md:p-12">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FiCoffee size={20}/></div>
                    <span className="text-xs font-black uppercase tracking-widest text-amber-600">{data.kategori}</span>
                 </div>
                 <h1 className="text-4xl font-bold text-slate-900 font-playfair">{data.nama_tempat}</h1>
                 <p className="mt-6 text-slate-600 leading-relaxed text-lg">
                    {data.deskripsi && data.deskripsi !== "-" ? data.deskripsi : "Nikmati hidangan lezat dan suasana yang nyaman di Purwokerto. Cocok untuk bersantai bersama teman atau keluarga."}
                 </p>
                 
                 <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-100 pt-10">
                    <div className="flex flex-col gap-2">
                       <span className="text-slate-400 text-xs font-bold uppercase">Lokasi</span>
                       <p className="text-slate-700 text-sm flex items-start gap-2"><FiMapPin className="text-red-500 mt-1"/> {data.alamat}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                       <span className="text-slate-400 text-xs font-bold uppercase">Jam Buka</span>
                       <p className="text-slate-700 text-sm flex items-start gap-2"><FiClock className="text-blue-500 mt-1"/> {data.jam_buka} - {data.jam_tutup}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                       <span className="text-slate-400 text-xs font-bold uppercase">Estimasi Harga</span>
                       <p className="text-slate-700 text-sm flex items-start gap-2"><FiDollarSign className="text-green-500 mt-1"/> Rp {(data.htm || 0).toLocaleString('id-ID')}</p>
                    </div>
                 </div>

                 <button 
                   onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.nama_tempat + " " + data.alamat)}`, "_blank")}
                   className="mt-12 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all"
                 >
                   Buka Google Maps
                 </button>
              </div>
           </div>
        </div>
     </div>
  );
};

export default CafeDetail;
