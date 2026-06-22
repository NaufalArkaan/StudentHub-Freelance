'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';
import {
    ArrowLeft,
    Loader2,
    Package,
    User,
    Clock,
    ShieldAlert,
    CheckCircle2,
    Ban,
    Wallet,
    FileText
} from 'lucide-react';

export default function AdminOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const orderId = params.id as string;

    const [loading, setLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    interface OrderDetail {
        id: string;
        created_at: string;
        status: string;
        price: number;
        client_id: string;
        service_id: string;
        categoryName: string;
        service: {
            title: string;
            description: string;
            category_id: string;
            freelancer_id: string;
        } | null;
        client: {
            id: string;
            full_name: string;
            nim?: string;
            avatar_url?: string;
            phone?: string;
        } | null;
        freelancer: {
            id: string;
            full_name: string;
            nim?: string;
            avatar_url?: string;
            phone?: string;
        } | null;
    }

    const [orderData, setOrderData] = React.useState<OrderDetail | null>(null);
    const [adminNotes, setAdminNotes] = React.useState('');

    const fetchOrderDetail = React.useCallback(async () => {
        if (!orderId) return;
        setLoading(true);
        try {
            // 1. Tarik Data Order beserta Service-nya
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .select(`
          *,
          service:services (
            title,
            description,
            category_id,
            freelancer_id
          )
        `)
                .eq('id', orderId)
                .single();

            if (orderError) throw orderError;

            // 2. Tarik Data Kategori (Opsional, jika ingin menampilkan nama kategori)
            let categoryName = 'General';
            if (order.service?.category_id) {
                const { data: category } = await supabase
                    .from('categories')
                    .select('name')
                    .eq('id', order.service.category_id)
                    .single();
                if (category) categoryName = category.name;
            }

            // 3. Tarik Data Profil Client & Freelancer
            const userIds = [order.client_id, order.service?.freelancer_id].filter(Boolean);
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, nim, avatar_url, phone')
                .in('id', userIds);

            const profileMap = new Map(profiles?.map(p => [p.id, p]));

            const clientProfile = profileMap.get(order.client_id) as OrderDetail['client'];
            const freelancerProfile = profileMap.get(order.service?.freelancer_id) as OrderDetail['freelancer'];

            setOrderData({
                ...order,
                categoryName,
                client: clientProfile || null,
                freelancer: freelancerProfile || null,
            });

        } catch (error) {
            console.error("Gagal menarik detail order:", error);
        } finally {
            setLoading(false);
        }
    }, [supabase, orderId]);

    React.useEffect(() => {
        Promise.resolve().then(() => {
            fetchOrderDetail();
        });
    }, [fetchOrderDetail]);

    // Fungsi Helper untuk Inisial Nama
    const getInitials = (name?: string) => {
        if (!name) return 'UN';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // Fungsi Aksi Moderator
    const handleUpdateStatus = async (newStatus: string) => {
        const confirmMsg = newStatus === 'cancelled'
            ? 'Yakin ingin membatalkan pesanan ini secara paksa?'
            : 'Yakin ingin menandai pesanan ini selesai dan meneruskan dana ke Freelancer?';

        if (!confirm(confirmMsg)) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            alert(`Status pesanan berhasil diubah menjadi ${newStatus.toUpperCase()}`);
            fetchOrderDetail(); // Refresh data
        } catch (error) {
            const err = error as Error;
            alert("Gagal memperbarui status: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">Memuat rincian pesanan...</p>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-500 dark:text-slate-400">
                <Package className="h-12 w-12 opacity-50" />
                <p className="font-medium text-lg">Pesanan tidak ditemukan.</p>
                <button onClick={() => router.back()} className="text-cyan-600 dark:text-cyan-400 hover:underline text-sm mt-2">
                    Kembali ke Daftar Pesanan
                </button>
            </div>
        );
    }

    const shortId = `#ORD-${orderData.id.split('-')[0].toUpperCase()}`;
    const orderDate = new Date(orderData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="space-y-6">
            {/* Header dengan Tombol Back */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222]/50 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer shadow-sm dark:shadow-none"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            Order Detail
                            <span className="text-sm font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                {shortId}
                            </span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Dibuat pada {orderDate} WIB
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* Kolom Kiri: Informasi Pesanan & User (Lebar 2/3) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Card Info Layanan */}
                    <Card className="border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0c1222]/50 p-6 shadow-sm dark:shadow-none">
                        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Layanan yang Dipesan</h3>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{orderData.service?.title || 'Layanan telah dihapus'}</h2>
                                <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 uppercase">
                                    {orderData.categoryName}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Nilai</p>
                                <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400">Rp {Number(orderData.price).toLocaleString('id-ID')}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                Catatan / Deskripsi Layanan
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                {orderData.service?.description || 'Tidak ada deskripsi tersedia untuk layanan ini.'}
                            </p>
                        </div>
                    </Card>

                    {/* Card Profil Klien & Freelancer */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Card Client */}
                        <Card className="border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0c1222]/50 p-6 shadow-sm dark:shadow-none">
                            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" /> Informasi Client
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shrink-0">
                                    {orderData.client?.avatar_url ? (
                                        <img src={orderData.client.avatar_url} alt="Client" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-500/20 dark:to-indigo-500/20 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                            {getInitials(orderData.client?.full_name)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{orderData.client?.full_name || 'User Dihapus'}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">NIM: {orderData.client?.nim || '-'}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Card Freelancer */}
                        <Card className="border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0c1222]/50 p-6 shadow-sm dark:shadow-none">
                            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" /> Informasi Freelancer
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shrink-0">
                                    {orderData.freelancer?.avatar_url ? (
                                        <img src={orderData.freelancer.avatar_url} alt="Freelancer" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 dark:from-emerald-500/20 dark:to-teal-500/20 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                                            {getInitials(orderData.freelancer?.full_name)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{orderData.freelancer?.full_name || 'User Dihapus'}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">NIM: {orderData.freelancer?.nim || '-'}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                </div>

                {/* Kolom Kanan: Panel Moderator (Lebar 1/3) */}
                <div className="space-y-6">
                    <Card className="border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0c1222]/50 p-6 shadow-sm dark:shadow-none">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-4.5 h-4.5 text-cyan-500" />
                            Moderator Panel
                        </h3>

                        {/* Status Indicator */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status Saat Ini</p>
                            {orderData.status === 'completed' && (
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                                    <CheckCircle2 className="w-5 h-5" /> Selesai (Completed)
                                </div>
                            )}
                            {orderData.status === 'in_progress' && (
                                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold">
                                    <Loader2 className="w-5 h-5 animate-spin" /> Sedang Dikerjakan
                                </div>
                            )}
                            {orderData.status === 'pending' && (
                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                                    <Clock className="w-5 h-5" /> Menunggu Respons
                                </div>
                            )}
                            {(orderData.status === 'cancelled' || orderData.status === 'disputed') && (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
                                    <Ban className="w-5 h-5" /> {orderData.status === 'cancelled' ? 'Dibatalkan' : 'Dalam Sengketa'}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 mb-5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Catatan Resolusi Admin
                            </label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Tambahkan catatan internal jika terjadi sengketa..."
                                className="w-full h-24 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 dark:focus:border-slate-700 transition-all resize-none"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                disabled={isSubmitting || orderData.status === 'completed' || orderData.status === 'cancelled'}
                                onClick={() => handleUpdateStatus('completed')}
                                className="w-full h-10 rounded-lg bg-cyan-500 text-white dark:bg-[#00d8ff] dark:text-slate-950 text-xs font-bold flex items-center justify-center gap-2 hover:bg-cyan-600 dark:hover:bg-cyan-400 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm dark:shadow-none"
                            >
                                <Wallet className="h-4 w-4" />
                                Selesaikan Escrow (Teruskan Dana)
                            </button>

                            <button
                                disabled={isSubmitting || orderData.status === 'completed' || orderData.status === 'cancelled'}
                                onClick={() => handleUpdateStatus('cancelled')}
                                className="w-full h-10 rounded-lg border border-red-200 dark:border-red-500/20 bg-transparent text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                <Ban className="h-4 w-4" />
                                Batalkan Paksa Order (Refund)
                            </button>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}