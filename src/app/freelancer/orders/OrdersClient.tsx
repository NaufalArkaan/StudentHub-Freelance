'use client';

import * as React from 'react';
import { Search, Filter, MessageSquare, Inbox, ChevronDown, AlertCircle, X, CheckCircle2, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type Tab = 'all' | 'pending' | 'in_progress' | 'completed';
type SortOption = 'newest' | 'oldest' | 'highest_price' | 'lowest_price';

type OrderItem = {
  id: string;
  status: string;
  price: number | string;
  created_at?: string;
  service?: { title: string; price: number };
  client?: { full_name: string; avatar_url: string };
  client_id?: string;
  requirements?: string;
};

export default function OrdersClient({ initialOrders }: { initialOrders: OrderItem[] }) {
  const [orders, setOrders] = React.useState<OrderItem[]>(initialOrders);
  const [activeTab, setActiveTab] = React.useState<Tab>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // State Fitur Filter/Sort
  const [sortOption, setSortOption] = React.useState<SortOption>('newest');
  const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);

  // State untuk Custom Modals
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [confirmConfig, setConfirmConfig] = React.useState<{ isOpen: boolean, msg: string, action: (() => void) | null }>({ isOpen: false, msg: '', action: null });
  const [selectedOrderReceipt, setSelectedOrderReceipt] = React.useState<OrderItem | null>(null);

  const supabase = createClient();
  const router = useRouter();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Fungsi helper untuk menampilkan notifikasi sukses singkat
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  // Sinkronisasi data jika ada perubahan props dari server
  React.useEffect(() => {
    Promise.resolve().then(() => {
      setOrders(initialOrders);
    });
  }, [initialOrders]);

  // Menutup dropdown jika klik di luar area filter
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // FUNGSI EKSEKUSI DATABASE
  const executeStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setLoading(true);
      // Optimistic UI Update
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      showSuccess('Status pesanan berhasil diperbarui!');
      router.refresh();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      setOrders(initialOrders); // Rollback jika gagal
      setErrorMsg('Gagal memperbarui status pesanan: ' + (error.message || 'Silakan coba lagi.'));
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI HANDLER TOMBOL
  const handleStatusChange = (orderId: string, newStatus: string) => {
    if (newStatus === 'cancelled') {
      // Tampilkan Custom Confirm Modal
      setConfirmConfig({
        isOpen: true,
        msg: 'Apakah Anda yakin ingin menolak pesanan ini? Tindakan ini tidak dapat dibatalkan.',
        action: () => {
          setConfirmConfig({ isOpen: false, msg: '', action: null });
          executeStatusChange(orderId, newStatus);
        }
      });
    } else {
      // Langsung eksekusi untuk status lainnya (in_progress, completed)
      executeStatusChange(orderId, newStatus);
    }
  };

  // Proses Filter sekaligus Sorting Data
  const filteredOrders = orders
    .filter(order => {
      // 1. Filter berdasarkan Tab Status
      if (activeTab === 'pending' && order.status !== 'pending') return false;
      if (activeTab === 'in_progress' && order.status !== 'in_progress') return false;
      if (activeTab === 'completed' && order.status !== 'completed') return false;

      // 2. Filter berdasarkan Input Pencarian
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const title = order.service?.title?.toLowerCase() || '';
        const clientName = order.client?.full_name?.toLowerCase() || '';
        const orderId = order.id.toLowerCase();

        if (!title.includes(query) && !clientName.includes(query) && !orderId.includes(query)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      // 3. Logika Sorting/Pengurutan Data
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;

      if (sortOption === 'newest') return dateB - dateA;
      if (sortOption === 'oldest') return dateA - dateB;
      if (sortOption === 'highest_price') return priceB - priceA;
      if (sortOption === 'lowest_price') return priceA - priceB;
      return 0;
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-[11px] font-bold border bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-500/30 uppercase tracking-wide">Menunggu</span>;
      case 'in_progress':
        return <span className="px-3 py-1 rounded-full text-[11px] font-bold border bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-500/30 uppercase tracking-wide">Proses</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-[11px] font-bold border bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500/30 uppercase tracking-wide">Selesai</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-[11px] font-bold border bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-500/30 uppercase tracking-wide">Ditolak</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[11px] font-bold border bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 uppercase tracking-wide">{status}</span>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Okt 24, 2026';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Label pembantu untuk tombol filter utama
  const getSortLabel = () => {
    if (sortOption === 'newest') return 'Terbaru';
    if (sortOption === 'oldest') return 'Terlama';
    if (sortOption === 'highest_price') return 'Harga Tertinggi';
    if (sortOption === 'lowest_price') return 'Harga Terendah';
    return 'Filter';
  };

  return (
    <div className="flex flex-col space-y-6">

      {/* --- Filter & Search Bar --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs Navigasi */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 sm:gap-6 border-b border-slate-200 dark:border-slate-800 pb-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap px-1 ${activeTab === 'all' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Semua Order
            {activeTab === 'all' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 dark:bg-cyan-400"></div>}
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 whitespace-nowrap px-1 ${activeTab === 'pending' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Permintaan Masuk
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">{orders.filter(o => o.status === 'pending').length}</span>
            {activeTab === 'pending' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 dark:bg-cyan-400"></div>}
          </button>
          <button
            onClick={() => setActiveTab('in_progress')}
            className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 whitespace-nowrap px-1 ${activeTab === 'in_progress' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Dikerjakan
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">{orders.filter(o => o.status === 'in_progress').length}</span>
            {activeTab === 'in_progress' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 dark:bg-cyan-400"></div>}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 whitespace-nowrap px-1 ${activeTab === 'completed' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Selesai
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">{orders.filter(o => o.status === 'completed').length}</span>
            {activeTab === 'completed' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 dark:bg-cyan-400"></div>}
          </button>
        </div>

        {/* Input Search & Filter Dropdown */}
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari order atau klien..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 w-full sm:w-64 transition-all"
            />
          </div>

          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Filter className="w-4 h-4 text-cyan-500" />
            <span>{getSortLabel()}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {/* Dropdown Menu untuk Pilihan Filter */}
          {showFilterDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">Urutkan Data</div>
              <button
                onClick={() => { setSortOption('newest'); setShowFilterDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${sortOption === 'newest' ? 'text-cyan-500 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                Tanggal: Terbaru
              </button>
              <button
                onClick={() => { setSortOption('oldest'); setShowFilterDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${sortOption === 'oldest' ? 'text-cyan-500 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                Tanggal: Terlama
              </button>
              <button
                onClick={() => { setSortOption('highest_price'); setShowFilterDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${sortOption === 'highest_price' ? 'text-cyan-500 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                Harga: Tertinggi
              </button>
              <button
                onClick={() => { setSortOption('lowest_price'); setShowFilterDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${sortOption === 'lowest_price' ? 'text-cyan-500 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                Harga: Terendah
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- Area Tabel --- */}
      <div className="flex-grow">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Menampilkan <span className="text-slate-900 dark:text-white font-medium">{filteredOrders.length}</span> Pesanan</p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#111827] text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-6 font-bold">Order ID & Layanan</th>
                <th className="py-4 px-6 font-bold">Klien</th>
                <th className="py-4 px-6 font-bold">Harga</th>
                <th className="py-4 px-6 font-bold">Tanggal</th>
                <th className="py-4 px-6 font-bold">Status</th>
                <th className="py-4 px-6 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50 bg-white dark:bg-[#1f2937]">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">ORD-{order.id.slice(0, 5).toUpperCase()}</div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-[200px]" title={order.service?.title}>{order.service?.title}</div>
                    {order.requirements && (
                      <button
                        onClick={() => setSelectedOrderReceipt(order)}
                        className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> Lihat Bukti Transfer
                      </button>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={order.client?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.client_id}`}
                        alt="Client"
                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 object-cover"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{order.client?.full_name || 'Client'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                      Rp {Number(order.price).toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(order.created_at)}</span>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            disabled={loading}
                            onClick={() => handleStatusChange(order.id, 'cancelled')}
                            className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            Tolak
                          </button>
                          <button
                            disabled={loading}
                            onClick={() => handleStatusChange(order.id, 'in_progress')}
                            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 dark:hover:bg-cyan-400 text-white dark:text-[#0f1219] text-xs font-bold transition-colors shadow-sm"
                          >
                            Terima
                          </button>
                        </>
                      )}
                      {order.status === 'in_progress' && (
                        <>
                          <button
                            title="Kirim Pesan"
                            onClick={() => router.push(`/freelancer/inbox?orderId=${order.id}`)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            disabled={loading}
                            onClick={() => handleStatusChange(order.id, 'completed')}
                            className="px-3 py-1.5 rounded-lg border border-cyan-500/50 text-cyan-600 dark:text-cyan-400 text-xs font-bold hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors whitespace-nowrap"
                          >
                            Selesaikan
                          </button>
                        </>
                      )}
                      {order.status === 'completed' && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium px-2 italic">Telah Selesai</span>
                      )}
                      {order.status === 'cancelled' && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium px-2 italic">Dibatalkan</span>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Tidak ada pesanan ditemukan.</p>
                      {searchQuery && <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* KUMPULAN CUSTOM MODALS */}
      {/* ========================================== */}

      {/* 1. SUCCESS MODAL */}
      {successMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-center text-2xl font-black text-slate-900 dark:text-white mb-2">
              Berhasil!
            </h2>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              {successMsg}
            </p>
          </div>
        </div>
      )}

      {/* 2. ERROR MODAL */}
      {errorMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-white">Terjadi Kesalahan</h3>
              </div>
              <button onClick={() => setErrorMsg('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {errorMsg}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
              <button onClick={() => setErrorMsg('')} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONFIRM MODAL (Tolak Pesanan) */}
      {confirmConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">Konfirmasi</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {confirmConfig.msg}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button onClick={() => setConfirmConfig({ isOpen: false, msg: '', action: null })} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer">
                Batal
              </button>
              <button onClick={() => confirmConfig.action && confirmConfig.action()} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer">
                Ya, Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PAYMENT RECEIPT MODAL */}
      {selectedOrderReceipt && (() => {
        let paymentData: any = null;
        try {
          if (selectedOrderReceipt.requirements) {
            paymentData = JSON.parse(selectedOrderReceipt.requirements);
          }
        } catch (e) {
          console.error("Error parsing requirements JSON:", e);
        }

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden animate-in zoom-in duration-200 max-h-[90vh] flex flex-col text-slate-900 dark:text-white">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 text-cyan-500">
                  <FileText className="w-5 h-5" />
                  <h3 className="font-bold text-slate-900 dark:text-white">Bukti Pembayaran Client</h3>
                </div>
                <button
                  onClick={() => setSelectedOrderReceipt(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-5">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-semibold uppercase tracking-wider text-[9px]">ID Order</span>
                    <span className="font-bold">ORD-{selectedOrderReceipt.id.slice(0, 5).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-semibold uppercase tracking-wider text-[9px]">Total Harga</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">Rp {Number(selectedOrderReceipt.price).toLocaleString('id-ID')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-semibold uppercase tracking-wider text-[9px]">Metode Pembayaran</span>
                    <span className="font-bold">{paymentData?.payment_method || "Transfer Bank"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-semibold uppercase tracking-wider text-[9px]">Nama Pengirim</span>
                    <span className="font-bold">{paymentData?.sender_name || "Tidak diisi"}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                  <span className="text-slate-400 dark:text-slate-500 block font-semibold uppercase tracking-wider text-[9px] mb-2">Foto / Struk Bukti Transfer</span>
                  
                  {paymentData?.receipt_url ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 max-h-[300px] flex items-center justify-center">
                      <img
                        src={paymentData.receipt_url}
                        alt="Bukti Transfer"
                        className="max-h-[300px] w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Berkas bukti transfer tidak ditemukan.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3 flex-shrink-0">
                {selectedOrderReceipt.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedOrderReceipt(null);
                        handleStatusChange(selectedOrderReceipt.id, 'cancelled');
                      }}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-bold rounded-xl transition-all"
                    >
                      Tolak Order
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrderReceipt(null);
                        handleStatusChange(selectedOrderReceipt.id, 'in_progress');
                      }}
                      className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white dark:text-[#0f1219] text-sm font-bold rounded-xl transition-all"
                    >
                      Terima Order
                    </button>
                  </>
                )}
                {selectedOrderReceipt.status !== 'pending' && (
                  <button
                    onClick={() => setSelectedOrderReceipt(null)}
                    className="px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-sm font-bold rounded-xl transition-all"
                  >
                    Tutup
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}