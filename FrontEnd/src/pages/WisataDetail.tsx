// src/pages/WisataDetail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiMapPin, FiClock, FiDollarSign } from "react-icons/fi";

const WisataDetail: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams(); // Contoh: "ALAM-10"
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    if (!slug) return;
    const [prefix, id] = slug.split("-");
    const endpoint = prefix === "EDU" ? "wisata_pendidikan" : "wisata_alam";

    fetch(`${API_BASE}/${endpoint}`)
      .then(res => res.json())
      .then(list => {
        const found = list.find((item: any) => String(item.id) === String(id));
        setData(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, API_BASE]);

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!data) return <div className="p-20 text-center"><button onClick={() => navigate(-1)}>Kembali</button><p>Data tidak ditemukan.</p></div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
       <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2"><FiArrowLeft/> Kembali</button>
       <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <img src={data.link_foto !== "-" ? data.link_foto : "https://placehold.co/800x450"} className="w-full h-80 object-cover" />
          <div className="p-8">
             <h1 className="text-3xl font-bold">{data.nama_tempat}</h1>
             <p className="text-blue-600 font-bold uppercase text-sm mt-2">{data.kategori}</p>
             <div className="mt-6 space-y-4">
                <p className="flex items-center gap-2"><FiMapPin/> {data.alamat}</p>
                <p className="flex items-center gap-2"><FiClock/> {data.jam_buka} - {data.jam_tutup}</p>
                <p className="flex items-center gap-2"><FiDollarSign/> Rp {(data.htm || 0).toLocaleString()}</p>
             </div>
             <p className="mt-6 text-slate-600 italic">{data.deskripsi}</p>
          </div>
       </div>
    </div>
  );
};

export default WisataDetail;
