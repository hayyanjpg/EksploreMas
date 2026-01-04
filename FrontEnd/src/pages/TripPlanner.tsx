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
import { FiInfo, FiAlertCircle } from "react-icons/fi";

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
};

const TIME_SLOTS = ["08:00", "10:00", "12:30", "14:30", "16:30", "19:00"];
const DURATION_LABELS = ["1.5 jam", "2 jam", "1 jam", "1.5 jam", "2 jam", "2 jam"];

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
// 🔧 Generate Itinerary Logic
// --------------------------------
function buildItinerary(places: TripPlace[], days: number): ItineraryDay[] {
  const shuffledPlaces = shuffleArray(places);
  const maxActivities = days * TIME_SLOTS.length;
  const limitedPlaces = shuffledPlaces.slice(0, maxActivities);

  const result: ItineraryDay[] = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    activities: [],
  }));

  limitedPlaces.forEach((place, index) => {
    const dayIndex = index % days;
    const mainCategory: TripCategory = place.categories[0] ?? "alam";

    let subtitle = "Eksplorasi Seru";
    if (mainCategory === "cafe") subtitle = "Nongkrong Santai";
    if (mainCategory === "kuliner") subtitle = "Wisata Kuliner";
    if (mainCategory === "pendidikan") subtitle = "Edukasi & Sejarah";
    if (mainCategory === "alam") subtitle = "Menikmati Alam";

    const activity: ItineraryActivity = {
      time: "", 
      title: place.name,
      subtitle: subtitle,
      address: place.address,
      category: mainCategory,
      priceLabel: place.priceRange ?? "Fleksibel",
      durationLabel: "", 
      imageUrl: place.imageUrl,
      uniqueId: place.uniqueId,
      price: place.rawPrice 
    };

    result[dayIndex].activities.push(activity);
  });

  result.forEach((day) => {
    day.activities.forEach((act, idx) => {
      const slotIndex = idx % TIME_SLOTS.length;
      act.time = TIME_SLOTS[slotIndex];
      act.durationLabel = DURATION_LABELS[slotIndex];
    });
  });

  return result;
}

// --------------------------------
// 💰 Hitung Budget (HANYA TIKET)
// --------------------------------
function getEstimatedBudget(itinerary: ItineraryDay[]): number {
  let total = 0;
  itinerary.forEach((day) => {
    day.activities.forEach((act) => {
      // Murni harga dari database, tanpa tambahan asumsi
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
  const [selectedDays, setSelectedDays] = useState<number>(1);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  
  // State untuk menampilkan detail info budget
  const [showBudgetInfo, setShowBudgetInfo] = useState(false);
  
  const [allPlaces, setAllPlaces] = useState<TripPlace[]>([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // 1. FETCH DATA
  // ===============================
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
          rawPrice: Number(item.htm) || 0
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
          rawPrice: Number(item.htm) || 0
        }));

        const placesCafe: TripPlace[] = dataNongkrong.map((item: any) => ({
          uniqueId: `CAFE-${item.id}`,
          id: String(item.id),
          name: item.nama_tempat,
          categories: ["cafe"],
          address: item.alamat,
          imageUrl: item.link_foto,
          description: item.deskripsi,
          priceRange: item.htm === 0 ? "Menu bervariasi" : `Rp ${item.htm?.toLocaleString('id-ID')}`,
          rawPrice: Number(item.htm) || 0
        }));

        const placesKuliner: TripPlace[] = dataKuliner.map((item: any) => ({
          uniqueId: `KUL-${item.id}`,
          id: String(item.id),
          name: item.nama_tempat,
          categories: ["kuliner"],
          address: item.alamat,
          imageUrl: item.link_foto,
          description: item.deskripsi,
          priceRange: item.htm === 0 ? "Menu bervariasi" : `Rp ${item.htm?.toLocaleString('id-ID')}`,
          rawPrice: Number(item.htm) || 0
        }));

        setAllPlaces([...placesAlam, ...placesEdu, ...placesCafe, ...placesKuliner]);
      } catch (error) {
        console.error("Gagal mengambil data trip:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [API_BASE]);

  // ===============================
  // 2. FILTER & LOGIC
  // ===============================
  const filteredPlaces = useMemo(() => {
    if (selectedCategories.length === 0) return allPlaces;
    return allPlaces.filter((place) =>
      place.categories.some((cat) => selectedCategories.includes(cat))
    );
  }, [allPlaces, selectedCategories]);

  const handleToggleCategory = (cat: TripCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleNextFromStep1 = () => {
    if (selectedCategories.length === 0) return;
    setStep(2);
  };

  const handleGenerate = () => {
    const generated = buildItinerary(filteredPlaces, selectedDays);
    setItinerary(generated);
    setStep(3);
    setShowBudgetInfo(true); // Tampilkan info budget saat pertama kali generate
  };

  const totalActivities = itinerary.reduce(
    (acc, day) => acc + day.activities.length,
    0
  );
  
  const estimatedBudget = getEstimatedBudget(itinerary);

  // ===============================
  // RENDER UI
  // ===============================
  if (loading) {
    return (
      <div className="min-h-screen bg-pageRadial flex items-center justify-center">
        <p className="text-[#001845] font-bold animate-pulse">Menyiapkan data destinasi...</p>
      </div>
    );
  }

  return (
    <section className="bg-pageRadial min-h-screen">
      <div className="flex justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-6xl">
          <header className="text-center mb-10">
            <h1 className="mt-2 font-playfair text-3xl md:text-4xl font-bold text-[#001845]">
              Trip Planner AI
            </h1>
            <p className="mt-3 text-slate-600 text-sm md:text-base">
              Rencanakan liburanmu di Purwokerto secara otomatis!
            </p>
          </header>

          <div className="flex items-center justify-center gap-2 text-xs md:text-sm mb-8 text-slate-500">
            <span className={`px-4 py-1.5 rounded-full transition-all ${step === 1 ? "bg-[#001845] text-white" : "bg-white/50"}`}>1. Kategori</span>
            <span>›</span>
            <span className={`px-4 py-1.5 rounded-full transition-all ${step === 2 ? "bg-[#001845] text-white" : "bg-white/50"}`}>2. Durasi</span>
            <span>›</span>
            <span className={`px-4 py-1.5 rounded-full transition-all ${step === 3 ? "bg-[#001845] text-white" : "bg-white/50"}`}>3. Itinerary</span>
          </div>

          <div className="transition-all duration-500">
            {step === 1 && (
              <CategorySelector
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                onNext={handleNextFromStep1}
              />
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

                {/* DISCLAIMER BOX (Tampil jika showBudgetInfo true) */}
                {showBudgetInfo && (
                  <div className="mx-auto max-w-2xl bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-4 items-start animate-fadeIn">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-full mt-1">
                      <FiAlertCircle size={20} />
                    </div>
                    <div className="text-sm text-slate-700 space-y-1">
                      <p className="font-bold text-amber-800">Tentang Estimasi Biaya:</p>
                      <p>
                        Nominal di atas <strong>HANYA estimasi harga tiket masuk (HTM)</strong> berdasarkan data di sistem kami.
                      </p>
                      <p className="text-slate-500 text-xs italic">
                        *Mohon siapkan budget tambahan untuk biaya parkir, makan, bensin, dan kebutuhan pribadi lainnya. Harga tiket dapat berubah sewaktu-waktu.
                      </p>
                    </div>
                  </div>
                )}
                
                <ItineraryDayList itinerary={itinerary} />
                
                <div className="text-center mt-8">
                   <button 
                     onClick={() => setShowBudgetInfo(!showBudgetInfo)}
                     className="text-xs text-slate-400 hover:text-[#001845] flex items-center justify-center gap-1 mx-auto transition-colors"
                   >
                     <FiInfo/> Klik pada ringkasan biaya untuk melihat detail estimasi.
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TripPlanner;
