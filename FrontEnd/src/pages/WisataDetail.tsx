// src/pages/WisataDetail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiMapPin, FiClock, FiDollarSign } from "react-icons/fi";

const WisataDetail: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams(); // ID dari URL
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // Ambil data dari kedua sumber
        const [resAlam, resPend] = await Promise.all([
          fetch(`${API_BASE}/wisata_alam`),
          fetch(`${API_BASE}/wisata_pendidikan`)
        ]);
        const listAlam = await resAlam.json();
        const listPend = await resPend.json();
        
        const combined = [...listAlam, ...listPend];
        
        // PERBAIKAN: Gunakan pembanding yang kuat untuk ID
        const found = combined.find(item => String(item.id) === String(slug));
        setData(found);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug, API_BASE]);

  if (loading) return <div className="p-20 text-center">Memuat informasi...</div>;
  if (!data) return (
    <div className="p-20 text-center">
      <button onClick={() => navigate(-1)} className="mb-4 bg-slate-100 px-4 py-2 rounded-full"><FiArrowLeft/> Kembali</button>
      <p className="text-red-500 font-bold">Data wisata tidak ditemukan di database.</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm"><FiArrowLeft/> Kembali</button>
        <div className="bg-white rounded-[40px] shadow-xl overflow-hidden">
          <img src={data.link_foto || data.pictures} className="w-full h-80 object-cover" alt={data.nama_tempat} />
          <div className="p-8">
            <h1 className="text-3xl font-bold">{data.nama_tempat || data.name}</h1>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">{data.kategori}</span>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-8">
              <div className="flex gap-4 items-start">
                <FiMapPin className="text-blue-500 mt-1" />
                <div><h4 className="font-bold">Lokasi</h4><p className="text-slate-500 text-sm">{data.alamat}</p></div>
              </div>
              <div className="flex gap-4 items-start">
                <FiClock className="text-green-500 mt-1" />
                <div><h4 className="font-bold">Waktu</h4><p className="text-slate-500 text-sm">{data.jam_buka} - {data.jam_tutup}</p></div>
              </div>
              <div className="flex gap-4 items-start">
                <FiDollarSign className="text-amber-500 mt-1" />
                <div><h4 className="font-bold">Tiket</h4><p className="text-slate-500 text-sm">Rp {(data.htm || 0).toLocaleString('id-ID')}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default WisataDetail;
