import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'StudentHub | Academic Service Marketplace',
  description: 'Platform marketplace jasa mahasiswa untuk menghubungkan mahasiswa yang membutuhkan jasa dengan mahasiswa bertalenta yang menawarkan jasa profesional.',
  keywords: ['marketplace mahasiswa', 'jasa mahasiswa', 'freelance mahasiswa', 'freelancer kampus', 'studenthub'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-[#090d16] text-[#f8fafc] antialiased">
        {children}
      </body>
    </html>
  );
}
