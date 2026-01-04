// src/types/trip.ts

// 1. Definisi Kategori (Union Type)
export type TripCategory = "alam" | "pendidikan" | "cafe" | "kuliner";

// 2. Definisi Satu Aktivitas dalam Itinerary
export interface ItineraryActivity {
  time: string;
  title: string;
  subtitle: string;
  address: string;
  category: TripCategory; // Wajib salah satu dari TripCategory di atas
  priceLabel: string;
  durationLabel: string;
  
  // Tambahan agar TripPlanner tidak error saat memasukkan gambar & link
  imageUrl?: string; 
  uniqueId?: string; 
}

// 3. Definisi Satu Hari Penuh
export interface ItineraryDay {
  day: number;
  activities: ItineraryActivity[];
}
