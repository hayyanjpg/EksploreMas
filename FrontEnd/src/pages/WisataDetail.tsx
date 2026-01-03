// src/pages/WisataDetail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiMapPin, FiClock, FiDollarSign } from "react-icons/fi";

const WisataDetail: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>(); // 'slug' di sini adalah ID dari URL
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // Coba cari di kedua endpoint
        const [resAlam, resPend] = await Promise.all([
          fetch(`${API_BASE}/wisata_alam`),
          fetch(`${API_BASE}/wisata_pendidikan`)
        ]);
        const allData = [...(await resAlam.json()), ...(await resPend.json())];
        // Cari data yang ID-nya cocok dengan parameter URL
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

  if (loading) return <div className="p-20 text-center italic">Memuat detail destinasi...</div>;

  if (!data) return (
    <div className="p-20 text-center">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 mx-auto bg-slate-100 px-4 py-2 rounded-full"><FiArrowLeft/> Kembali</button>
      <p className="text-red-500 font-bold">Destinasi wisata tidak ditemukan.</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm hover:bg-slate-100 transition"><FiArrowLeft/> Kembali</button>
        
        <div className="bg-white rounded-[40px] shadow-xl overflow-hidden">
          <img src={data.link_foto || "https://placehold.co/800x450"} className="w-full h-[400px] object-cover" alt={data.nama_tempat} />
          <div className="p-8 md:p-12">
            <h1 className="text-3xl font-bold text-slate-900">{data.nama_tempat}</h1>
            <p className="mt-4 text-slate-600 leading-relaxed text-lg">{data.deskripsi || "Destinasi wisata unggulan di Banyumas yang menawarkan pengalaman tak terlupakan."}</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-8">
              <div className="flex gap-4 items-start">
                <FiMapPin className="text-blue-500 text-xl mt-1" />
                <div><h4 className="font-bold">Lokasi</h4><p className="text-slate-500 text-sm">{data.alamat}</p></div>
              </div>
              <div className="flex gap-4 items-start">
                <FiClock className="text-green-500 text-xl mt-1" />
                <div><h4 className="font-bold">Jam Operasional</h4><p className="text-slate-500 text-sm">{data.jam_buka} - {data.jam_tutup}</p></div>
              </div>
              <div className="flex gap-4 items-start">
                <FiDollarSign className="text-amber-500 text-xl mt-1" />
                <div><h4 className="font-bold">Harga Tiket</h4><p className="text-slate-500 text-sm">{data.htm > 0 ? `Rp ${data.htm.toLocaleString('id-ID')}` : "Gratis"}</p></div>
              </div>
            </div>

            <button 
              onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(data.nama_tempat + " " + data.alamat)}`, "_blank")}
              className="mt-10 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition"
            >
              Buka di Google Maps
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default WisataDetail;
