/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Search, Compass } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getCategoryImage } from '@/lib/images';

// 1. UBAH DI SINI: 'title' diganti jadi 'name' menyesuaikan database Anda
type Category = {
  id: string | number;
  name: string;
  slug: string;
  badge?: string;
  description?: string;
  image_url?: string;
};

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mengambil parameter search dari URL
  useEffect(() => {
    const query = searchParams?.get('search');
    if (query) {
      setSearch(query);
    }
  }, [searchParams]);

  // --- LOGIKA FETCH DATA DARI SUPABASE ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*');

        if (error) throw error;

        // Simpan data dari Supabase ke dalam state
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [supabase]);

  // 2. UBAH DI SINI: filter mencari berdasarkan category.name
  const filteredCategories = useMemo(() => {
    const keyword = search.toLowerCase();

    return categories.filter(
      (category) =>
        category.name?.toLowerCase().includes(keyword) ||
        category.description?.toLowerCase().includes(keyword)
    );
  }, [search, categories]);

  // Tampilan saat sedang loading tarik data dari Supabase
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Memuat kategori...</p>
        </div>
      </div>
    );
  }

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
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
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
                focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 
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
                    group relative h-[340px] overflow-hidden rounded-3xl
                    border border-slate-200 dark:border-slate-800 cursor-pointer
                    transition-all duration-500 hover:-translate-y-1.5
                    hover:border-cyan-500/50 dark:hover:border-cyan-500/50
                    hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none
                    bg-slate-200 dark:bg-slate-900
                  "
                >
                  {/* Background Image */}
                  <Image
                    src={category.image_url || getCategoryImage(category.name, category.slug)}
                    alt={category.name || 'Category'}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Badge */}
                  <div className="absolute top-5 left-5">
                    <span className="px-3 py-1.5 rounded-md text-[10px] font-extrabold tracking-widest uppercase bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-sm">
                      {category.badge || 'EXPLORE'}
                    </span>
                  </div>

                  {/* Text Content Area */}
                  <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end">
                    {/* 3. UBAH DI SINI: Menampilkan category.name */}
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 group-hover:text-cyan-400 transition-colors leading-tight">
                      {category.name}
                    </h2>
                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
                      {category.description || 'Jelajahi berbagai layanan menarik di kategori ini.'}
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

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16]">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ExplorePageContent />
    </Suspense>
  );
}