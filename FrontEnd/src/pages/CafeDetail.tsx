// src/pages/CafeDetail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiMapPin, FiClock, FiDollarSign } from "react-icons/fi";

const CafeDetail: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // Ambil dari kedua endpoint
        const [resCafe, resKuliner] = await Promise.all([
          fetch(`${API_BASE}/tempat_nongkrong`),
          fetch(`${API_BASE}/get_kuliner`)
        ]);
        
        const combined = [...(await resCafe.json()), ...(await resKuliner.json())];
        
        // Cari ID yang cocok
        const found = combined.find((item: any) => String(item.id) === String(slug));
        setData(found);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  if (loading) return <div className="p-20 text-center">Memuat...</div>;
  if (!data) return <div className="p-20 text-center"><button onClick={() => navigate(-1)}>Kembali</button><p>Cafe/Kuliner tidak ditemukan.</p></div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
       <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2"><FiArrowLeft/> Kembali</button>
       <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <img src={data.link_foto} className="w-full h-80 object-cover" />
          <div className="p-8">
             <h1 className="text-3xl font-bold">{data.nama_tempat}</h1>
             <p className="text-amber-600 font-bold uppercase text-sm mt-2">{data.kategori}</p>
             <div className="mt-6 space-y-4">
                <p className="flex items-center gap-2"><FiMapPin/> {data.alamat}</p>
                <p className="flex items-center gap-2"><FiClock/> {data.jam_buka} - {data.jam_tutup}</p>
                <p className="flex items-center gap-2"><FiDollarSign/> Rp {(data.htm || 0).toLocaleString()}</p>
             </div>
          </div>
       </div>
    </div>
  );
};

export default CafeDetail;
