// src/pages/TripPlanner.tsx
import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";

// COMPONENTS
// Pastikan komponen-komponen ini ada di folder components/trip Anda
import CategorySelector from "../components/trip/CategorySelector";
import DurationSelector from "../components/trip/DurationSelector";
import ItinerarySummary from "../components/trip/ItinerarySummary";
import ItineraryDayList from "../components/trip/ItineraryDayList";

// TYPES (Bisa didefinisikan di sini atau di types/trip.ts)
export type TripCategory = "alam" | "pendidikan" | "cafe" | "kuliner";

export interface ItineraryActivity {
  time: string;
  title: string;
  subtitle: string;
  address: string;
  category: string;
  priceLabel: string;
  durationLabel: string;
  imageUrl: string;
  uniqueId: string; // Untuk link detail
}

export interface ItineraryDay {
  day: number;
  activities: ItineraryActivity[];
}

type TripPlace = {
  uniqueId: string;
  id: string;
  name: string;
  categories: TripCategory[];
  address: string;
  imageUrl: string;
  description: string;
  priceRange?: string;
};

const TIME_SLOTS = ["08:00", "10:00", "12:30", "14:30", "16:30", "19:00"];
const DURATION_LABELS = ["1.5 jam", "2 jam", "1 jam", "1.5 jam", "2 jam", "2 jam"];

// --------------------------------
// 🔧 Helper: Shuffle Array (Agar itinerary bervariasi)
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
  // 1. Acak urutan tempat agar hasil generate selalu fresh
  const shuffledPlaces = shuffleArray(places);

  // 2. Hitung slot maksimal
  const maxActivities = days * TIME_SLOTS.length;
  
  // 3. Ambil tempat sejumlah slot yang tersedia
  // (Jika tempat kurang, ambil semua yang ada)
  const limitedPlaces = shuffledPlaces.slice(0, maxActivities);

  const result: ItineraryDay[] = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    activities: [],
  }));

  limitedPlaces.forEach((place, index) => {
    // Distribusi tempat ke hari secara round-robin (Day 1, Day 2, Day 1, dst)
    const dayIndex = index % days;
    const mainCategory = place.categories[0] ?? "alam";

    let subtitle = "Eksplorasi Seru";
    if (mainCategory === "cafe") subtitle = "Nongkrong Santai";
    if (mainCategory === "kuliner") subtitle = "Wisata Kuliner";
    if (mainCategory === "pendidikan") subtitle = "Edukasi & Sejarah";
    if (mainCategory === "alam") subtitle = "Menikmati Alam";

    result[dayIndex].activities.push({
      time: "", // Nanti diisi
      title: place.name,
      subtitle: subtitle,
      address: place.address,
      category: mainCategory,
      priceLabel: place.priceRange ?? "Fleksibel",
      durationLabel: "", // Nanti diisi
      imageUrl: place.imageUrl,
      uniqueId: place.uniqueId
    });
  });

  // 4. Assign Waktu & Durasi berdasarkan slot
  result.forEach((day) => {
    // Urutkan aktivitas di dalam hari itu (opsional, tapi di sini kita pakai urutan slot)
    day.activities.forEach((act, idx) => {
      const slotIndex = idx % TIME_SLOTS.length;
      act.time = TIME_SLOTS[slotIndex];
      act.durationLabel = DURATION_LABELS[slotIndex];
    });
  });

  return result;
}

function getEstimatedBudget(itinerary: ItineraryDay[]): number {
  // Asumsi rata-rata pengeluaran per tempat (Tiket/Makan) = 35.000
  const perActivityAvg = 35000;
  const totalActivities = itinerary.reduce(
    (acc, day) => acc + day.activities.length,
    0
  );
  return totalActivities * perActivityAvg;
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
  
  // State Data dari API
  const [allPlaces, setAllPlaces] = useState<TripPlace[]>([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // 1. FETCH DATA DARI API
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

        // Mapping Data Alam
        const placesAlam: TripPlace[] = dataAlam.map((item: any) => ({
          uniqueId: `ALAM-${item.id}`,
          id: String(item.id),
          name: item.nama_tempat,
          categories: ["alam"],
          address: item.alamat,
          imageUrl: item.link_foto,
          description: item.deskripsi,
          priceRange: `Rp ${item.htm?.toLocaleString('id-ID')}`
        }));

        // Mapping Data Pendidikan
        const placesEdu: TripPlace[] = dataEdu.map((item: any) => ({
          uniqueId: `EDU-${item.id}`,
          id: String(item.id),
          name: item.nama_tempat,
          categories: ["pendidikan"],
          address: item.alamat,
          imageUrl: item.link_foto,
          description: item.deskripsi,
          priceRange: `Rp ${item.htm?.toLocaleString('id-ID')}`
        }));

        // Mapping Data Cafe (Nongkrong)
        const placesCafe: TripPlace[] = dataNongkrong.map((item: any) => ({
          uniqueId: `CAFE-${item.id}`,
          id: String(item.id),
          name: item.nama_tempat,
          categories: ["cafe"],
          address: item.alamat,
          imageUrl: item.link_foto,
          description: item.deskripsi,
          priceRange: `Rp ${item.htm?.toLocaleString('id-ID')}`
        }));

        // Mapping Data Kuliner
        const placesKuliner: TripPlace[] = dataKuliner.map((item: any) => ({
          uniqueId: `KUL-${item.id}`,
          id: String(item.id),
          name: item.nama_tempat,
          categories: ["kuliner"],
          address: item.alamat,
          imageUrl: item.link_foto,
          description: item.deskripsi,
          priceRange: `Rp ${item.htm?.toLocaleString('id-ID')}`
        }));

        // Gabungkan semua
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
  // 2. FILTER BERDASARKAN KATEGORI
  // ===============================
  const filteredPlaces = useMemo(() => {
    if (selectedCategories.length === 0) return allPlaces;

    // Filter: Tempat harus memiliki SALAH SATU kategori yang dipilih
    return allPlaces.filter((place) =>
      place.categories.some((cat) => selectedCategories.includes(cat))
    );
  }, [allPlaces, selectedCategories]);

  // ===============================
  // HANDLERS
  // ===============================
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
    // Generate Itinerary menggunakan data yang sudah difilter
    const generated = buildItinerary(filteredPlaces, selectedDays);
    setItinerary(generated);
    setStep(3);
  };

  const totalActivities = itinerary.reduce(
    (acc, day) => acc + day.activities.length,
    0
  );
  const estimatedBudget = getEstimatedBudget(itinerary);

  // ===============================
  // RENDER
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
          {/* HEADER */}
          <header className="text-center mb-10">
            <p className="text-sm md:text-base text-slate-500 flex items-center justify-center gap-2">
              <span>✨</span>
              <span>ExploreMas Trip Planner</span>
              <span>✨</span>
            </p>
            <h1 className="mt-2 font-playfair text-3xl md:text-4xl font-bold text-[#001845]">
              Trip Planner AI
            </h1>
            <p className="mt-3 text-slate-600 text-sm md:text-base">
              Pilih kategori favoritmu & durasi liburan —{" "}
              <br className="hidden md:block" />
              kami buatkan rencana perjalanan otomatis dari database terlengkap!
            </p>
          </header>

          {/* STEP INDICATOR */}
          <div className="flex items-center justify-center gap-2 text-xs md:text-sm mb-8 text-slate-500">
            <span className={`px-4 py-1.5 rounded-full transition-all ${step === 1 ? "bg-[#001845] text-white shadow-lg" : "bg-white/50"}`}>
              1. Kategori
            </span>
            <span>›</span>
            <span className={`px-4 py-1.5 rounded-full transition-all ${step === 2 ? "bg-[#001845] text-white shadow-lg" : "bg-white/50"}`}>
              2. Durasi
            </span>
            <span>›</span>
            <span className={`px-4 py-1.5 rounded-full transition-all ${step === 3 ? "bg-[#001845] text-white shadow-lg" : "bg-white/50"}`}>
              3. Hasil Itinerary
            </span>
          </div>

          {/* CONTENT PER STEP */}
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
                <ItinerarySummary
                  selectedDays={selectedDays}
                  totalActivities={totalActivities}
                  estimatedBudget={estimatedBudget}
                  onBackToDuration={() => setStep(2)}
                  onBackToCategory={() => setStep(1)}
                />
                <ItineraryDayList itinerary={itinerary} />
                
                {/* Note tambahan */}
                <div className="text-center text-xs text-slate-400 mt-8">
                  * Estimasi budget belum termasuk transportasi antar lokasi & penginapan.
                  <br /> Klik kartu destinasi untuk melihat detail lengkap.
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
