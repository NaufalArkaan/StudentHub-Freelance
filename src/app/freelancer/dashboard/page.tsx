'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { GraduationCap, LogOut, Briefcase, DollarSign, Star, FileText } from 'lucide-react';
import { formatPrice } from '@/lib/utils/utils';

export default function FreelancerDashboard() {
  const [email, setEmail] = React.useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || null);
      }
    };
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#090d16] p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
              <GraduationCap className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                Freelancer Dashboard
                <Badge variant="success" className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Freelancer</Badge>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Selamat datang kembali, <span className="text-slate-200 font-semibold">{email || 'memuat...'}</span>
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10">
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{formatPrice(0)}</h3>
              <p className="text-xs text-slate-500">Pendapatan Saya</p>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">0</h3>
              <p className="text-xs text-slate-500">Pesanan Aktif</p>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">0.0</h3>
              <p className="text-xs text-slate-500">Rating Ulasan</p>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">0</h3>
              <p className="text-xs text-slate-500">Jasa Ditawarkan</p>
            </div>
          </Card>
        </div>

        {/* Mock Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Jasa Saya</CardTitle>
                <CardDescription>Kelola layanan yang Anda tawarkan ke client.</CardDescription>
              </div>
              <Button size="sm" variant="secondary">+ Tambah Jasa</Button>
            </CardHeader>
            <CardContent className="h-48 flex flex-col justify-center items-center text-center text-slate-500">
              <Briefcase className="h-10 w-10 text-slate-700 mb-3" />
              <p className="text-sm font-semibold">Belum Menawarkan Jasa</p>
              <p className="text-xs mt-1 text-slate-650">Mulai buat layanan pertama Anda untuk mendapatkan pesanan.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Portofolio</CardTitle>
              <CardDescription>Verifikasi dokumen keahlian Anda oleh Admin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Portofolio Awal</span>
                  <Badge variant="warning" className="text-[9px]">Menunggu Verifikasi</Badge>
                </div>
                <p className="text-[10px] text-slate-400">Berkas portofolio Anda sedang diproses oleh admin. Proses verifikasi biasanya memakan waktu 1x24 jam.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
