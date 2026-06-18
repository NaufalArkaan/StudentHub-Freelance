'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Coins,
  Search,
  MessageSquare,
  CheckCircle,
  Code2,
  Palette,
  Languages,
  BarChart3,
  GraduationCap,
  Star
} from 'lucide-react';

export default function LandingPage() {
  const featuredServices = [
    {
      title: 'Pembuatan Website Responsive (Next.js & React)',
      category: 'Programming & IT',
      price: 500000,
      freelancer: 'Ahmad Fauzi',
      university: 'Teknik Informatika, UMM',
      image: '/responsive_web.png',
    },
    {
      title: 'Desain Logo & Brand Identity Modern',
      category: 'Desain Grafis',
      price: 150000,
      freelancer: 'Siti Rahma',
      university: 'Desain Komunikasi Visual, UM',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=600&h=350',
    },
    {
      title: 'Jasa Terjemahan Dokumen Akademik (EN-ID)',
      category: 'Terjemahan',
      price: 50000,
      freelancer: 'Budi Santoso',
      university: 'Sastra Inggris, UB',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600&h=350',
    },
    {
      title: 'Data Entry & Data Analysis (Python / Excel)',
      category: 'Analisis Data',
      price: 200000,
      freelancer: 'Dewi Lestari',
      university: 'Statistika, UB',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600&h=350',
    },
  ];

  const categories = [
    {
      name: 'Programming & IT',
      count: '15+ Jasa',
      icon: <Code2 className="h-7 w-7 text-cyan-400" />,
    },
    {
      name: 'Desain Grafis',
      count: '30+ Jasa',
      icon: <Palette className="h-7 w-7 text-purple-400" />,
    },
    {
      name: 'Terjemahan',
      count: '10+ Jasa',
      icon: <Languages className="h-7 w-7 text-emerald-400" />,
    },
    {
      name: 'Analisis Data',
      count: '8+ Jasa',
      icon: <BarChart3 className="h-7 w-7 text-amber-400" />,
    },
  ];

  // Helper format harga lokal di dalam file agar mandiri
  const formatIDR = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    // Memaksa tema gelap dengan bg-[#030712] (sangat gelap/hitam)
    <div className="relative overflow-hidden bg-[#030712] text-slate-50 font-sans min-h-screen selection:bg-cyan-500/30" id="home">

      {/* --- BACKGROUND EFFECTS --- */}
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay z-0"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

      {/* Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 sm:pt-40 sm:pb-28 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-cyan-400 mb-8 backdrop-blur-md shadow-lg shadow-cyan-500/10 hover:border-cyan-500/50 transition-colors cursor-default">
          <GraduationCap className="h-4 w-4 animate-pulse" />
          Marketplace Jasa Akademik Terbesar di Kampus
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.15]">
          <span className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Solusi Jasa Mahasiswa,
          </span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Oleh Mahasiswa
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 mb-10 leading-relaxed font-medium">
          Platform penyedia freelance profesional dari mahasiswa untuk kebutuhan bisnis, riset, dan akademik. Berkualitas tinggi, terverifikasi KTM, dan ramah kantong.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link href="#explore" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 group">
              Jelajahi Sekarang
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 backdrop-blur-md transition-all duration-300">
              Gabung Menjadi Freelancer
            </button>
          </Link>
        </div>
      </section>

      {/* --- FEATURED SERVICES --- */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24" id="explore">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <span className="inline-block px-3 py-1 mb-4 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest">
              Layanan Populer
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Layanan Unggulan</h2>
            <p className="text-sm text-slate-400 mt-3 max-w-md font-medium leading-relaxed">
              Jasa terbaik pilihan klien yang dikerjakan langsung oleh mahasiswa ahli di bidangnya.
            </p>
          </div>
          <Link href="#explore" className="text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors group">
            Lihat Semua Jasa
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredServices.map((service, index) => (
            <div key={index} className="flex flex-col bg-[#0B1121]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-2 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-500 group cursor-pointer">
              <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-grid-pattern z-0" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.image}
                  alt={service.title}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100 z-10"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white/10 z-20">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] font-bold text-white">5.0</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <span className="w-fit text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-cyan-400 mb-3">
                  {service.category}
                </span>
                <h3 className="text-sm font-bold leading-relaxed text-white group-hover:text-cyan-400 transition-colors line-clamp-2 mb-4">
                  {service.title}
                </h3>
                <div className="mt-auto pt-4 border-t border-white/5">
                  <p className="text-xs text-slate-300 font-bold">{service.freelancer}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{service.university}</p>
                </div>
                <div className="mt-4 flex justify-between items-center bg-black/30 -mx-5 -mb-5 px-5 py-4 border-t border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mulai dari</span>
                  <span className="text-sm font-black text-cyan-400">{formatIDR(service.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- WHY CHOOSE US (MOCKUP) --- */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5" id="about">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Visual Showcase (Sleek Dark Mockup) */}
          <div className="relative rounded-3xl border border-white/10 bg-[#0B1121]/50 p-6 shadow-2xl overflow-hidden group backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-[70%] h-[70%] bg-blue-500/10 rounded-full filter blur-[80px] pointer-events-none" />

            {/* Fake Browser/IDE Window */}
            <div className="aspect-video w-full rounded-xl bg-[#050810] flex flex-col justify-between border border-white/10 overflow-hidden shadow-2xl relative z-10">
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 bg-white/[0.02]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="px-4 py-1 rounded-md bg-black/50 border border-white/5 text-[10px] font-bold text-slate-500 tracking-wider">
                  studenthub.id
                </div>
              </div>
              <div className="flex-grow flex flex-col justify-center items-center py-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_60%)]" />
                <GraduationCap className="h-16 w-16 text-cyan-400 mb-4 animate-bounce relative z-10 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                <span className="text-base font-black text-white relative z-10 tracking-wide">Ekosistem Marketplace Mahasiswa</span>
                <span className="text-[11px] font-bold text-slate-500 mt-2 tracking-widest uppercase relative z-10">
                  Verified NIM • Secured Escrow
                </span>
              </div>
            </div>

            {/* Hover overlay stats */}
            <div className="mt-8 flex justify-around text-center text-xs border-t border-white/10 pt-8 relative z-10">
              <div>
                <p className="font-black text-white text-2xl drop-shadow-md">4.9/5</p>
                <p className="text-cyan-400 font-black text-[9px] uppercase tracking-widest mt-2">Rating Klien</p>
              </div>
              <div>
                <p className="font-black text-white text-2xl drop-shadow-md">100%</p>
                <p className="text-cyan-400 font-black text-[9px] uppercase tracking-widest mt-2">NIM Tervalidasi</p>
              </div>
              <div>
                <p className="font-black text-white text-2xl drop-shadow-md">&lt; 24h</p>
                <p className="text-cyan-400 font-black text-[9px] uppercase tracking-widest mt-2">Respon Cepat</p>
              </div>
            </div>
          </div>

          {/* Benefits Info */}
          <div className="space-y-10">
            <div>
              <span className="inline-block px-3 py-1 mb-4 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                Keuntungan Utama
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-[1.15]">
                Platform terpercaya ekosistem kampus
              </h2>
              <p className="text-slate-400 mt-5 text-base leading-relaxed font-medium">
                Kami membangun StudentHub dengan mengutamakan keamanan transaksi dan kredibilitas talenta. Setiap freelancer adalah mahasiswa aktif yang terverifikasi.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-5 items-start group">
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Verifikasi NIM Resmi</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">Setiap penyedia jasa wajib melewati verifikasi KTM/NIM aktif untuk memastikan validitas profil akademisnya.</p>
                </div>
              </div>

              <div className="flex gap-5 items-start group">
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Sistem Rekening Bersama (Escrow)</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">Dana Anda aman di escrow platform dan hanya akan diteruskan ke freelancer setelah Anda menyetujui hasil kerjanya.</p>
                </div>
              </div>

              <div className="flex gap-5 items-start group">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <Coins className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Harga Bersahabat</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">Dapatkan tarif jasa yang disesuaikan dengan anggaran mahasiswa dan UKM, tanpa kompromi pada kualitas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-32 border-t border-white/5 bg-[#050810]/50" id="how-it-works">
        <div className="text-center mb-20 relative z-10">
          <span className="inline-block px-3 py-1 mb-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            Alur Penggunaan
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">Simpel & Sangat Aman</h2>
          <p className="text-base text-slate-400 mt-4 max-w-lg mx-auto font-medium">Tiga langkah mudah untuk menyelesaikan tugas akademis maupun proyek bisnis Anda bersama StudentHub.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-slate-700 to-transparent z-0" />

          {/* Step 1 */}
          <div className="text-center relative z-10 flex flex-col items-center group">
            <div className="w-24 h-24 rounded-full bg-[#0B1121] border border-white/10 flex items-center justify-center mb-8 group-hover:border-cyan-500 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300">
              <Search className="h-10 w-10 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <div className="absolute top-[-20px] right-[25%] md:right-[30%] text-[100px] font-black text-white/[0.03] select-none -z-10 group-hover:text-cyan-500/10 transition-colors duration-500">1</div>
            <h3 className="text-xl font-black text-white mb-3">Cari & Pilih</h3>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed font-medium">
              Temukan jenis layanan yang Anda butuhkan, filter berdasarkan kategori, dan pilih freelancer mahasiswa terbaik.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center relative z-10 flex flex-col items-center group">
            <div className="w-24 h-24 rounded-full bg-[#0B1121] border border-white/10 flex items-center justify-center mb-8 group-hover:border-purple-500 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300">
              <MessageSquare className="h-10 w-10 text-slate-400 group-hover:text-purple-400 transition-colors" />
            </div>
            <div className="absolute top-[-20px] right-[25%] md:right-[30%] text-[100px] font-black text-white/[0.03] select-none -z-10 group-hover:text-purple-500/10 transition-colors duration-500">2</div>
            <h3 className="text-xl font-black text-white mb-3">Pesan & Diskusi</h3>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed font-medium">
              Diskusikan detail proyek secara langsung melalui chat, tetapkan spesifikasi, dan sepakati tenggat waktu.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center relative z-10 flex flex-col items-center group">
            <div className="w-24 h-24 rounded-full bg-[#0B1121] border border-white/10 flex items-center justify-center mb-8 group-hover:border-emerald-500 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300">
              <CheckCircle className="h-10 w-10 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="absolute top-[-20px] right-[25%] md:right-[30%] text-[100px] font-black text-white/[0.03] select-none -z-10 group-hover:text-emerald-500/10 transition-colors duration-500">3</div>
            <h3 className="text-xl font-black text-white mb-3">Terima Hasil</h3>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed font-medium">
              Periksa hasil pengerjaan, setujui, dan dana baru akan dicairkan ke freelancer setelah Anda merasa puas.
            </p>
          </div>
        </div>
      </section>

      {/* --- CATEGORIES --- */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 mb-4 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">
            Kategori Utama
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Eksplorasi Keahlian</h2>
          <p className="text-sm text-slate-400 mt-4 max-w-md mx-auto font-medium">Kami menyediakan talenta dari berbagai disiplin ilmu akademis.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <div key={index} className="p-8 rounded-2xl bg-[#0B1121]/80 backdrop-blur-md border border-white/10 hover:border-cyan-500/50 flex flex-col items-center text-center gap-5 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300 cursor-pointer group">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors mb-1">{cat.name}</h3>
                <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">{cat.count} Tersedia</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-20">
        <div className="relative rounded-[2rem] overflow-hidden p-10 sm:p-16 md:p-20 bg-gradient-to-br from-blue-900 to-indigo-950 border border-blue-500/20 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.2),transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

          <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 relative z-10 drop-shadow-lg leading-tight">
            Mulai Perjalanan Akademik <br className="hidden sm:block" /> Lebih Mudah
          </h2>
          <p className="text-base sm:text-lg font-medium text-blue-100 max-w-2xl mx-auto mb-10 relative z-10 leading-relaxed opacity-90">
            Temukan mahasiswa bertalenta untuk membantu proyekmu, atau daftarkan keahlianmu sekarang untuk mendapatkan penghasilan tambahan di sela-sela waktu kuliah.
          </p>
          <div className="relative z-10 flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/register">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-blue-900 font-black text-sm hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300">
                Daftar Sebagai Klien
              </button>
            </Link>
            <Link href="/register">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-black text-sm hover:bg-white/20 backdrop-blur-md transition-all duration-300">
                Mulai Freelance
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}