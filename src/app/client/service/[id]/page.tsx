/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Star, Clock, RefreshCw, MessageSquare } from 'lucide-react';
import PaymentModal from './components/PaymentModal';
import PaymentSuccessModal from './components/PaymentSuccessModal';
import { createClient } from '@/lib/supabase/client';

// ============================================================================
// 1. DATA TYPES 
// ============================================================================
type Freelancer = {
    id: string;
    name: string;
    major: string;
    avatar: string;
    rating: number;
    reviewCount: number;
};

type Service = {
    id: string;
    title: string;
    description: string;
    image: string;
    price: number;
    deliveryDays: number;
    revisions: number;
    categorySlug: string;
    freelancer: Freelancer;
    reviews: any[];
    similarServices: any[];
};

// ============================================================================
// 2. MAIN COMPONENT
// ============================================================================
export default function ServiceDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const supabase = createClient();

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [service, setService] = useState<Service | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isProcessingOrder, setIsProcessingOrder] = useState<boolean>(false);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<string>('Transfer BCA');

    const paymentMethods = ['Transfer BCA', 'Transfer BRI', 'Transfer Mandiri', 'Transfer BNI', 'QRIS'];

    // Ambil data User yang sedang login (sebagai Klien)
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        getUser();
    }, [supabase]);

    // Fetch Detail Layanan & Review dari Supabase
    useEffect(() => {
        const fetchServiceDetail = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // 1. Ambil Data Layanan
                const { data: serviceData, error: serviceError } = await supabase
                    .from('services')
                    .select(`
                        *,
                        profiles (full_name, avatar_url)
                    `)
                    .eq('id', id)
                    .single();

                if (serviceError) throw serviceError;

                if (serviceData) {
                    // 2. Ambil Data Review dari database (berdasarkan freelancer layanannya)
                    const { data: reviewsData } = await supabase
                        .from('reviews')
                        .select('*')
                        .eq('service_id', id)
                        .order('created_at', { ascending: false });

                    let formattedReviews: any[] = [];
                    let avgRating = serviceData.rating || 5.0;
                    let totalReviews = 0;

                    if (reviewsData && reviewsData.length > 0) {
                        // 3. Ambil data profil klien yang menulis review
                        const clientIds = [...new Set(reviewsData.map(r => r.client_id))];
                        const { data: clientProfiles } = await supabase
                            .from('profiles')
                            .select('id, full_name, avatar_url')
                            .in('id', clientIds);

                        const profileMap = new Map(clientProfiles?.map(p => [p.id, p]));

                        // 4. Format Review & Terapkan Fitur Anonim
                        formattedReviews = reviewsData.map((review: any) => {
                            const clientProfile = profileMap.get(review.client_id);

                            // LOGIKA FITUR ANONIM
                            const isAnon = review.is_anonymous;

                            let dateStr = "Baru saja";
                            if (review.created_at) {
                                dateStr = new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            }

                            return {
                                id: review.id,
                                // Ganti nama jika Anonim
                                userName: isAnon ? "Anonymous Student" : (clientProfile?.full_name || "Student"),
                                // Ganti foto jika Anonim
                                userAvatar: isAnon ? `https://api.dicebear.com/7.x/avataaars/svg?seed=anon${review.id}&backgroundColor=e2e8f0` : (clientProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.client_id}`),
                                rating: review.rating || 5,
                                comment: review.comment || "",
                                date: dateStr
                            };
                        });

                        // Kalkulasi ulang rating jika ada review masuk
                        totalReviews = formattedReviews.length;
                        const sumRating = formattedReviews.reduce((sum, r) => sum + r.rating, 0);
                        avgRating = Number((sumRating / totalReviews).toFixed(1));
                    }

                    // 5. Masukkan ke State Service
                    setService({
                        id: serviceData.id,
                        title: serviceData.title || serviceData.name || 'Untitled Service',
                        description: serviceData.description || 'Freelancer belum menambahkan deskripsi untuk layanan ini.',
                        image: serviceData.image_url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
                        price: serviceData.price || 0,
                        deliveryDays: serviceData.delivery_time || 3,
                        revisions: 2,
                        categorySlug: serviceData.tag || 'general',
                        freelancer: {
                            id: serviceData.freelancer_id,
                            name: serviceData.profiles?.full_name || 'Freelancer',
                            major: 'Mahasiswa',
                            avatar: serviceData.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${serviceData.freelancer_id}`,
                            rating: avgRating,
                            reviewCount: totalReviews,
                        },
                        reviews: formattedReviews, // SEKARANG MENGGUNAKAN DATA ASLI
                        similarServices: []
                    });
                }
            } catch (error) {
                console.error("Gagal mengambil detail layanan:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchServiceDetail();
    }, [id, supabase]);

    const handlePayNow = () => {
        if (!currentUser) {
            alert("Harap login terlebih dahulu untuk memesan layanan.");
            return;
        }
        setShowPaymentModal(true);
    };

    // LOGIKA UTAMA: Menyimpan Pesanan ke Database Supabase
    const handlePaymentSuccess = async (receiptUrl?: string, sender?: string, method?: string) => {
        if (!currentUser || !service) return;
        setIsProcessingOrder(true);

        try {
            const paymentPayload = {
                receipt_url: receiptUrl || '',
                sender_name: sender || '',
                payment_method: method || '',
            };

            const { error } = await supabase.from('orders').insert({
                service_id: service.id,
                client_id: currentUser.id,
                price: service.price,
                status: 'pending',
                requirements: JSON.stringify(paymentPayload),
            });

            if (error) throw error;

            setShowPaymentModal(false);
            setShowSuccessModal(true);
        } catch (error: any) {
            console.error("Gagal memproses pesanan:", error);
            alert("Error Supabase: " + (error.message || JSON.stringify(error)));
        } finally {
            setIsProcessingOrder(false);
        }
    };

    const handleContactFreelancer = () => {
        router.push(`/client/inbox?freelancerId=${service?.freelancer.id}`);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-500 dark:text-slate-400">
                <div className="animate-pulse flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium">Memuat detail layanan...</p>
                </div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-500">
                <p className="font-bold">Layanan tidak ditemukan.</p>
            </div>
        );
    }

    // ============================================================================
    // 3. RENDER UI
    // ============================================================================
    return (
        <div className="bg-slate-50 dark:bg-[#090d16] min-h-screen pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

                {/* HEADER SECTION */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-cyan-500 dark:text-slate-400 transition-colors mb-8"
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
                                        unoptimized
                                        className="rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 object-cover"
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
                                    <span className="text-slate-500 dark:text-slate-400">({service.freelancer.reviewCount} ulasan)</span>
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
                            <div className="space-y-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {service.description}
                            </div>
                        </div>

                        {/* REVIEWS SECTION */}
                        <div className="space-y-6 pt-4">
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-cyan-500" />
                                Client Reviews
                            </h2>
                            <div className="space-y-4">
                                {/* LOGIKA TAMPILAN JIKA REVIEW KOSONG ATAU ADA */}
                                {service.reviews && service.reviews.length > 0 ? (
                                    service.reviews.map((review) => (
                                        <div key={review.id} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Image
                                                        src={review.userAvatar}
                                                        alt={review.userName}
                                                        width={40}
                                                        height={40}
                                                        unoptimized
                                                        className="rounded-full bg-slate-200 dark:bg-slate-800 object-cover"
                                                    />
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{review.userName}</h4>
                                                        <div className="flex items-center gap-0.5 mt-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-3 w-3 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'fill-slate-300 text-slate-300 dark:fill-slate-700'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{review.date}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                                &quot;{review.comment}&quot;
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    // TAMPILAN SAAT BELUM ADA REVIEW SAMA SEKALI
                                    <div className="p-8 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Belum ada ulasan untuk layanan ini. Jadilah yang pertama untuk mencoba!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* PAYMENT SIDEBAR */}
                    <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
                        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 sm:p-8 shadow-sm flex flex-col h-full">

                            <div className="space-y-4 mb-8">
                                <h3 className="text-xs font-bold tracking-widest text-cyan-500 uppercase">
                                    Paket Layanan
                                </h3>
                                <p className="text-3xl font-black text-slate-900 dark:text-white">
                                    {formatCurrency(service.price)}
                                </p>
                            </div>

                            <div className="space-y-4 mb-8 py-6 border-y border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                    <span>Estimasi {service.deliveryDays} Hari Kerja</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <RefreshCw className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                    <span>{service.revisions}x Revisi Maksimal</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Metode Pembayaran</p>
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method}
                                        onClick={() => setSelectedPayment(method)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedPayment === method
                                            ? 'border-cyan-500 bg-cyan-500/5 shadow-sm'
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
                                    disabled={isProcessingOrder}
                                    className="w-full bg-cyan-500 text-white hover:bg-cyan-400 font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessingOrder ? 'Memproses...' : 'PAY NOW'}
                                </button>
                                <button
                                    onClick={handleContactFreelancer}
                                    className="w-full bg-white dark:bg-transparent text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold py-3.5 rounded-2xl transition-colors"
                                >
                                    Contact Freelancer
                                </button>
                            </div>

                            <PaymentModal
                                open={showPaymentModal}
                                paymentMethod={selectedPayment}
                                total={service.price}
                                onClose={() => setShowPaymentModal(false)}
                                onSuccess={handlePaymentSuccess}
                            />

                            <PaymentSuccessModal
                                open={showSuccessModal}
                                freelancerId={service.freelancer.id}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}