'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { GraduationCap, LogOut, ShoppingBag, MessageSquare, Heart, Clock } from 'lucide-react';

export default function ClientDashboard() {
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
            <div className="w-12 h-12 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
              <GraduationCap className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                Client Dashboard
                <Badge variant="primary" className="text-[10px]">Client</Badge>
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
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">0</h3>
              <p className="text-xs text-slate-500">Total Pesanan</p>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">0</h3>
              <p className="text-xs text-slate-500">Menunggu Respon</p>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">0</h3>
              <p className="text-xs text-slate-500">Diskusi Aktif</p>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg text-red-400 border border-red-500/20">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">0</h3>
              <p className="text-xs text-slate-500">Jasa Disukai</p>
            </div>
          </Card>
        </div>

        {/* Mock Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pesanan Terbaru</CardTitle>
              <CardDescription>Daftar pesanan jasa mahasiswa Anda.</CardDescription>
            </CardHeader>
            <CardContent className="h-48 flex flex-col justify-center items-center text-center text-slate-500">
              <ShoppingBag className="h-10 w-10 text-slate-700 mb-3" />
              <p className="text-sm font-semibold">Belum Ada Pesanan</p>
              <p className="text-xs mt-1 text-slate-650">Jelajahi landing page untuk mencari jasa mahasiswa yang Anda butuhkan.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rekomendasi Freelancer</CardTitle>
              <CardDescription>Mahasiswa bertalenta tinggi di kampus.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Ahmad Fauzi</p>
                  <p className="text-[10px] text-slate-500">Programming & IT</p>
                </div>
                <Badge variant="primary" className="text-[9px]">4.9 ★</Badge>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Siti Rahma</p>
                  <p className="text-[10px] text-slate-500">Desain Grafis</p>
                </div>
                <Badge variant="primary" className="text-[9px]">5.0 ★</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
