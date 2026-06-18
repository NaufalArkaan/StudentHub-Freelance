"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, Flag, CheckCircle2, Loader2, AlertCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ReviewPage() {
    const router = useRouter();
    const params = useParams();
    // Mengamankan pembacaan ID dari params (jika berbentuk Promise di Next.js 15+)
    const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

    const supabase = createClient();

    // State Form
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [anonymous, setAnonymous] = useState(false);

    // State UI & Data
    const [showSuccess, setShowSuccess] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State Custom Alert
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [freelancerInfo, setFreelancerInfo] = useState({
        id: "",
        serviceId: "",
        name: "Freelancer",
        serviceTitle: "Layanan",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Freelancer"
    });

    // 1. Tarik Data Order & Freelancer saat halaman dimuat
    useEffect(() => {
        const fetchOrderData = async () => {
            if (!id) return;
            setIsFetching(true);
            try {
                const { data, error: orderError } = await supabase
                    .from("orders")
                    .select(`
                        id,
                        service:services (
                            title,
                            freelancer_id
                        )
                    `)
                    .eq("id", id)
                    .single();

                if (orderError) throw orderError;

                const orderData = data as any;
                const serviceData = Array.isArray(orderData?.service)
                    ? orderData.service[0]
                    : orderData?.service;

                if (serviceData?.freelancer_id) {
                    const { data: profileData } = await supabase
                        .from("profiles")
                        .select("full_name, avatar_url")
                        .eq("id", serviceData.freelancer_id)
                        .single();

                    if (profileData) {
                        setFreelancerInfo({
                            id: serviceData.freelancer_id,
                            serviceId: orderData.service_id,
                            name: profileData.full_name || "Freelancer",
                            serviceTitle: serviceData.title || "Layanan",
                            avatar: profileData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${serviceData.freelancer_id}`
                        });
                    }
                }
            } catch (error) {
                console.error("Gagal menarik data order:", error);
            } finally {
                setIsFetching(false);
            }
        };

        fetchOrderData();
    }, [id, supabase]);

    // 2. Fungsi Kirim Data ke Supabase
    const handleSubmit = async () => {
        if (rating === 0) {
            setErrorMessage("Mohon berikan rating bintang terlebih dahulu sebelum mengirim ulasan.");
            setShowError(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Anda belum login");

            // INSERT ke tabel reviews
            const { error } = await supabase.from("reviews").insert({
                order_id: id,
                freelancer_id: freelancerInfo.id,
                service_id: freelancerInfo.serviceId,
                client_id: user.id,
                rating: rating,
                comment: feedback,
                is_anonymous: anonymous
            });

            if (error) throw error;

            setShowSuccess(true);
            setTimeout(() => {
                router.push("/client/orders");
            }, 2000);

        } catch (error: any) {
            console.error("Gagal mengirim review:", error);

            // TANGKAP ERROR DUPLIKAT (23505) DAN TAMPILKAN CUSTOM MODAL
            if (error.code === '23505') {
                setErrorMessage("Anda sudah pernah memberikan ulasan untuk pesanan ini sebelumnya. Satu pesanan hanya dapat diulas satu kali.");
            } else {
                setErrorMessage("Terjadi kesalahan sistem: " + (error.message || "Gagal menyimpan ulasan."));
            }
            setShowError(true);

        } finally {
            setIsSubmitting(false);
        }
    };

    // Handler tutup modal error dan redirect jika duplikat
    const handleCloseError = () => {
        setShowError(false);
        if (errorMessage.includes("sudah pernah")) {
            router.push("/client/orders");
        }
    };

    if (isFetching) {
        return (
            <div className="flex min-h-screen flex-col gap-4 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
                <p className="text-sm font-medium text-slate-500">Mempersiapkan form ulasan...</p>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Review Freelancer
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-zinc-400">
                        Share your experience and help other students make informed decisions.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm">
                    {/* Freelancer Info */}
                    <div className="flex items-center gap-5 mb-10 pb-8 border-b border-gray-100 dark:border-zinc-800">
                        <img
                            src={freelancerInfo.avatar}
                            alt={freelancerInfo.name}
                            className="w-16 h-16 rounded-full border border-gray-200 dark:border-zinc-700 object-cover bg-slate-100"
                        />
                        <div>
                            <h2 className="font-bold text-xl text-gray-900 dark:text-white">
                                {freelancerInfo.name}
                            </h2>
                            <p className="text-sm font-medium text-cyan-600 dark:text-cyan-500 mt-1">
                                {freelancerInfo.serviceTitle}
                            </p>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-8">
                        <label className="block text-xs tracking-wider font-bold mb-4 text-gray-500 dark:text-zinc-400 uppercase">
                            Your Rating
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        size={40}
                                        className={`transition-colors ${star <= (hover || rating)
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-gray-200 dark:text-zinc-800"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className="mb-8">
                        <label className="block text-xs tracking-wider font-bold mb-4 text-gray-500 dark:text-zinc-400 uppercase">
                            Detailed Feedback
                        </label>
                        <textarea
                            rows={5}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Describe your experience working with this freelancer..."
                            className="w-full rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 p-5 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                        />
                    </div>

                    {/* Anonymous Toggle */}
                    <div className="flex items-center justify-between mb-10 p-5 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                        <div>
                            <span className="block font-semibold text-gray-900 dark:text-white">
                                Post anonymously
                            </span>
                            <span className="text-xs text-gray-500 dark:text-zinc-400 mt-1 block">
                                Hide your name and avatar from public view
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAnonymous(!anonymous)}
                            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${anonymous
                                ? "bg-cyan-500"
                                : "bg-gray-300 dark:bg-zinc-700"
                                }`}
                        >
                            <div
                                className={`absolute left-1 top-1 h-5 w-5 bg-white rounded-full transition-transform duration-300 ${anonymous ? "translate-x-7 shadow-sm" : "translate-x-0"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                        <button
                            onClick={() => router.push(`/client/orders/${id}/report`)}
                            className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors py-2"
                        >
                            <Flag size={16} />
                            Report Issue
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Review"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* CUSTOM SUCCESS MODAL */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
                    <div className="w-full max-w-sm rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111827] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-50 dark:bg-cyan-500/10">
                            <CheckCircle2 size={40} className="text-cyan-500" />
                        </div>
                        <h2 className="text-center text-2xl font-black text-gray-900 dark:text-white mb-2">
                            Review Submitted!
                        </h2>
                        <p className="text-center text-sm text-gray-500 dark:text-zinc-400 leading-relaxed mb-8">
                            Thank you for sharing your experience. Your feedback helps our community grow.
                        </p>
                        <div className="flex justify-center">
                            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                                <div className="h-full animate-pulse bg-cyan-500" />
                            </div>
                        </div>
                        <p className="mt-4 text-center text-xs font-medium text-slate-400 dark:text-zinc-500">
                            Redirecting to orders...
                        </p>
                    </div>
                </div>
            )}

            {/* CUSTOM ERROR MODAL */}
            {showError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
                    <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-2 text-amber-500">
                                <AlertCircle className="w-5 h-5" />
                                <h3 className="font-bold text-slate-900 dark:text-white">Pemberitahuan</h3>
                            </div>
                            <button
                                onClick={handleCloseError}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                {errorMessage}
                            </p>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
                            <button
                                onClick={handleCloseError}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                            >
                                Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}