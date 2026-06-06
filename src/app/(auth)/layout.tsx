import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#090d16] px-4 py-12">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">
          <ArrowLeft className="h-4 w-4 text-blue-500" />
          Kembali ke Beranda
        </Link>
      </div>

      {/* Auth Content */}
      <div className="w-full max-w-[480px] z-10">
        {children}
      </div>
    </div>
  );
}
