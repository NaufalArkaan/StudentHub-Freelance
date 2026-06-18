/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronDown, Heart, Star, Terminal } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ClientExplore() {
    const router = useRouter();
    const params = useParams();
    const supabase = createClient();

    // 1. DYNAMIC CATEGORY CONFIG
    const categorySlug = (params?.category as string) || 'programming-tech';

    const categoryConfig: Record<string, { title: string; desc: string }> = {
        'programming-tech': {
            title: 'Programming & Tech Services',
            desc: 'Connect with skilled student developers for everything from quick bug fixes to full-stack applications and AI models.',
        },
        'cybersecurity': {
            title: 'Cybersecurity & CTF Services',
            desc: 'Learn ethical hacking, penetration testing, and secure your systems with top student experts.',
        },
        'ui-ux': {
            title: 'Premium UI/UX Prototyping',
            desc: 'Bring your app ideas to life with modern mockups and interactive prototypes.',
        },
        'web-development': {
            title: 'Web Development',
            desc: 'Create stunning and responsive websites tailored to your business needs.',
        },
        'default': {
            title: 'Explore Services',
            desc: 'Browse hundreds of services offered by verified students across all departments.',
        }
    };

    const currentCategory = categoryConfig[categorySlug] || categoryConfig['default'];

    // 2. STATES
    const [services, setServices] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [favorites, setFavorites] = React.useState<Record<number, boolean>>({});
    const [currentPage, setCurrentPage] = React.useState(1);

    const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
    const toggleDropdown = (menu: string) => setOpenDropdown(prev => prev === menu ? null : menu);

    const [activeTech, setActiveTech] = React.useState('All');
    const [activeDelivery, setActiveDelivery] = React.useState('Any Time');
    const [activeBudget, setActiveBudget] = React.useState('Any Budget');
    const [activeSort, setActiveSort] = React.useState('Recommended');

    const deliveryOptions = ['Any Time', '24 Hours', 'Up to 3 Days', 'Up to 7 Days'];
    const budgetOptions = ['Any Budget', 'Under Rp 50k', 'Rp 50k - Rp 150k', 'Over Rp 150k'];
    const sortOptions = ['Recommended', 'Highest Rated', 'Lowest Price'];

    const toggleFavorite = (id: number) => {
        setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // 3. FETCH DATA DARI SUPABASE
    React.useEffect(() => {
        const fetchServices = async () => {
            setIsLoading(true);
            try {
                // KOREKSI DI SINI: Menghapus alias :freelancer_id agar join langsung ke tabel profiles
                const { data, error } = await supabase
                    .from('services')
                    .select(`
                        *,
                        profiles (
                            full_name, 
                            avatar_url
                        )
                    `);

                if (error) throw error;

                // Mapping data ke format UI
                const formattedServices = (data || []).map((srv: any) => ({
                    id: srv.id,
                    title: srv.title || srv.name || 'Untitled Service',
                    freelancerName: srv.profiles?.full_name || 'Freelancer',
                    freelancerAvatar: srv.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${srv.freelancer_id}`,
                    rating: srv.rating || 5.0,
                    price: `Rp ${(srv.price || 0).toLocaleString('id-ID')}`,
                    priceNum: srv.price || 0,
                    deliveryDays: srv.delivery_time || 3,
                    coverImage: srv.image_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
                    tag: srv.tag || 'General',
                }));

                setServices(formattedServices);
            } catch (error) {
                console.error("Gagal menarik data services:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchServices();
    }, [supabase]);

    // 4. LOGIKA FILTER & SORTING
    const techStacks = ['All', ...Array.from(new Set(services.map((s) => s.tag)))];

    const processedServices = [...services].filter((service) => {
        if (activeTech !== 'All' && service.tag !== activeTech) return false;

        if (activeBudget === 'Under Rp 50k' && service.priceNum >= 50000) return false;
        if (activeBudget === 'Rp 50k - Rp 150k' && (service.priceNum < 50000 || service.priceNum > 150000)) return false;
        if (activeBudget === 'Over Rp 150k' && service.priceNum <= 150000) return false;

        if (activeDelivery === '24 Hours' && service.deliveryDays > 1) return false;
        if (activeDelivery === 'Up to 3 Days' && service.deliveryDays > 3) return false;
        if (activeDelivery === 'Up to 7 Days' && service.deliveryDays > 7) return false;

        return true;
    });

    if (activeSort === 'Highest Rated') {
        processedServices.sort((a, b) => b.rating - a.rating);
    } else if (activeSort === 'Lowest Price') {
        processedServices.sort((a, b) => a.priceNum - b.priceNum);
    }

    // 5. PAGINATION LOGIC
    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.ceil(processedServices.length / ITEMS_PER_PAGE) || 1;
    const validCurrentPage = Math.min(currentPage, totalPages);

    const paginatedServices = processedServices.slice(
        (validCurrentPage - 1) * ITEMS_PER_PAGE,
        validCurrentPage * ITEMS_PER_PAGE
    );

    React.useEffect(() => {
        setCurrentPage(1);
    }, [activeTech, activeBudget, activeDelivery, activeSort]);

    // Tampilan Loading
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">Menyiapkan Katalog Layanan...</p>
                </div>
            </div>
        );
    }

    // 6. KOMPONEN UI UTAMA
    return (
        <div className="bg-slate-50 dark:bg-[#090d16] min-h-screen pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">

                {/* Header Section */}
                <div className="space-y-4">
                    <button
                        onClick={() => router.push('/client/explore')}
                        className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                    >
                        <ChevronLeft className="h-4 w-4" /> Back to Categories
                    </button>

                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors">
                            {currentCategory.title}
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                            {currentCategory.desc}
                        </p>
                    </div>
                </div>

                {/* Filter Toolbar Terpadu */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111827] shadow-sm relative z-20">
                    <div className="flex flex-wrap items-center gap-3">

                        {/* Tech Stack Dropdown */}
                        <div className="relative">
                            <button onClick={() => toggleDropdown('tech')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f2937] dark:hover:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-200 transition-colors">
                                Tag: <span className="text-cyan-500">{activeTech}</span>
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === 'tech' ? 'rotate-180' : ''}`} />
                            </button>
                            {openDropdown === 'tech' && (
                                <div className="absolute top-full left-0 mt-2 w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] shadow-lg py-2 z-30">
                                    {techStacks.map((tech) => (
                                        <button key={tech} onClick={() => { setActiveTech(tech); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${activeTech === tech ? 'text-cyan-500 bg-cyan-500/10' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                                            {tech}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Delivery Time Dropdown */}
                        <div className="relative">
                            <button onClick={() => toggleDropdown('delivery')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f2937] dark:hover:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-200 transition-colors">
                                Delivery: <span className="font-normal">{activeDelivery}</span>
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === 'delivery' ? 'rotate-180' : ''}`} />
                            </button>
                            {openDropdown === 'delivery' && (
                                <div className="absolute top-full left-0 mt-2 w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] shadow-lg py-2 z-30">
                                    {deliveryOptions.map((opt) => (
                                        <button key={opt} onClick={() => { setActiveDelivery(opt); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${activeDelivery === opt ? 'text-cyan-500 bg-cyan-500/10' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Budget Dropdown */}
                        <div className="relative">
                            <button onClick={() => toggleDropdown('budget')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f2937] dark:hover:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-200 transition-colors">
                                Budget: <span className="font-normal">{activeBudget}</span>
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === 'budget' ? 'rotate-180' : ''}`} />
                            </button>
                            {openDropdown === 'budget' && (
                                <div className="absolute top-full left-0 mt-2 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] shadow-lg py-2 z-30">
                                    {budgetOptions.map((opt) => (
                                        <button key={opt} onClick={() => { setActiveBudget(opt); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${activeBudget === opt ? 'text-cyan-500 bg-cyan-500/10' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sort Section */}
                    <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800 relative">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Sort By:</span>
                        <button onClick={() => toggleDropdown('sort')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-200 transition-colors">
                            {activeSort} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === 'sort' ? 'rotate-180' : ''}`} />
                        </button>
                        {openDropdown === 'sort' && (
                            <div className="absolute top-full right-0 mt-2 w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] shadow-lg py-2 z-30">
                                {sortOptions.map((opt) => (
                                    <button key={opt} onClick={() => { setActiveSort(opt); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${activeSort === opt ? 'text-cyan-500 bg-cyan-500/10' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid of Cards */}
                {paginatedServices.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
                        {paginatedServices.map((service) => {
                            const isFav = !!favorites[service.id];

                            return (
                                <div
                                    key={service.id}
                                    onClick={() => router.push(`/client/service/${service.id}`)}
                                    className="group rounded-3xl border border-slate-200 bg-white hover:border-cyan-500/50 dark:border-slate-800 dark:bg-[#111827] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md dark:shadow-none cursor-pointer"
                                >
                                    {/* Cover Image Area */}
                                    <div className="relative h-44 border-b border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-200 dark:bg-slate-800">
                                        <Image
                                            src={service.coverImage}
                                            alt={service.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        <div className="absolute bottom-3 left-4">
                                            <span className="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-widest border border-white/20 shadow-sm">
                                                {service.tag}
                                            </span>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(service.id);
                                            }}
                                            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors z-10 shadow-sm ${isFav ? 'bg-red-50 text-red-500 border border-red-200 dark:bg-red-500/20 dark:border-red-500/30' : 'bg-white/90 text-slate-400 hover:text-red-500 border border-slate-200 dark:bg-slate-900/80 dark:text-slate-500 dark:hover:text-white dark:border-slate-700'}`}
                                        >
                                            <Heart className={`h-4.5 w-4.5 transition-transform hover:scale-110 ${isFav ? 'fill-red-500' : ''}`} />
                                        </button>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Image
                                                        src={service.freelancerAvatar}
                                                        alt={service.freelancerName}
                                                        width={24}
                                                        height={24}
                                                        className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                                    />
                                                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{service.freelancerName}</span>
                                                </div>
                                                <div className="flex items-center gap-0.5 text-[10px] font-extrabold text-amber-500">
                                                    <Star className="h-3 w-3 fill-amber-500" />
                                                    <span>{service.rating}</span>
                                                </div>
                                            </div>
                                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors line-clamp-2 leading-snug">
                                                {service.title}
                                            </h3>
                                        </div>
                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <div>
                                                <p className="text-[9px] text-slate-500 dark:text-slate-400 tracking-wider uppercase font-semibold">Mulai Dari</p>
                                                <p className="text-sm font-extrabold text-cyan-500">{service.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="py-20 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-white dark:bg-transparent shadow-sm">
                        <Terminal className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Belum ada layanan di kategori ini</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Freelancer sedang menyiapkan layanan terbaik mereka.</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-8 pb-4">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, validCurrentPage - 1))}
                            disabled={validCurrentPage === 1}
                            className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-[#111827] dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-colors shadow-sm ${validCurrentPage === page ? 'bg-cyan-500 text-white border border-cyan-500' : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-[#111827] dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-white'}`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, validCurrentPage + 1))}
                            disabled={validCurrentPage === totalPages}
                            className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-[#111827] dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
                        >
                            <ChevronLeft className="h-4 w-4 rotate-180" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}