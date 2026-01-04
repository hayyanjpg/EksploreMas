// src/types/trip.ts

// 1. Definisi Kategori
export type TripCategory = "alam" | "pendidikan" | "cafe" | "kuliner";

// 2. Definisi Satu Aktivitas
export interface ItineraryActivity {
  time: string;
  title: string;
  subtitle: string;
  address: string;
  category: TripCategory;
  priceLabel: string;
  durationLabel: string;
  imageUrl?: string;
  uniqueId?: string;

  // UPDATE: Harga tiket asli (integer) untuk kalkulasi budget
  price: number; 
}

// 3. Definisi Satu Hari
export interface ItineraryDay {
  day: number;
  activities: ItineraryActivity[];
}
