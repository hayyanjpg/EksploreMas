// src/pages/CafeDetail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiMapPin, FiClock, FiDollarSign } from "react-icons/fi";

const CafeDetail: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const [resCafe, resKuliner] = await Promise.all([
          fetch(`${API_BASE}/tempat_nongkrong`),
          fetch(`${API_BASE}/get_kuliner`)
        ]);
        const allData = [...(await resCafe.json()), ...(await resKuliner.json())];
        const found = allData.find(item => String(item.id) === String(slug));
        setData(found);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug, API_BASE]);

  if (loading) return <div className="p-20 text-center italic">Memuat data kuliner...</div>;
  if (!data) return (
    <div className="p-20 text-center">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 mx-auto bg-slate-100 px-4 py-2 rounded-full"><FiArrowLeft/> Kembali</button>
      <p className="text-red-500 font-bold">Data kuliner/cafe tidak ditemukan.</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm hover:bg-slate-100 transition"><FiArrowLeft/> Kembali</button>
        <div className="bg-white rounded-[40px] shadow-xl overflow-hidden">
          <img src={data.link_foto || "https://placehold.co/800x450?text=Kuliner"} className="w-full h-[400px] object-cover" alt={data.nama_tempat} />
          <div className="p-8 md:p-12">
            <h1 className="text-3xl font-bold text-slate-900">{data.nama_tempat}</h1>
            <div className="mt-2 inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase">{data.kategori}</div>
            <p className="mt-4 text-slate-600 leading-relaxed text-lg">{data.deskripsi || "Nikmati hidangan lezat dan suasana nyaman di tempat kuliner favorit Purwokerto ini."}</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-8">
              <div className="flex gap-4 items-start">
                <FiMapPin className="text-red-500 text-xl mt-1" />
                <div><h4 className="font-bold">Alamat</h4><p className="text-slate-500 text-sm">{data.alamat}</p></div>
              </div>
              <div className="flex gap-4 items-start">
                <FiClock className="text-blue-500 text-xl mt-1" />
                <div><h4 className="font-bold">Jam Buka</h4><p className="text-slate-500 text-sm">{data.jam_buka || "09:00"} - {data.jam_tutup || "22:00"}</p></div>
              </div>
              <div className="flex gap-4 items-start">
                <FiDollarSign className="text-green-500 text-xl mt-1" />
                <div><h4 className="font-bold">Estimasi Harga</h4><p className="text-slate-500 text-sm">Rp {data.htm?.toLocaleString('id-ID') || "20.000"}</p></div>
              </div>
            </div>

            <button 
              onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(data.nama_tempat + " " + data.alamat)}`, "_blank")}
              className="mt-10 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition"
            >
              Lihat Lokasi di Maps
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CafeDetail;
