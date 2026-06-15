'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Star, Clock, RefreshCw, Flag, MessageSquare } from 'lucide-react';
import PaymentModal from './components/PaymentModal';
import PaymentSuccessModal from './components/PaymentSuccessModal';

// ============================================================================
// 1. DATA TYPES (Production Strict Typing)
// ============================================================================
type Freelancer = {
    id: string;
    name: string;
    major: string;
    avatar: string;
    rating: number;
    reviewCount: number;
};

type Review = {
    id: string;
    userName: string;
    userAvatar: string;
    rating: number;
    date: string;
    comment: string;
};

type SimilarService = {
    id: number;
    title: string;
    freelancerName: string;
    rating: number;
    price: number;
    image: string;
};

type Service = {
    id: number;
    title: string;
    description: string;
    image: string;
    price: number;
    deliveryDays: number;
    revisions: number;
    categorySlug: string;
    freelancer: Freelancer;
    reviews: Review[];
    similarServices: SimilarService[];
};

// ============================================================================
// 2. DATA FETCHING LAYER (Supabase Ready)
// ============================================================================
const fetchServiceDetail = async (id: string): Promise<Service> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: Number(id),
                title: "Mentorship & Debugging Java, Data Structures, dan React App",
                description: "Stuck on a tricky data structure assignment or trying to connect your React frontend to a Java backend? I offer comprehensive mentorship and debugging sessions tailored to computer science students and self-taught developers.\n\nMy expertise covers core Java (OOP, multithreading), complex Data Structures (Trees, Graphs, Hash Maps), and modern frontend development using React and Tailwind CSS. We don't just fix the bugs; we break down the 'why' so you can confidently tackle future challenges.",
                image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
                price: 100000,
                deliveryDays: 3,
                revisions: 2,
                categorySlug: "programming-tech",
                freelancer: {
                    id: "1",
                    name: "Dilla",
                    major: "Mahasiswa Informatika",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dilla",
                    rating: 4.9,
                    reviewCount: 124,
                },
                reviews: [
                    {
                        id: "rev-1",
                        userName: "Budi Santoso",
                        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi",
                        rating: 5,
                        date: "2 hari yang lalu",
                        comment: "Sangat membantu! Penjelasannya tentang konsep OOP di Java sangat mudah dipahami. Bug di aplikasi React saya juga langsung ketemu solusinya.",
                    },
                    {
                        id: "rev-2",
                        userName: "Siti Aminah",
                        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti",
                        rating: 5,
                        date: "1 minggu yang lalu",
                        comment: "Respons cepat dan kakaknya sabar banget ngajarin cara kerja Hash Map. Recommended banget buat yang lagi pusing tugas akhir!",
                    }
                ],
                similarServices: [
                    {
                        id: 2,
                        title: "Slicing UI React & Tailwind CSS",
                        freelancerName: "Fina A.",
                        rating: 5.0,
                        price: 150000,
                        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
                    },
                    {
                        id: 5,
                        title: "API Development with Node.js",
                        freelancerName: "Dika S.",
                        rating: 4.7,
                        price: 90000,
                        image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=800&auto=format&fit=crop",
                    }
                ]
            });
        }, 500);
    });
};

// ============================================================================
// 3. MAIN COMPONENT
// ============================================================================
export default function ServiceDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [service, setService] = useState<Service | null>(null);
    const [customReviews, setCustomReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedPayment, setSelectedPayment] = useState<string>('Transfer BCA');

    const paymentMethods = [
        'Transfer BCA',
        'Transfer BRI',
        'Transfer Mandiri',
        'Transfer BNI',
        'QRIS',
    ];

    useEffect(() => {
        if (id) {
            fetchServiceDetail(id)
                .then((data) => {
                    setService(data);
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.error("Failed to fetch service", err);
                    setIsLoading(false);
                });
        }
    }, [id]);

    useEffect(() => {
        const savedReviews = JSON.parse(
            localStorage.getItem("reviews") || "[]"
        );

        setCustomReviews(savedReviews);
    }, []);

    const handlePayNow = () => {
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = () => {
        const existingOrders = JSON.parse(
            localStorage.getItem('orders') || '[]'
        );

        const newOrder = {
            id: Date.now(),
            title: service?.title,
            price: service?.price,
            paymentMethod: selectedPayment,
            status: 'Pending',
            createdAt: new Date().toISOString(),
        };

        localStorage.setItem(
            'orders',
            JSON.stringify([...existingOrders, newOrder])
        );

        setShowPaymentModal(false);

        setShowSuccessModal(true);
    };

    const handleContactFreelancer = () => {
        // Mengirimkan ID Freelancer ke Inbox agar langsung tertuju
        router.push(`/client/inbox?freelancerId=${service?.freelancer.id}`);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const allReviews = [
        ...(service?.reviews || []),
        ...customReviews,
    ];
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-500 dark:text-slate-400">
                <div className="animate-pulse flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium">Memuat detail service...</p>
                </div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16] text-red-500">
                <p className="font-bold">Service tidak ditemukan.</p>
            </div>
        );
    }

    // ============================================================================
    // 4. RENDER UI
    // ============================================================================
    return (
        <div className="bg-slate-50 dark:bg-[#090d16] min-h-screen pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

                {/* HEADER SECTION */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-8"
                >
                    <ChevronLeft className="h-4 w-4" /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">
                    <div className="lg:col-span-2 space-y-10">

                        {/* TITLE & FREELANCER SECTION */}
                        <div className="space-y-6">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                                {service.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={service.freelancer.avatar}
                                        alt={service.freelancer.name}
                                        width={48}
                                        height={48}
                                        unoptimized // Fix 1: Mengatasi Error SVG DiceBear
                                        className="rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                                    />
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {service.freelancer.name}
                                        </h3>
                                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-[10px] font-semibold tracking-wide border border-slate-300 dark:border-slate-700">
                                            {service.freelancer.major}
                                        </span>
                                    </div>
                                </div>
                                <div className="hidden sm:block w-px h-8 bg-slate-300 dark:bg-slate-700" />
                                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white">
                                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                    <span className="font-bold">{service.freelancer.rating}</span>
                                    <span className="text-slate-500 dark:text-slate-400">({service.freelancer.reviewCount} reviews)</span>
                                </div>
                            </div>
                        </div>

                        {/* SERVICE IMAGE */}
                        <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <Image
                                src={service.image}
                                alt={service.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                                priority
                            />
                        </div>

                        {/* ABOUT THIS SERVICE */}
                        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">About This Service</h2>
                            <div className="space-y-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                                {/* Fix 2: Menggunakan map agar \n bisa menjadi paragraf yang rapi */}
                                {service.description.split('\n\n').map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}

                                <ul className="space-y-3 mt-6 ml-1">
                                    <li className="flex items-start gap-3">
                                        <span className="text-cyan-500 mt-1 text-lg leading-none">•</span>
                                        <span>1-on-1 personalized debugging sessions via Zoom/Discord.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-cyan-500 mt-1 text-lg leading-none">•</span>
                                        <span>Code review and best practices for clean architecture.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-cyan-500 mt-1 text-lg leading-none">•</span>
                                        <span>Assistance with final year projects and technical interview prep.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* REVIEWS SECTION */}
                        <div className="space-y-6 pt-4">
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-cyan-500" /> {/* Fix 3: Ubah warna */}
                                Client Reviews
                            </h2>
                            <div className="space-y-4">
                                {allReviews.map((review) => (
                                    <div key={review.id} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Image
                                                    src={review.userAvatar}
                                                    alt={review.userName}
                                                    width={40}
                                                    height={40}
                                                    unoptimized // Fix 1: Mengatasi Error SVG DiceBear
                                                    className="rounded-full bg-slate-200 dark:bg-slate-800"
                                                />
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{review.userName}</h4>
                                                    <div className="flex items-center gap-0.5 mt-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-3 w-3 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'fill-slate-300 text-slate-300 dark:fill-slate-700 dark:text-slate-700'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{review.date}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                            "{review.comment}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SIMILAR SERVICES SECTION */}
                        <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">You might also like</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {service.similarServices.map((similar) => (
                                    <div
                                        key={similar.id}
                                        onClick={() => router.push(`/client/service/${similar.id}`)}
                                        className="group flex gap-4 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-cyan-500/50 cursor-pointer transition-all hover:shadow-md dark:hover:shadow-none"
                                    >
                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-800">
                                            <Image
                                                src={similar.image}
                                                alt={similar.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-between py-1">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-cyan-500 transition-colors">
                                                {similar.title}
                                            </h4>
                                            <div>
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                                    <span>{similar.freelancerName}</span>
                                                    <span>•</span>
                                                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                                    <span className="font-bold text-slate-900 dark:text-white">{similar.rating}</span>
                                                </div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white">
                                                    {formatCurrency(similar.price)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* PAYMENT SIDEBAR */}
                    <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
                        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 sm:p-8 shadow-sm flex flex-col h-full">

                            <div className="space-y-4 mb-8">
                                <h3 className="text-xs font-bold tracking-widest text-cyan-500 uppercase">
                                    Standard Package
                                </h3>
                                <p className="text-3xl font-black text-slate-900 dark:text-white">
                                    {formatCurrency(service.price)}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Satu sesi mentorship 60 menit dan review kode intensif.
                                </p>
                            </div>

                            <div className="space-y-4 mb-8 py-6 border-y border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                    <span>Estimasi {service.deliveryDays} Hari Kerja</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <RefreshCw className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                    <span>{service.revisions}x Revisi / Sesi Tambahan</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Select Payment</p>
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method}
                                        onClick={() => setSelectedPayment(method)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedPayment === method
                                            ? 'border-cyan-500 bg-cyan-500/5 shadow-sm' // Fix 3: Ubah warna jadi cyan
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <span className={`text-sm font-bold ${selectedPayment === method ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {method}
                                        </span>
                                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPayment === method ? 'border-cyan-500' : 'border-slate-300 dark:border-slate-600'
                                            }`}>
                                            {selectedPayment === method && <div className="h-2 w-2 rounded-full bg-cyan-500" />}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 mt-auto">
                                <button
                                    onClick={handlePayNow}
                                    className="w-full bg-cyan-500 text-white hover:bg-cyan-400 font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    PAY NOW
                                </button>
                                <button
                                    onClick={handleContactFreelancer}
                                    className="w-full bg-white dark:bg-transparent text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold py-3.5 rounded-2xl transition-colors"
                                >
                                    Contact Freelancer
                                </button>
                            </div>
                            {service && (
                                <>
                                    <PaymentModal
                                        open={showPaymentModal}
                                        paymentMethod={selectedPayment}
                                        total={service.price}
                                        onClose={() => setShowPaymentModal(false)}
                                        onSuccess={handlePaymentSuccess}
                                    />

                                    <PaymentSuccessModal open={showSuccessModal}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}