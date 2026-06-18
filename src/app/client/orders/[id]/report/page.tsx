"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Upload, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ReportPage() {
    const router = useRouter();
    const { id } = useParams(); // Ini adalah ID Order
    const supabase = createClient();

    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State untuk menyimpan ID yang dibutuhkan tabel reports Anda
    const [targetIds, setTargetIds] = useState({
        serviceId: "",
        freelancerId: ""
    });

    // Ambil data service_id dan freelancer_id dari order saat halaman dimuat
    useEffect(() => {
        const fetchTargetIds = async () => {
            if (!id) return;
            try {
                const { data: orderData } = await supabase
                    .from('orders')
                    .select('service_id, service:services(freelancer_id)')
                    .eq('id', id)
                    .single();

                if (orderData) {
                    // Antisipasi jika Supabase mengembalikan data relasi sebagai array
                    const serviceInfo = Array.isArray(orderData.service) ? orderData.service[0] : orderData.service;

                    setTargetIds({
                        serviceId: orderData.service_id || "",
                        freelancerId: serviceInfo?.freelancer_id || ""
                    });
                }
            } catch (err) {
                console.error("Gagal menarik data referensi order:", err);
            }
        };
        fetchTargetIds();
    }, [id, supabase]);

    const handleSubmit = async () => {
        if (!reason) {
            alert("Pilih alasan pelaporan terlebih dahulu.");
            return;
        }
        if (!description.trim()) {
            alert("Deskripsi masalah tidak boleh kosong.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Anda belum login");

            // INSERT ke tabel reports menyesuaikan dengan struktur kolom Anda!
            const { error } = await supabase.from("reports").insert({
                reporter_id: user.id,                     // Yang melapor (Klien)
                reported_user_id: targetIds.freelancerId, // Yang dilaporkan (Freelancer)
                service_id: targetIds.serviceId,          // Layanan yang dipesan
                reason: reason,
                description: description,
                // status: 'pending' // Tidak perlu dikirim jika database sudah punya default value
            });

            if (error) throw error;

            setShowSuccess(true);

            setTimeout(() => {
                router.push("/client/orders");
            }, 2000);

        } catch (error: any) {
            console.error("Gagal mengirim laporan:", error);
            alert("Error Supabase: " + (error.message || "Gagal mengirim laporan."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Report Issue
                    </h1>

                    <p className="mt-2 text-gray-600 dark:text-zinc-400">
                        Submit a dispute or report a problem with this order.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm">
                    {/* Notice */}
                    <div className="flex gap-4 p-5 rounded-2xl mb-8 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                        <AlertTriangle className="text-red-500 shrink-0" size={24} />

                        <div>
                            <h3 className="font-bold text-red-700 dark:text-red-400 text-sm sm:text-base">
                                Report an Issue / Dispute
                            </h3>

                            <p className="text-sm text-red-600/80 dark:text-red-300/80 mt-1 leading-relaxed">
                                Our moderation team will carefully review your report and contact both parties within 24–48 hours to resolve the dispute fairly.
                            </p>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="mb-8">
                        <label className="block text-xs font-bold tracking-wider mb-3 text-gray-500 dark:text-zinc-400 uppercase">
                            REASON FOR REPORT
                        </label>

                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 p-4 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all appearance-none cursor-pointer"
                        >
                            <option value="" disabled>Select a reason...</option>
                            <option value="not_delivered">Service was not delivered</option>
                            <option value="poor_quality">Poor quality work</option>
                            <option value="late_delivery">Late delivery</option>
                            <option value="unresponsive">Freelancer not responding</option>
                            <option value="fraud">Suspected fraud</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <label className="block text-xs font-bold tracking-wider mb-3 text-gray-500 dark:text-zinc-400 uppercase">
                            ISSUE DESCRIPTION
                        </label>

                        <textarea
                            rows={6}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide details about the issue. Please be as specific as possible..."
                            className="w-full rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 p-4 text-gray-900 dark:text-white focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all resize-none"
                        />
                    </div>

                    {/* Upload Evidence */}
                    <div className="mb-10">
                        <label className="block text-xs font-bold tracking-wider mb-3 text-gray-500 dark:text-zinc-400 uppercase">
                            SUPPORTING EVIDENCE
                        </label>

                        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-2xl p-10 cursor-pointer hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-all group">
                            <div className="p-3 rounded-full bg-gray-100 dark:bg-zinc-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                                <Upload
                                    size={24}
                                    className="text-gray-500 dark:text-zinc-400 group-hover:text-red-500 transition-colors"
                                />
                            </div>

                            <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                                Click to upload screenshots or chat logs
                            </span>

                            <span className="text-xs text-gray-400 dark:text-zinc-500">
                                Maximum file size: 10MB
                            </span>

                            <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) =>
                                    setFile(e.target.files?.[0] || null)
                                }
                            />
                        </label>

                        {file && (
                            <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 truncate pr-4">
                                    {file.name}
                                </p>
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-wider shrink-0"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                        <button
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                            className="px-8 py-3.5 rounded-xl border-2 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-8 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-md hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Report"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
                    <div className="w-full max-w-sm rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111827] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                            <CheckCircle2 size={40} className="text-emerald-500" />
                        </div>
                        <h2 className="text-center text-2xl font-black text-gray-900 dark:text-white mb-2">
                            Report Submitted
                        </h2>
                        <p className="text-center text-sm text-gray-500 dark:text-zinc-400 leading-relaxed mb-8">
                            We have received your dispute. Our team will review the details and contact you shortly.
                        </p>
                        <div className="flex justify-center">
                            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                                <div className="h-full animate-pulse bg-emerald-500" />
                            </div>
                        </div>
                        <p className="mt-4 text-center text-xs font-medium text-slate-400 dark:text-zinc-500">
                            Redirecting to orders...
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}