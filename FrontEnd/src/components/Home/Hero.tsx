import brushUrl from "/src/assets/images/hero/brush.png";
import tuguUrl from "/src/assets/images/hero/tugu.png";
import cloud1Url from "/src/assets/images/hero/cloud-1.png";
import cloud2Url from "/src/assets/images/hero/cloud-2.png";
import cloud3Url from "/src/assets/images/hero/cloud-3.png";
import shapeLeftUrl from "/src/assets/images/hero/shape-left.png";
import shapeRightUrl from "/src/assets/images/hero/shape-right.png";

export default function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden pt-10 pb-20 md:pt-20 md:pb-0 md:min-h-[700px] flex items-center"
      style={{ ["--brush-url" as any]: `url(${brushUrl})` }}
    >
      {/* ================= BACKGROUND SHAPES ================= */}
      {/* Shape Kiri */}
      <img
        src={shapeLeftUrl}
        alt=""
        aria-hidden
        className="pointer-events-none absolute z-0
          left-[-50px] top-[-50px] w-[300px] opacity-60
          md:left-[-120px] md:top-[10px] md:w-[520px] md:opacity-90
          xl:left-[-60px] xl:top-[-80px] xl:w-[600px]"
      />
      {/* Shape Kanan */}
      <img
        src={shapeRightUrl}
        alt=""
        aria-hidden
        className="pointer-events-none absolute z-0
          right-[-50px] bottom-[-20px] w-[300px] opacity-60
          md:right-[-80px] md:bottom-[-100px] md:w-[660px] md:opacity-90"
      />

      {/* Cloud-3 (Hiasan Background Tengah) */}
      <img
        src={cloud3Url}
        alt=""
        aria-hidden
        className="absolute z-0 
          top-[20%] left-[10%] w-[150px] opacity-30 blur-[2px]
          md:top-[360px] md:left-[320px] md:w-[400px]"
      />

      {/* ================= MAIN CONTAINER ================= */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-4">
        
        {/* ================= KOLOM KIRI: TEKS ================= */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left order-1 md:order-1 mt-8 md:mt-0">
          <p className="font-bold tracking-wider text-[#DF6951] text-sm md:text-base mb-4 uppercase">
            Best Choice for Slow-Living
          </p>

          <h1 className="font-playfair font-extrabold text-[#181E4B] leading-tight
                         text-4xl sm:text-5xl md:text-6xl xl:text-[76px]">
            Live Slow,{" "}
            <span className="relative inline-block z-10">
               Feel More
               {/* Brush Underline Effect */}
               <span className="absolute -bottom-2 left-0 w-full h-3 md:h-4 bg-orange-200/50 -z-10 rounded-full skew-x-[-10deg]"></span>
            </span>
            ,
            <br />
            Discover{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#181E4B] to-[#DF6951]">
              Purwokerto
            </span>
          </h1>

          <p className="mt-6 text-[#5E6282] text-sm md:text-lg leading-relaxed max-w-lg">
            Rested in the heart of Java, Purwokerto humbles in its grace.
            Favored by wanderers who seek calm, it delights not in grandeur
            but in gentle living.
          </p>

          {/* BUTTON About US */}
          <div className="mt-8 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-pink-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <a
              href="#about"
              className="relative px-8 py-4 bg-[#0f1f56] text-white font-bold rounded-full shadow-xl hover:bg-[#162a6e] transition-all transform hover:-translate-y-1 block md:inline-block"
            >
              Explore Now
            </a>
          </div>
        </div>

        {/* ================= KOLOM KANAN: GAMBAR ================= */}
        <div className="relative flex justify-center md:justify-end order-2 md:order-2 h-[400px] md:h-auto">
          {/* Cloud-1 (Atas Kanan Tugu) */}
          <img
            src={cloud1Url}
            alt=""
            aria-hidden
            className="absolute z-0 top-0 right-10 w-[180px] opacity-60 animate-pulse md:w-[340px] md:-top-10 md:right-20"
          />

          {/* Cloud-2 (Bawah Kiri Tugu) */}
          <img
            src={cloud2Url}
            alt=""
            aria-hidden
            className="absolute z-0 bottom-10 left-0 w-[200px] opacity-60 md:w-[380px] md:bottom-20 md:-left-10"
          />

          {/* TUGU IMAGE */}
          <img
            src={tuguUrl}
            alt="Tugu Purwokerto"
            className="relative z-10 w-full max-w-[300px] md:max-w-[480px] xl:max-w-[580px] object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
