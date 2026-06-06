import * as React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
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
  Users,
  GraduationCap
} from 'lucide-react';
import { formatPrice } from '@/lib/utils/utils';

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
      icon: <Code2 className="h-6 w-6 text-blue-500" />,
    },
    {
      name: 'Desain Grafis',
      count: '30+ Jasa',
      icon: <Palette className="h-6 w-6 text-purple-500" />,
    },
    {
      name: 'Terjemahan',
      count: '10+ Jasa',
      icon: <Languages className="h-6 w-6 text-emerald-500" />,
    },
    {
      name: 'Analisis Data',
      count: '8+ Jasa',
      icon: <BarChart3 className="h-6 w-6 text-amber-500" />,
    },
  ];

  return (
    <div className="relative overflow-hidden" id="home">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[5%] w-[80%] h-[60%] blue-glow pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[60%] h-[50%] blue-glow pointer-events-none z-0 opacity-50" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 sm:pt-40 sm:pb-28 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-6 animate-pulse">
          <GraduationCap className="h-4 w-4" />
          Marketplace Jasa Akademik Terbesar
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Solusi Jasa Mahasiswa,
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Oleh Mahasiswa
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 mb-10 leading-relaxed">
          Platform penyedia freelance profesional dari mahasiswa untuk kebutuhan bisnis, riset, dan akademik. Berkualitas tinggi, berlisensi NIM, dan ramah kantong.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/#explore">
            <Button variant="gradient" size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2">
              Jelajahi Sekarang
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Gabung Menjadi Freelancer
            </Button>
          </Link>
        </div>
      </section>

      {/* Layanan Unggulan (Featured Services) */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-900" id="explore">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <Badge variant="primary" className="mb-3">Layanan Populer</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Layanan Unggulan</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-md">Jasa terbaik pilihan klien yang dikerjakan langsung oleh mahasiswa ahli.</p>
          </div>
          <Link href="/#explore" className="text-sm font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1 mt-4 md:mt-0">
            Lihat Semua Jasa
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredServices.map((service, index) => (
            <Card key={index} hoverEffect className="flex flex-col overflow-hidden h-full">
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                {/* Fallback pattern for images */}
                <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10 bg-grid-pattern" />
                  <span className="text-xs text-slate-500 uppercase tracking-widest">{service.category}</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 hover:opacity-100"
                />
              </div>
              <CardHeader className="p-5 flex-grow space-y-2">
                <Badge variant="outline" className="w-fit text-[10px] uppercase font-bold tracking-wider">{service.category}</Badge>
                <CardTitle className="text-sm font-bold leading-snug line-clamp-2 text-slate-100 hover:text-blue-400 transition-colors">
                  {service.title}
                </CardTitle>
                <div className="pt-2">
                  <p className="text-xs text-slate-400 font-semibold">{service.freelancer}</p>
                  <p className="text-[10px] text-slate-500">{service.university}</p>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 mt-auto border-t border-slate-900/50 flex justify-between items-center">
                <span className="text-xs text-slate-500">Mulai dari</span>
                <span className="text-sm font-bold text-blue-400">{formatPrice(service.price)}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Choose StudentHub */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-900" id="about">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual Showcase (Mockup mockup) */}
          <div className="relative rounded-xl border border-slate-800 bg-[#0c1322] p-4 sm:p-6 shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none" />
            <div className="aspect-video w-full rounded-lg bg-slate-950 flex flex-col justify-between border border-slate-900 p-6 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="px-3 py-1 rounded bg-slate-900 text-[10px] text-slate-500">studenthub.id</div>
              </div>
              <div className="flex-grow flex flex-col justify-center items-center py-4 text-center">
                <GraduationCap className="h-10 w-10 text-blue-500 mb-2 animate-bounce" />
                <span className="text-xs font-semibold text-slate-300">Ekosistem Marketplace Mahasiswa</span>
                <span className="text-[10px] text-slate-500 mt-1">Verified NIM • Secured Payment Escrow</span>
              </div>
            </div>
            {/* Hover overlay text */}
            <div className="mt-6 flex justify-around text-center text-xs border-t border-slate-900 pt-6">
              <div>
                <p className="font-bold text-white">4.8/5</p>
                <p className="text-slate-500 text-[10px] uppercase">Rating Rata-rata</p>
              </div>
              <div>
                <p className="font-bold text-white">100%</p>
                <p className="text-slate-500 text-[10px] uppercase">Mahasiswa Aktif</p>
              </div>
              <div>
                <p className="font-bold text-white">&lt; 24 Jam</p>
                <p className="text-slate-500 text-[10px] uppercase">Respon Rata-rata</p>
              </div>
            </div>
          </div>

          {/* Benefits Info */}
          <div className="space-y-8">
            <div>
              <Badge variant="primary" className="mb-3">Keuntungan Utama</Badge>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Platform terpercaya khusus ekosistem kampus
              </h2>
              <p className="text-slate-400 mt-4 leading-relaxed">
                Kami membangun StudentHub dengan mengutamakan keamanan transaksi dan kredibilitas talenta. Setiap freelancer adalah mahasiswa aktif yang terverifikasi.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Verifikasi NIM (Nomor Induk Mahasiswa)</h3>
                  <p className="text-sm text-slate-400 mt-1">Setiap akun penyedia jasa wajib melewati verifikasi NIM aktif demi memastikan validitas profil akademisnya.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Sistem Rekening Bersama Aman</h3>
                  <p className="text-sm text-slate-400 mt-1">Dana Anda akan disimpan di escrow platform dan hanya akan dicairkan ke mahasiswa setelah Anda menyetujui hasil kerjanya.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Harga Terjangkau & Berkualitas</h3>
                  <p className="text-sm text-slate-400 mt-1">Dapatkan tarif jasa yang bersahabat disesuaikan dengan anggaran mahasiswa dan bisnis UKM, tanpa kompromi kualitas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-900" id="how-it-works">
        <div className="text-center mb-16">
          <Badge variant="primary" className="mb-3">Alur Penggunaan</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Cara Kerja yang Simpel & Aman</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">Tiga langkah mudah untuk menyelesaikan tugas akademis maupun proyek bisnis Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[35px] left-[15%] right-[15%] h-[1px] bg-slate-800 z-0" />

          {/* Step 1 */}
          <div className="text-center relative z-10 flex flex-col items-center group">
            <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center mb-6 group-hover:border-blue-500 transition-colors shadow-lg">
              <Search className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="absolute top-0 right-[40%] text-6xl font-black text-slate-900 select-none -z-10 group-hover:text-slate-850 transition-colors">1</div>
            <h3 className="text-lg font-bold text-white">Cari & Pilih</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xs">
              Temukan jenis layanan yang Anda butuhkan, filter berdasarkan kategori, dan pilih freelancer terbaik.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center relative z-10 flex flex-col items-center group">
            <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center mb-6 group-hover:border-blue-500 transition-colors shadow-lg">
              <MessageSquare className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="absolute top-0 right-[40%] text-6xl font-black text-slate-900 select-none -z-10 group-hover:text-slate-850 transition-colors">2</div>
            <h3 className="text-lg font-bold text-white">Pesan & Diskusi</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xs">
              Diskusikan detail proyek Anda secara langsung, tetapkan kebutuhan spesifik, dan tentukan tenggat waktu pengerjaan.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center relative z-10 flex flex-col items-center group">
            <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center mb-6 group-hover:border-blue-500 transition-colors shadow-lg">
              <CheckCircle className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="absolute top-0 right-[40%] text-6xl font-black text-slate-900 select-none -z-10 group-hover:text-slate-850 transition-colors">3</div>
            <h3 className="text-lg font-bold text-white">Terima Hasil</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xs">
              Periksa hasil pengerjaan, berikan persetujuan, lalu cairkan pembayaran jika Anda sudah puas dengan hasilnya.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-900">
        <div className="text-center mb-16">
          <Badge variant="primary" className="mb-3">Kategori</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Eksplorasi Berbagai Kategori</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">Kami menyediakan talenta dari berbagai bidang keahlian akademis untuk membantu Anda.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <Card key={index} hoverEffect className="p-6 flex flex-col items-start gap-4">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                {cat.icon}
              </div>
              <div>
                <CardTitle className="text-base font-bold">{cat.name}</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1">{cat.count} Tersedia</CardDescription>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-2xl overflow-hidden p-8 sm:p-12 md:p-16 bg-gradient-to-r from-blue-900/60 to-indigo-950/60 border border-blue-500/20 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent_50%)]" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 relative z-10">
            Mulai Perjalanan Akademik yang Lebih Mudah
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8 relative z-10">
            Temukan mahasiswa bertalenta untuk membantu proyek Anda, atau mulailah menawarkan keahlian Anda untuk mendapatkan penghasilan tambahan di kampus.
          </p>
          <div className="relative z-10">
            <Link href="/register">
              <Button variant="gradient" size="lg" className="px-8 shadow-xl">
                Daftar Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
