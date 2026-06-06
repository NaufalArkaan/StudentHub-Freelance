import * as React from 'react';
import Link from 'next/link';
import { GraduationCap, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#070b13] border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                <GraduationCap className="h-4 w-4 text-blue-500" />
              </div>
              <span className="text-base font-bold text-white">
                Student<span className="text-blue-500">Hub</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Platform penyedia freelance profesional dari mahasiswa untuk kebutuhan bisnis dan akademik. Menghubungkan mahasiswa bertalenta dengan peluang nyata.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Layanan</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#explore" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Cari Jasa
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Gabung Freelancer
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Cara Kerja
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Kebijakan & Bantuan</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Kebijakan Privasi
                </span>
              </li>
              <li>
                <span className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Syarat & Ketentuan
                </span>
              </li>
              <li>
                <span className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Hubungi Bantuan
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            &copy; {new Date().getFullYear()} StudentHub Service Marketplace. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-white transition-colors"
            >
              <Globe className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
