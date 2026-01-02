// src/pages/AdminDashboard.tsx
console.log("Admin Dashboard Loaded - Versi Baru");
import { useMemo, useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { 
  MapPin, Coffee, Mountain, Star, PlusCircle, Image as ImageIcon, 
  Search, LogOut, Trash2, Pencil, XCircle, FileText, Newspaper, CheckSquare
} from "lucide-react";

import InfoCard from "../components/ui/InfoCard";
import ChatbotAdminPanel from "../components/chatbot/ChatbotAdminPanel";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"; 

// === KONFIGURASI TAGS / FASILITAS ===
const CAFE_TAGS = ["wifi", "socket", "ac", "24h", "parking", "studyFriendly"];
const WISATA_TAGS = ["parking", "cheap", "instagrammable", "nature", "waterpark"];

// Label biar lebih cantik di UI
const TAG_LABELS: Record<string, string> = {
  wifi: "Wifi Gratis", socket: "Banyak Colokan", ac: "Ber-AC", "24h": "Buka 24 Jam",
  parking: "Area Parkir Luas", studyFriendly: "Nugas Friendly",
  cheap: "Tiket Murah", instagrammable: "Spot Foto/Instagrammable",
  nature: "Pemandangan Alam", waterpark: "Wahana Air"
};

type AdminPlace = {
  id: number;
  name: string;
  category: string;
  address: string;
  imageUrl?: string;
  price?: number;
};

type PlaceForm = {
  name: string;
  category: string;
  address: string;
  imageUrl: string;
  price: string;
  tags: string[]; // State untuk menyimpan tags
};

type NewsItem = {
  id: number;
  title: string;
  category: string;
  date: string;
  image_url: string;
  content: string;
  read_minutes: number;
};

type NewsForm = {
  title: string;
  category: string;
  date: string;
  image_url: string;
  content: string;
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  // === 🛡️ SECURITY CHECK ===
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/loginadmin", { replace: true });
    }
  }, [navigate]);
  
  // TABS STATE
  const [activeTab, setActiveTab] = useState<"places" | "news">("places");

  // DATA STATE
  const [places, setPlaces] = useState<AdminPlace[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // PLACE FORM STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Initial State
  const [placeForm, setPlaceForm] = useState<PlaceForm>({
    name: "", category: "", address: "", imageUrl: "", price: "0", tags: []
  });

  // NEWS FORM STATE
  const [newsForm, setNewsForm] = useState<NewsForm>({
    title: "", category: "", date: "", image_url: "", content: ""
  });

  // --- 1. FETCH ALL DATA ---
  const fetchData = async () => {
    try {
      // Fetch Places
      const [resWisata, resPendidikan, resCafe, resKuliner] = await Promise.all([
        fetch(`${API_BASE}/wisata_alam`),
        fetch(`${API_BASE}/wisata_pendidikan`),
        fetch(`${API_BASE}/tempat_nongkrong`),
        fetch(`${API_BASE}/get_kuliner`)
      ]);
      
      const mergedPlaces = [
        ...(resWisata.ok ? await resWisata.json() : []).map((i:any) => ({ id: i.id, name: i.nama_tempat, category: "Wisata Alam", address: i.alamat, imageUrl: i.link_foto, price: i.htm })),
        ...(resPendidikan.ok ? await resPendidikan.json() : []).map((i:any) => ({ id: i.id, name: i.nama_tempat, category: "Wisata Pendidikan", address: i.alamat, imageUrl: i.link_foto, price: i.htm })),
        ...(resCafe.ok ? await resCafe.json() : []).map((i:any) => ({ id: i.id, name: i.nama_tempat, category: "Cafe", address: i.alamat, imageUrl: i.link_foto, price: i.htm })),
        ...(resKuliner.ok ? await resKuliner.json() : []).map((i:any) => ({ id: i.id, name: i.nama_tempat, category: "Kuliner", address: i.alamat, imageUrl: i.link_foto, price: i.htm })),
      ];
      setPlaces(mergedPlaces);

      const resNews = await fetch(`${API_BASE}/api/news`);
      if (resNews.ok) setNewsList(await resNews.json());

    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [successMsg]); 

  // --- HANDLERS FOR PLACES ---
  const handlePlaceChange = (field: keyof PlaceForm, value: string) => {
    setPlaceForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handler Khusus Checkbox Tags
  const handleTagToggle = (tag: string) => {
    setPlaceForm(prev => {
      const currentTags = prev.tags || [];
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter(t => t !== tag) };
      } else {
        return { ...prev, tags: [...currentTags, tag] };
      }
    });
  };

  const handlePlaceSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setSuccessMsg(""); setIsLoading(true);

    try {
      let endpoint = "";
      let method = isEditing ? "PUT" : "POST";
      let payload: any = {};

      const htmVal = parseInt(placeForm.price)||0;

      // === LOGIC PENYIMPANAN DATA ===
      if (placeForm.category === "Wisata Alam") {
        endpoint = isEditing ? `${API_BASE}/api/update_wisata/${editId}` : `${API_BASE}/api/add_wisata`;
        payload = { 
          name: placeForm.name, 
          category: "wisata alam", 
          address: placeForm.address, 
          open: "08:00", close: "17:00", htm: htmVal, 
          gmaps: "-", pictures: placeForm.imageUrl,
          tags: placeForm.tags // <-- MENGIRIM TAGS
        };
      
      } else if (placeForm.category === "Wisata Pendidikan") {
        endpoint = `${API_BASE}/add_wisata_pendidikan`; 
        payload = { 
          name: placeForm.name, 
          category: "wisata pendidikan", 
          address: placeForm.address, 
          open: "08:00", close: "16:00", htm: htmVal, 
          gmaps: "-", pictures: placeForm.imageUrl,
          tags: placeForm.tags // <-- MENGIRIM TAGS
        };

      } else if (placeForm.category === "Cafe") {
        endpoint = isEditing ? `${API_BASE}/api/update_cafe/${editId}` : `${API_BASE}/api/add_tempat_nongkrong`;
        payload = { 
          nama_tempat: placeForm.name, 
          kategori: "tempat nongkrong", 
          alamat: placeForm.address, 
          jam_buka: "10:00", jam_tutup: "22:00", htm: htmVal, 
          link_gmaps: "-", link_foto: placeForm.imageUrl, deskripsi: "-",
          tags: placeForm.tags // <-- MENGIRIM TAGS
        };
      
      } else if (placeForm.category === "Kuliner") {
        endpoint = isEditing ? `${API_BASE}/api/update_kuliner/${editId}` : `${API_BASE}/api/add_kuliner`;
        payload = { 
          nama_tempat: placeForm.name, 
          kategori: "kuliner", 
          alamat: placeForm.address, 
          htm: htmVal, 
          link_gmaps: "-", link_foto: placeForm.imageUrl, deskripsi: "-",
          tags: placeForm.tags // <-- MENGIRIM TAGS
        };
      } else { 
        throw new Error("Kategori wajib dipilih"); 
      }

      const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Gagal menyimpan tempat. Cek koneksi backend.");

      setSuccessMsg(isEditing ? "Data berhasil diupdate!" : "Data berhasil ditambahkan!");
      setIsEditing(false); setEditId(null);
      setPlaceForm({ name: "", category: "", address: "", imageUrl: "", price: "0", tags: [] });
      fetchData();
    } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
  };

  const handleEditPlace = (p: AdminPlace) => {
    setIsEditing(true); setEditId(p.id); setActiveTab("places");
    setPlaceForm({ name: p.name, category: p.category, address: p.address, imageUrl: p.imageUrl||"", price: p.price?.toString()||"0", tags: [] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletePlace = async (id: number, cat: string) => {
    if(!confirm("Hapus tempat ini?")) return;
    let endpoint = "";
    
    if(cat==="Wisata Alam") endpoint=`${API_BASE}/api/delete_wisata/${id}`;
    else if(cat==="Wisata Pendidikan") { alert("Fitur hapus wisata pendidikan belum ada di backend"); return; }
    else if(cat==="Cafe") endpoint=`${API_BASE}/api/delete_cafe/${id}`;
    else if(cat==="Kuliner") endpoint=`${API_BASE}/api/delete_kuliner/${id}`;

    if(endpoint) {
        await fetch(endpoint, { method: "DELETE" });
        setSuccessMsg("Data terhapus."); fetchData();
    }
  };

  // --- HANDLERS FOR NEWS ---
  const handleNewsChange = (field: keyof NewsForm, value: string) => {
    setNewsForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setSuccessMsg(""); setIsLoading(true);

    try {
      const payload = {
        title: newsForm.title,
        category: newsForm.category || "Umum",
        date: newsForm.date || new Date().toISOString().split('T')[0],
        image_url: newsForm.image_url,
        content: newsForm.content,
        read_minutes: 3
      };

      const res = await fetch(`${API_BASE}/api/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Gagal memposting berita");

      setSuccessMsg("Berita berhasil diterbitkan!");
      setNewsForm({ title: "", category: "", date: "", image_url: "", content: "" });
      fetchData();
    } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
  };

  const handleDeleteNews = async (id: number) => {
    if(!confirm("Hapus berita ini?")) return;
    await fetch(`${API_BASE}/api/news/${id}`, { method: "DELETE" });
    setSuccessMsg("Berita dihapus."); fetchData();
  };

  const handleLogout = () => {
    if(confirm("Keluar admin?")) { 
      localStorage.removeItem("role"); 
      navigate("/loginadmin"); 
    }
  };

  // Filter Logic
  const filteredPlaces = useMemo(() => places.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())), [places, searchQuery]);
  const displayPlaces = searchQuery ? filteredPlaces : [...places].slice(-5).reverse();

  // Helper untuk menentukan tags mana yang harus muncul
  const currentTagsList = useMemo(() => {
      const cat = placeForm.category;
      if (cat === "Cafe" || cat === "Kuliner") return CAFE_TAGS;
      if (cat.includes("Wisata")) return WISATA_TAGS;
      return [];
  }, [placeForm.category]);

  return (
    <div className="min-h-screen bg-pageRadial font-sans text-slate-800">
      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-30">
        <div className="w-[min(1120px,92%)] mx-auto h-16 flex items-center justify-between px-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Admin Portal</p>
            <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
          </div>
          <button onClick={handleLogout} className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">
            <LogOut className="inline w-3 h-3 mr-1"/> Keluar
          </button>
        </div>
      </header>

      <main className="py-8 w-[min(1120px,92%)] mx-auto space-y-8 px-2">
        
        {/* STATS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoCard icon={<MapPin className="w-5 h-5"/>} title={`${places.length}`} text="Total Tempat" />
          <InfoCard icon={<Newspaper className="w-5 h-5"/>} title={`${newsList.length}`} text="Total Berita" />
          <InfoCard icon={<Coffee className="w-5 h-5"/>} title={`${places.filter(p=>p.category==='Cafe').length}`} text="Cafe" />
          <InfoCard icon={<Mountain className="w-5 h-5"/>} title={`${places.filter(p=>p.category.includes('Wisata')).length}`} text="Wisata" />
        </section>

        {/* TABS SWITCHER */}
        <div className="flex gap-4 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab("places")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${activeTab==="places" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}
          >
            <MapPin className="w-4 h-4"/> Kelola Tempat
          </button>
          <button 
            onClick={() => setActiveTab("news")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${activeTab==="news" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}
          >
            <Newspaper className="w-4 h-4"/> Kelola Berita
          </button>
        </div>

        {/* NOTIFICATIONS */}
        {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{error}</div>}
        {successMsg && <div className="p-3 bg-green-50 text-green-600 text-xs rounded-lg border border-green-100">{successMsg}</div>}

        {/* === TAB CONTENT: PLACES === */}
        {activeTab === "places" && (
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
            {/* TABLE PLACES */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Daftar Tempat</h3>
                <div className="relative">
                  <Search className="absolute left-2 top-2 w-3 h-3 text-slate-400"/>
                  <input type="text" placeholder="Cari..." className="pl-7 pr-3 py-1 text-xs border rounded-full w-32 focus:ring-1 focus:ring-slate-900" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="overflow-auto max-h-[600px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 border-b bg-slate-50 sticky top-0">
                    <tr><th className="p-2">Nama</th><th className="p-2">Kategori</th><th className="p-2 text-right">Aksi</th></tr>
                  </thead>
                  <tbody>
                    {displayPlaces.map(p => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-2 font-medium">{p.name}<div className="text-[10px] text-slate-400 truncate w-32">{p.address}</div></td>
                        <td className="p-2"><span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full">{p.category}</span></td>
                        <td className="p-2 text-right space-x-1">
                          <button onClick={()=>handleEditPlace(p)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Pencil className="w-3.5 h-3.5"/></button>
                          <button onClick={()=>handleDeletePlace(p.id, p.category)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5"/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FORM PLACES */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  {isEditing ? <Pencil className="w-4 h-4 text-blue-600"/> : <PlusCircle className="w-4 h-4 text-green-600"/>}
                  {isEditing ? "Edit Tempat" : "Tambah Tempat"}
                </h3>
                {isEditing && <button onClick={()=>{setIsEditing(false);setPlaceForm({name:"",category:"",address:"",imageUrl:"",price:"0",tags:[]})}} className="text-xs text-red-500">Batal</button>}
              </div>
              
              <form onSubmit={handlePlaceSubmit} className="space-y-3">
                {/* Field Nama */}
                <div><label className="text-xs font-semibold">Nama</label><input className="w-full border rounded p-2 text-sm" value={placeForm.name} onChange={e=>handlePlaceChange("name",e.target.value)}/></div>
                
                {/* Field Kategori */}
                <div><label className="text-xs font-semibold">Kategori</label>
                  <select className="w-full border rounded p-2 text-sm bg-white" value={placeForm.category} onChange={e=>handlePlaceChange("category",e.target.value)} disabled={isEditing}>
                    <option value="">Pilih...</option>
                    <option value="Wisata Alam">Wisata Alam</option>
                    <option value="Wisata Pendidikan">Wisata Pendidikan</option>
                    <option value="Cafe">Cafe</option>
                    <option value="Kuliner">Kuliner</option>
                  </select>
                </div>

                {/* Field Alamat */}
                <div><label className="text-xs font-semibold">Alamat</label><input className="w-full border rounded p-2 text-sm" value={placeForm.address} onChange={e=>handlePlaceChange("address",e.target.value)}/></div>
                
                {/* Field Link Foto */}
                <div><label className="text-xs font-semibold">Link Foto</label><input className="w-full border rounded p-2 text-sm" placeholder="https://..." value={placeForm.imageUrl} onChange={e=>handlePlaceChange("imageUrl",e.target.value)}/></div>
                
                {/* Field Harga */}
                <div><label className="text-xs font-semibold">Harga / HTM</label><input type="number" className="w-full border rounded p-2 text-sm" value={placeForm.price} onChange={e=>handlePlaceChange("price",e.target.value)}/></div>

                {/* === FACILITIES / TAGS CHECKBOXES (DISINI UI-NYA) === */}
                {currentTagsList.length > 0 && (
                  <div className="pt-2 border-t border-dashed border-slate-200">
                    <label className="text-xs font-semibold block mb-2">Fasilitas & Fitur</label>
                    <div className="grid grid-cols-2 gap-2">
                      {currentTagsList.map(tag => (
                        <div key={tag} onClick={() => handleTagToggle(tag)} className={`cursor-pointer flex items-center gap-2 p-2 rounded border text-xs transition ${placeForm.tags.includes(tag) ? "bg-slate-900 border-slate-900 text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                          <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${placeForm.tags.includes(tag) ? "bg-white border-white" : "bg-white border-slate-300"}`}>
                            {placeForm.tags.includes(tag) && <div className="w-2 h-2 bg-slate-900 rounded-[1px]"/>}
                          </div>
                          <span>{TAG_LABELS[tag] || tag}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 italic">*Data tags akan dikirim ke backend</p>
                  </div>
                )}
                
                <button disabled={isLoading} className="w-full bg-slate-900 text-white py-2 rounded font-semibold text-sm hover:bg-black disabled:bg-slate-400 mt-4">
                  {isLoading ? "Menyimpan..." : isEditing ? "Update Data" : "Simpan Data"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* === TAB CONTENT: NEWS === */}
        {activeTab === "news" && (
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
            {/* TABLE NEWS */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-4">Arsip Berita</h3>
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 border-b bg-slate-50">
                    <tr><th className="p-2">Judul</th><th className="p-2">Tanggal</th><th className="p-2 text-right">Aksi</th></tr>
                  </thead>
                  <tbody>
                    {newsList.map(n => (
                      <tr key={n.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-2 font-medium">{n.title}<div className="text-[10px] text-slate-400">{n.category}</div></td>
                        <td className="p-2 text-xs text-slate-500">{n.date}</td>
                        <td className="p-2 text-right">
                          <button onClick={()=>handleDeleteNews(n.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5"/></button>
                        </td>
                      </tr>
                    ))}
                    {newsList.length===0 && <tr><td colSpan={3} className="p-4 text-center text-xs text-slate-400">Belum ada berita.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FORM NEWS */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600"/> Terbitkan Berita
              </h3>
              <form onSubmit={handleNewsSubmit} className="space-y-3">
                <div><label className="text-xs font-semibold">Judul Berita</label><input className="w-full border rounded p-2 text-sm" value={newsForm.title} onChange={e=>handleNewsChange("title",e.target.value)} placeholder="Contoh: Festival Banyumas 2024"/></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs font-semibold">Kategori</label><input className="w-full border rounded p-2 text-sm" value={newsForm.category} onChange={e=>handleNewsChange("category",e.target.value)} placeholder="Wisata/Event"/></div>
                  <div><label className="text-xs font-semibold">Tanggal</label><input type="date" className="w-full border rounded p-2 text-sm" value={newsForm.date} onChange={e=>handleNewsChange("date",e.target.value)}/></div>
                </div>
                <div><label className="text-xs font-semibold">Link Foto Cover</label><input className="w-full border rounded p-2 text-sm" value={newsForm.image_url} onChange={e=>handleNewsChange("image_url",e.target.value)} placeholder="https://..."/></div>
                <div><label className="text-xs font-semibold">Isi Singkat / Ringkasan</label><textarea rows={4} className="w-full border rounded p-2 text-sm" value={newsForm.content} onChange={e=>handleNewsChange("content",e.target.value)} placeholder="Tulis deskripsi berita..."/></div>
                
                <button disabled={isLoading} className="w-full bg-slate-900 text-white py-2 rounded font-semibold text-sm hover:bg-black disabled:bg-slate-400">
                  {isLoading ? "Publishing..." : "Terbitkan Berita"}
                </button>
              </form>
            </div>
          </div>
        )}

        <ChatbotAdminPanel />
      </main>
    </div>
  );
}
