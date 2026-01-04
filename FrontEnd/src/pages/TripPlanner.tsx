// src/pages/TripPlanner.tsx
import React, { useMemo, useState, useEffect } from "react";

// COMPONENTS
import CategorySelector from "../components/trip/CategorySelector";
import DurationSelector from "../components/trip/DurationSelector";
import ItinerarySummary from "../components/trip/ItinerarySummary";
import ItineraryDayList from "../components/trip/ItineraryDayList";

// TYPES
import { TripCategory, ItineraryDay, ItineraryActivity } from "../types/trip";

// React Icons
import { FiInfo, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

type TripPlace = {
  uniqueId: string;
  id: string;
  name: string;
  categories: TripCategory[];
  address: string;
  imageUrl: string;
  description: string;
  priceRange?: string;
  rawPrice: number;
  // Penanda apakah ini biaya tiket atau makan
  costType: "ticket" | "menu"; 
};

// Pola Waktu Ideal: Pagi (Wisata) -> Siang (Makan) -> Sore (Wisata) -> Malam (Cafe)
const TIME_SLOTS = ["09:00", "12:00", "14:00", "19:00"];
const DURATION_LABELS = ["2.5 jam", "1.5 jam", "3 jam", "2 jam"];

// --------------------------------
// 🔧 Helper: Shuffle Array
// --------------------------------
function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

// --------------------------------
// 🧠 SMART ITINERARY GENERATOR
// --------------------------------
function buildItinerary(places: TripPlace[], days: number, isMixedMode: boolean): ItineraryDay[] {
  const result: ItineraryDay[] = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    activities: [],
  }));

  // Pisahkan tempat berdasarkan jenisnya untuk pengaturan jadwal
  const destinations = shuffleArray(places.filter(p => p.categories.includes("alam") || p.categories.includes("pendidikan")));
  const foods = shuffleArray(places.filter(p => p.categories.includes("kuliner")));
  const cafes = shuffleArray(places.filter(p => p.categories.includes("cafe")));

  // Jika user HANYA memilih wisata (tanpa kuliner), kita tetap butuh list destinations
  // Jika user HANYA memilih kuliner, destinations kosong.
  // Maka kita buat fallback pool.
  const generalPool = shuffleArray(places);

  let destIndex = 0;
  let foodIndex = 0;
  let cafeIndex = 0;
  let poolIndex = 0;

  result.forEach((day) => {
    // Kita isi 4 slot per hari
    // Slot 0: Pagi
    // Slot 1: Siang
    // Slot 2: Sore
    // Slot 3: Malam

    for (let slot = 0; slot < 4; slot++) {
      let selectedPlace: TripPlace | undefined;

      if (isMixedMode) {
        // --- LOGIKA CAMPURAN (SMART MIX) ---
        if (slot === 0) selectedPlace = destinations[destIndex++] || generalPool[poolIndex++]; // Pagi: Wisata
        else if (slot === 1) selectedPlace = foods[foodIndex++] || cafes[cafeIndex++] || generalPool[poolIndex++]; // Siang: Makan
        else if (slot === 2) selectedPlace = destinations[destIndex++] || generalPool[poolIndex++]; // Sore: Wisata
        else if (slot === 3) selectedPlace = cafes[cafeIndex++] || foods[foodIndex++] || generalPool[poolIndex++]; // Malam: Nongkrong
      } else {
        // --- LOGIKA MANUAL (SESUAI PILIHAN USER) ---
        // Jika user cuma pilih Wisata, semua slot wisata.
        // Jika user pilih Wisata + Kuliner, kita coba selang-seling jika memungkinkan.
        
        const hasDest = destinations.length > 0;
        const hasFood = foods.length > 0 || cafes.length > 0;

        if (hasDest && hasFood) {
           // Selang seling: Wisata -> Makan -> Wisata -> Makan
           if (slot % 2 === 0) selectedPlace = destinations[destIndex++] || generalPool[poolIndex++];
           else selectedPlace = foods[foodIndex++] || cafes[cafeIndex++] || generalPool[poolIndex++];
        } else {
           // Ambil urut saja dari pool filter
           selectedPlace = generalPool[poolIndex++];
        }
      }

      // Safety check: jika tempat habis, ambil ulang dari awal (putar lagi)
      if (!selectedPlace) selectedPlace = places[Math.floor(Math.random() * places.length)];

      if (selectedPlace) {
        const mainCategory = selectedPlace.categories[0];
        let subtitle = "Wisata";
        if (mainCategory === "cafe") subtitle = "Nongkrong & Kopi";
        if (mainCategory === "kuliner") subtitle = "Makan Siang/Malam";
        if (mainCategory === "alam") subtitle = "Wisata Alam";
        if (mainCategory === "pendidikan") subtitle = "Wisata Edukasi";

        // LABEL HARGA DINAMIS
        // Jika Ticket: "Tiket: Rp 10.000"
        // Jika Menu: "Menu: Rp 25.000"
        const finalPriceLabel = selectedPlace.costType === "ticket" 
            ? `Tiket: ${selectedPlace.priceRange}` 
            : `Est. Menu: ${selectedPlace.priceRange}`;

        result[day.day - 1].activities.push({
          time: TIME_SLOTS[slot],
          title: selectedPlace.name,
          subtitle: subtitle,
          address: selectedPlace.address,
          category: mainCategory,
          priceLabel: finalPriceLabel, // Gunakan label baru
          durationLabel: DURATION_LABELS[slot],
          imageUrl: selectedPlace.imageUrl,
          uniqueId: selectedPlace.uniqueId,
          price: selectedPlace.rawPrice
        });
      }
    }
  });

  return result;
}

function getEstimatedBudget(itinerary: ItineraryDay[]): number {
  let total = 0;
  itinerary.forEach((day) => {
    day.activities.forEach((act) => {
      total += act.price;
    });
  });
  return total;
}

// =====================================
// 🌟 MAIN COMPONENT
// =====================================
const TripPlanner: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategories, setSelectedCategories] = useState<TripCategory[]>([]);
  
  // State khusus untuk Mode Campuran
  const [isMixedMode, setIsMixedMode] = useState(false);

  const [selectedDays, setSelectedDays] = useState<number>(1);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [showBudgetInfo, setShowBudgetInfo] = useState(false);
  
  const [allPlaces, setAllPlaces] = useState<TripPlace[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [resAlam, resEdu, resNongkrong, resKuliner] = await Promise.all([
          fetch(`${API_BASE}/wisata_alam`),
          fetch(`${API_BASE}/wisata_pendidikan`),
          fetch(`${API_BASE}/tempat_nongkrong`),
          fetch(`${API_BASE}/get_kuliner`),
        ]);

        const dataAlam = await resAlam.json();
        const dataEdu = await resEdu.json();
        const dataNongkrong = await resNongkrong.json();
        const dataKuliner = await resKuliner.json();

        const placesAlam: TripPlace[] = dataAlam.map((item: any) => ({
          uniqueId: `ALAM-${item.id}`,
          id: String(item.id),
          name: item.nama_tempat,
          categories: ["alam"],
          address: item.alamat,
          imageUrl: item.link_foto,
          description: item.deskripsi,
          priceRange: item.htm === 0 ? "Gratis" : `Rp ${item.htm?.toLocaleString('id-ID')}`,
          rawPrice: Number(item.htm) || 0,
          costType: "ticket" // Wisata = Tiket
        }));

        const placesEdu: TripPlace[] = dataEdu.map((item: any) => ({
          uniqueId: `EDU-${item.id}`,
          id: String(item.id),
          name: item.nama_tempat,
          categories: ["pendidikan"],
          address: item.alamat,
          imageUrl: item.link_foto,
          description: item.deskripsi,
          priceRange: item.htm === 0 ? "Gratis" : `Rp ${item.htm?.toLocaleString('id-ID')}`,
          rawPrice: Number(item.htm) || 0,
          costType: "ticket" // Wisata = Tiket
        }));

        const placesCafe: TripPlace[] = dataNongkrong.map((item: any) => ({
          uniqueId: `CAFE-${item.id}`,
          id: String(item.id),
          name: item.nama_tempat,
          categories: ["cafe"],
          address: item.alamat,
          imageUrl: item.link_foto,
          description: item.deskripsi,
          priceRange: item.htm === 0 ? "20rb" : `Rp ${item.htm?.toLocaleString('id-ID')}`,
          rawPrice: Number(item.htm) || 20000, // Asumsi menu min 20rb jika 0
          costType: "menu" // Cafe = Menu
        }));

        const placesKuliner: TripPlace[] = dataKuliner.map((item: any) => ({
          uniqueId: `KUL-${item.id}`,
          id: String(item.id),
          name: item.nama_tempat,
          categories: ["kuliner"],
          address: item.alamat,
          imageUrl: item.link_foto,
          description: item.deskripsi,
          priceRange: item.htm === 0 ? "15rb" : `Rp ${item.htm?.toLocaleString('id-ID')}`,
          rawPrice: Number(item.htm) || 15000, // Asumsi menu min 15rb jika 0
          costType: "menu" // Kuliner = Menu
        }));

        setAllPlaces([...placesAlam, ...placesEdu, ...placesCafe, ...placesKuliner]);
      } catch (error) {
        console.error("Gagal fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [API_BASE]);

  // FILTER LOGIC
  const filteredPlaces = useMemo(() => {
    // Jika Mode Campuran aktif, gunakan SEMUA data
    if (isMixedMode) return allPlaces;
    
    // Jika tidak, filter manual
    if (selectedCategories.length === 0) return allPlaces;
    return allPlaces.filter((place) =>
      place.categories.some((cat) => selectedCategories.includes(cat))
    );
  }, [allPlaces, selectedCategories, isMixedMode]);

  // HANDLERS
  const handleToggleCategory = (cat: TripCategory) => {
    // Jika user klik kategori manual, matikan mode campuran
    setIsMixedMode(false);
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSelectMixedMode = () => {
    // Aktifkan mode campuran, reset kategori manual
    setIsMixedMode(!isMixedMode);
    setSelectedCategories([]); // Reset manual selection visual
  };

  const handleNextFromStep1 = () => {
    if (selectedCategories.length === 0 && !isMixedMode) return;
    setStep(2);
  };

  const handleGenerate = () => {
    // Oper parameter isMixedMode ke generator
    const generated = buildItinerary(filteredPlaces, selectedDays, isMixedMode);
    setItinerary(generated);
    setStep(3);
    setShowBudgetInfo(true);
  };

  const totalActivities = itinerary.reduce(
    (acc, day) => acc + day.activities.length,
    0
  );
  
  const estimatedBudget = getEstimatedBudget(itinerary);

  if (loading) return <div className="min-h-screen bg-pageRadial flex items-center justify-center font-bold text-[#001845]">Memuat Data...</div>;

  return (
    <section className="bg-pageRadial min-h-screen">
      <div className="flex justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-6xl">
          <header className="text-center mb-10">
            <h1 className="mt-2 font-playfair text-3xl md:text-4xl font-bold text-[#001845]">Trip Planner AI</h1>
            <p className="mt-3 text-slate-600">Rencanakan liburanmu di Purwokerto secara otomatis!</p>
          </header>

          {/* STEP INDICATOR */}
          <div className="flex items-center justify-center gap-2 text-xs md:text-sm mb-8 text-slate-500">
             {/* ... (Step Indicator sama seperti sebelumnya) ... */}
             <span className={`px-4 py-1.5 rounded-full ${step >= 1 ? "bg-[#001845] text-white" : "bg-white"}`}>1. Kategori</span>
             <span>›</span>
             <span className={`px-4 py-1.5 rounded-full ${step >= 2 ? "bg-[#001845] text-white" : "bg-white"}`}>2. Durasi</span>
             <span>›</span>
             <span className={`px-4 py-1.5 rounded-full ${step >= 3 ? "bg-[#001845] text-white" : "bg-white"}`}>3. Itinerary</span>
          </div>

          <div className="transition-all duration-500">
            {step === 1 && (
               <div className="max-w-3xl mx-auto">
                 <h2 className="text-xl font-bold text-center mb-6 text-[#001845]">Mau liburan gaya apa?</h2>
                 
                 {/* OPSI CAMPURAN (FULL EXPERIENCE) */}
                 <div 
                    onClick={handleSelectMixedMode}
                    className={`mb-6 p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${isMixedMode ? "border-[#001845] bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200"}`}
                 >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${isMixedMode ? "bg-[#001845] text-white" : "bg-slate-100 text-slate-400"}`}>
                       ✨
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-[#001845]">Campuran (Full Experience) <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-2">Recommended</span></h3>
                        <p className="text-sm text-slate-500">AI akan mengatur jadwal lengkap: Wisata Alam, Kuliner enak, hingga Cafe untuk nongkrong malam.</p>
                    </div>
                    {isMixedMode && <FiCheckCircle className="text-[#001845] text-2xl"/>}
                 </div>

                 <div className="flex items-center gap-4 mb-4">
                    <div className="h-[1px] bg-slate-200 flex-1"></div>
                    <span className="text-xs text-slate-400 uppercase font-bold">Atau pilih manual</span>
                    <div className="h-[1px] bg-slate-200 flex-1"></div>
                 </div>

                 {/* OPSI MANUAL */}
                 <div className={`opacity-100 transition-opacity ${isMixedMode ? "opacity-50 pointer-events-none grayscale" : ""}`}>
                    <CategorySelector
                        selectedCategories={selectedCategories}
                        onToggleCategory={handleToggleCategory}
                        onNext={() => {}} // Next button kita handle di bawah
                    />
                 </div>

                 <div className="mt-8 text-center">
                    <button 
                        onClick={handleNextFromStep1}
                        disabled={!isMixedMode && selectedCategories.length === 0}
                        className="bg-[#001845] text-white px-8 py-3 rounded-full font-bold hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Lanjut Pilih Durasi
                    </button>
                 </div>
               </div>
            )}

            {step === 2 && (
              <DurationSelector
                selectedDays={selectedDays}
                onSelectDays={setSelectedDays}
                onBackToCategory={() => setStep(1)}
                onGenerate={handleGenerate}
              />
            )}

            {step === 3 && (
              <div className="space-y-8 animate-fadeIn">
                <div onClick={() => setShowBudgetInfo(!showBudgetInfo)} className="cursor-pointer">
                    <ItinerarySummary
                        selectedDays={selectedDays}
                        totalActivities={totalActivities}
                        estimatedBudget={estimatedBudget}
                        onBackToDuration={() => setStep(2)}
                        onBackToCategory={() => setStep(1)}
                    />
                </div>

                {showBudgetInfo && (
                  <div className="mx-auto max-w-2xl bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex gap-4 items-start animate-fadeIn">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-full mt-1">
                      <FiAlertCircle size={20} />
                    </div>
                    <div className="text-sm text-slate-700 space-y-2">
                      <p className="font-bold text-[#001845]">Rincian Estimasi Biaya:</p>
                      <ul className="list-disc list-inside text-slate-600 ml-1 space-y-1">
                         <li><strong>Wisata:</strong> Sesuai harga Tiket Masuk (HTM).</li>
                         <li><strong>Kuliner & Cafe:</strong> Menggunakan harga estimasi menu per orang (Rp 15rb - 20rb) jika data menu belum tersedia.</li>
                      </ul>
                      <p className="text-slate-400 text-xs italic mt-2 border-t pt-2">
                        *Mohon siapkan budget ekstra untuk parkir & transportasi.
                      </p>
                    </div>
                  </div>
                )}
                
                <ItineraryDayList itinerary={itinerary} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TripPlanner;
