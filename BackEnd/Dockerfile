# --- TAHAP 1: BUILD (Memasak) ---
# Gunakan image Rust terbaru
FROM rust:latest as builder

# Buat folder kerja di dalam Docker
WORKDIR /app

# Install library sistem yang sering dibutuhkan Rust (SSL & pkg-config)
RUN apt-get update && apt-get install -y pkg-config libssl-dev

# Copy semua file kodingan kamu ke dalam Docker
COPY . .

# PENTING: Matikan pengecekan koneksi database saat build
# Ini mengatasi error "exit code 1" karena Docker tidak bisa akses Neon saat build
ENV SQLX_OFFLINE=true

# Build aplikasi ke mode release (siap pakai)
RUN cargo build --release

# --- TAHAP 2: RUN (Menyajikan) ---
# Gunakan Linux ringan (Debian Slim) untuk menjalankan aplikasi
FROM debian:bookworm-slim

WORKDIR /app

# Install sertifikat keamanan (WAJIB supaya bisa connect ke Database Neon/HTTPS)
RUN apt-get update && apt-get install -y ca-certificates libssl-dev && rm -rf /var/lib/apt/lists/*

# Copy file aplikasi yang sudah jadi (matang) dari Tahap 1
# Pastikan nama 'capstone-be' sesuai dengan nama di Cargo.toml kamu
COPY --from=builder /app/target/release/capstone-be /app/server

# Buka port 3000 (sesuai settingan main.rs kamu)
EXPOSE 3000

# Jalankan aplikasi
CMD ["/app/server"]
