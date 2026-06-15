'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Search, Compass } from 'lucide-react';

type Category = {
  id: number;
  title: string;
  slug: string;
  badge: string;
  description: string;
  image: string;
  serviceCount: number;
};

// Menggunakan gambar asli dari Unsplash agar langsung muncul
const categories: Category[] = [
  {
    id: 1,
    title: 'Premium UI/UX Prototyping',
    slug: 'ui-ux',
    badge: 'FEATURED',
    description: 'Bring your app ideas to life with modern mockups.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop',
    serviceCount: 8,
  },
  {
    id: 2,
    title: 'Programming & Tech',
    slug: 'programming-tech',
    badge: 'TOP RATED',
    description: 'Coding assistance, web development, AI, and software engineering.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
    serviceCount: 12,
  },
  {
    id: 3,
    title: 'Cybersecurity & CTF Prep',
    slug: 'cybersecurity',
    badge: 'NEW',
    description: 'Learn ethical hacking, penetration testing, and web security.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
    serviceCount: 6,
  },
  {
    id: 4,
    title: 'Network Simulation',
    slug: 'network-simulation',
    badge: 'PRO',
    description: 'Cisco Packet Tracer, MikroTik, routing, switching, and servers.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    serviceCount: 4,
  },
  {
    id: 5,
    title: 'Video Editing',
    slug: 'video-editing',
    badge: 'HOT',
    description: 'Professional editing, motion graphics, and cinematic videos.',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop',
    serviceCount: 7,
  },
  {
    id: 6,
    title: 'Content Writing',
    slug: 'content-writing',
    badge: 'CREATIVE',
    description: 'Academic writing, blogs, copywriting, and creative content.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead27d8?q=80&w=800&auto=format&fit=crop',
    serviceCount: 5,
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mengambil parameter search dari URL (jika dialihkan dari Dashboard)
  const [search, setSearch] = useState('');

  useEffect(() => {
    const query = searchParams?.get('search');
    if (query) {
      setSearch(query);
    }
  }, [searchParams]);

  const filteredCategories = useMemo(() => {
    const keyword = search.toLowerCase();

    return categories.filter(
      (category) =>
        category.title.toLowerCase().includes(keyword) ||
        category.description.toLowerCase().includes(keyword)
    );
  }, [search]);

  return (
    <div className="bg-slate-50 dark:bg-[#090d16] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        {/* HERO SECTION */}
        <section className="text-center mb-16 space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
            Explore All Categories
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto transition-colors">
            Browse hundreds of services offered by verified students.
          </p>

          <div className="max-w-2xl mx-auto mt-10 relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What service are you looking for?"
              className="
                w-full pl-14 pr-6 py-4 sm:py-5 rounded-full 
                border border-slate-200 dark:border-slate-800 
                bg-white/80 dark:bg-slate-900/50 backdrop-blur-md
                text-slate-900 dark:text-white 
                placeholder:text-slate-400 dark:placeholder:text-slate-500
                focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 
                shadow-sm hover:shadow-md dark:shadow-none
                transition-all duration-300 text-base
              "
            />
          </div>
        </section>

        {/* EMPTY STATE */}
        {filteredCategories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-transparent">
            <Compass className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4 animate-pulse" />
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white transition-colors">
              No Categories Found
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 transition-colors">
              Try adjusting your search keyword.
            </p>
          </div>
        )}

        {/* GRID SECTION */}
        {filteredCategories.length > 0 && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => router.push(`/client/explore/${category.slug}`)}
                  className="
                    group
                    relative
                    h-[340px]
                    overflow-hidden
                    rounded-3xl
                    border border-slate-200 dark:border-slate-800
                    cursor-pointer
                    transition-all duration-500
                    hover:-translate-y-1.5
                    hover:border-primary/50 dark:hover:border-primary/50
                    hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none
                    bg-slate-200 dark:bg-slate-900
                  "
                >
                  {/* Background Image using next/image */}
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="
                      object-cover
                      transition-transform duration-700 ease-out
                      group-hover:scale-110
                    "
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Badge */}
                  <div className="absolute top-5 left-5">
                    <span
                      className="
                        px-3 py-1.5 rounded-md text-[10px] font-extrabold tracking-widest uppercase
                        bg-black/40 backdrop-blur-md
                        border border-white/10
                        text-white shadow-sm
                      "
                    >
                      {category.badge}
                    </span>
                  </div>

                  {/* Text Content Area */}
                  <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end">
                    <span
                      className="
                        inline-flex items-center w-max px-3 py-1 rounded-full text-xs font-bold
                        bg-primary/20 backdrop-blur-sm
                        border border-primary/30
                        text-primary shadow-sm
                        mb-4
                      "
                    >
                      {category.serviceCount} Services Available
                    </span>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 group-hover:text-primary transition-colors leading-tight">
                      {category.title}
                    </h2>

                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}