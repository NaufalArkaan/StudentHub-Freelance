import * as React from 'react';
import Link from 'next/link';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { GraduationCap, UserCheck, Briefcase } from 'lucide-react';

export default function RegisterSelectorPage() {
  return (
    <Card className="border-slate-800 bg-[#0e1626]/80 backdrop-blur-md shadow-2xl p-2">
      <CardHeader className="text-center pb-8 pt-8">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-500/20 mb-4">
          <GraduationCap className="h-6 w-6 text-blue-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-white">StudentHub</CardTitle>
        <CardDescription className="text-xs text-slate-400 mt-1">
          Academic Excellence & Networking
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-bold text-white">Pilih Jenis Akun</h2>
          <p className="text-xs text-slate-400 mt-1">
            Bagaimana Anda ingin menggunakan platform ini?
          </p>
        </div>

        <div className="space-y-4">
          {/* Client Selector Card */}
          <Link href="/register/client" className="block">
            <div className="flex items-center gap-4 p-5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500/50 transition-all cursor-pointer group">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors">
                  Client (Pencari Jasa)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Saya ingin mencari talenta mahasiswa untuk proyek saya.
                </p>
              </div>
            </div>
          </Link>

          {/* Freelancer Selector Card */}
          <Link href="/register/freelancer" className="block">
            <div className="flex items-center gap-4 p-5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500/50 transition-all cursor-pointer group">
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors">
                  Freelancer (Penyedia Jasa)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Saya mahasiswa yang ingin menawarkan keahlian dan mencari penghasilan.
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-8 text-sm text-slate-400">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-blue-500 hover:underline font-medium">
            Kembali ke Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
