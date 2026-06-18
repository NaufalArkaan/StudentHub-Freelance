'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation'; // <-- 1. Import useSearchParams
import Card from '@/components/ui/Card';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Loader2,
  Inbox,
  CheckCircle2,
  AlertCircle,
  X,
  Ban
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// 2. Bungkus dengan Suspense
export default function AdminReportsPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    }>
      <ReportsContent />
    </React.Suspense>
  );
}

function ReportsContent() {
  const supabase = createClient();
  const searchParams = useSearchParams(); // <-- 3. Tangkap URL parameter
  const searchQuery = (searchParams.get('q') || '').toLowerCase();

  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [reportsData, setReportsData] = React.useState<any[]>([]);

  // State untuk Custom Modals
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  // State untuk Modal Konfirmasi Ban
  const [banModal, setBanModal] = React.useState({
    isOpen: false,
    freelancerId: '',
    entityName: '',
    reportId: ''
  });

  // Filter States
  const [urgencyFilter, setUrgencyFilter] = React.useState('All');
  const [statusFilter, setStatusFilter] = React.useState('All');

  // Helper Notifikasi Sukses
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const fetchReports = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (reports && reports.length > 0) {
        const userIds = [
          ...reports.map(r => r.reporter_id),
          ...reports.map(r => r.reported_user_id)
        ].filter(Boolean);

        const uniqueUserIds = [...new Set(userIds)];
        let profileMap = new Map();

        if (uniqueUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', uniqueUserIds);

          profileMap = new Map(profiles?.map(p => [p.id, p.full_name]));
        }

        const formattedReports = reports.map(r => {
          const reporterName = profileMap.get(r.reporter_id) || 'Unknown User';
          const reportedName = profileMap.get(r.reported_user_id) || 'Unknown Freelancer';

          const initials = reportedName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

          const colorClasses = [
            'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
            'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
            'bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-500/20',
            'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
          ];
          const colorIndex = (initials.charCodeAt(0) || 0) % colorClasses.length;

          const isCritical = ['fraud', 'not_delivered'].includes(r.reason);
          const date = new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          const formattedReason = r.reason.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

          return {
            id: r.id,
            displayId: `#REP-${r.id.substring(0, 5).toUpperCase()}`,
            date: date,
            entityName: reportedName,
            entityType: 'user',
            entityInitials: initials,
            entityBg: colorClasses[colorIndex],
            reportedBy: reporterName,
            reason: formattedReason,
            rawReason: r.reason,
            description: r.description,
            urgency: isCritical ? 'critical' : 'minor',
            status: r.status || 'pending',
            freelancerId: r.reported_user_id
          };
        });

        setReportsData(formattedReports);
      }
    } catch (error: any) {
      console.error("Gagal menarik data reports:", error);
      setErrorMsg(error.message || "Gagal memuat data laporan.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // AKSI: Tandai Selesai (Resolve)
  const handleResolve = async (id: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'resolved' })
        .eq('id', id);

      if (error) throw error;

      showSuccess("Laporan telah berhasil ditandai sebagai Selesai (Resolved).");
      fetchReports();
    } catch (error: any) {
      console.error("Gagal update status:", error);
      setErrorMsg("Gagal mengupdate laporan: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Buka Modal Ban
  const openBanConfirm = (freelancerId: string, entityName: string, reportId: string) => {
    if (!freelancerId) {
      setErrorMsg("Gagal memblokir: ID Pengguna tidak ditemukan (Mungkin akun telah dihapus).");
      return;
    }
    setBanModal({ isOpen: true, freelancerId, entityName, reportId });
  };

  // AKSI: Ban / Suspend User
  const executeBan = async () => {
    setIsSubmitting(true);
    try {
      // 1. Ubah status user menjadi suspended di tabel users
      const { error: userError } = await supabase
        .from('users')
        .update({ status: 'suspended' })
        .eq('id', banModal.freelancerId);

      if (userError) throw userError;

      // 2. Tandai laporan terkait sebagai resolved
      await supabase
        .from('reports')
        .update({ status: 'resolved' })
        .eq('id', banModal.reportId);

      setBanModal({ isOpen: false, freelancerId: '', entityName: '', reportId: '' });
      showSuccess(`Pengguna "${banModal.entityName}" berhasil diblokir (Suspended). Laporan ini telah ditutup.`);
      fetchReports();
    } catch (error: any) {
      console.error("Gagal melakukan Ban:", error);
      setErrorMsg("Gagal memblokir pengguna: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. LOGIKA PENCARIAN & FILTER DIGABUNG
  const filteredReports = reportsData
    .filter(r => urgencyFilter === 'All' || r.urgency === urgencyFilter)
    .filter(r => statusFilter === 'All' || r.status === statusFilter)
    .filter(r => {
      // Jika search bar kosong, tampilkan semua
      if (!searchQuery) return true;

      // Jika ada teks, cek kecocokan dengan ID, nama pelapor, nama terlapor, atau alasan
      return (
        r.displayId.toLowerCase().includes(searchQuery) ||
        r.entityName.toLowerCase().includes(searchQuery) ||
        r.reportedBy.toLowerCase().includes(searchQuery) ||
        r.reason.toLowerCase().includes(searchQuery)
      );
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Memuat data laporan...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Title & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reports & Moderation</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tinjau keluhan pengguna dan jaga keamanan ekosistem StudentHub.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 pr-10 py-2 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:border-cyan-500 dark:focus:border-slate-700 cursor-pointer transition-colors"
              >
                <option value="All">Urgency: All</option>
                <option value="critical">Urgency: Critical</option>
                <option value="minor">Urgency: Minor</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 pr-10 py-2 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:border-cyan-500 dark:focus:border-slate-700 cursor-pointer transition-colors"
              >
                <option value="All">Status: All</option>
                <option value="pending">Status: Pending</option>
                <option value="resolved">Status: Resolved</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Reports Table Card */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden shadow-sm dark:shadow-xl transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-900/30">
                  <th className="py-4.5 px-6 font-semibold">REPORT ID & DATE</th>
                  <th className="py-4.5 px-6 font-semibold">REPORTED ENTITY</th>
                  <th className="py-4.5 px-6 font-semibold">REPORTED BY</th>
                  <th className="py-4.5 px-6 font-semibold">REASON</th>
                  <th className="py-4.5 px-6 font-semibold">URGENCY</th>
                  <th className="py-4.5 px-6 font-semibold">STATUS</th>
                  <th className="py-4.5 px-6 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredReports.length > 0 ? (
                  filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group">
                      <td className="py-4.5 px-6">
                        <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-white transition-colors">{r.displayId}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{r.date}</p>
                      </td>

                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3">
                          {r.entityType === 'user' ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] select-none border shrink-0 ${r.entityBg}`}>
                              {r.entityInitials}
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                              <Terminal className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{r.entityName}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Freelancer</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4.5 px-6 font-medium text-slate-700 dark:text-slate-300">{r.reportedBy}</td>

                      <td className="py-4.5 px-6">
                        <p className="text-slate-800 dark:text-slate-300 font-semibold mb-0.5">{r.reason}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs line-clamp-2" title={r.description}>
                          {r.description || 'Tidak ada deskripsi tambahan.'}
                        </p>
                      </td>

                      <td className="py-4.5 px-6">
                        {r.urgency === 'critical' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 uppercase tracking-wide">
                            Critical
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-wide">
                            Minor
                          </span>
                        )}
                      </td>

                      <td className="py-4.5 px-6">
                        {r.status === 'pending' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-[9px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 uppercase tracking-wider">
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-bold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Resolved
                          </span>
                        )}
                      </td>

                      <td className="py-4.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === 'pending' ? (
                            <button
                              disabled={isSubmitting}
                              onClick={() => handleResolve(r.id)}
                              className="h-8 px-4 rounded border border-cyan-200 dark:border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-white hover:bg-cyan-500 dark:hover:text-cyan-300 dark:hover:bg-cyan-500/20 transition-all cursor-pointer select-none disabled:opacity-50"
                            >
                              Resolve
                            </button>
                          ) : (
                            <button disabled className="h-8 px-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-transparent text-[10px] font-bold text-slate-400 dark:text-slate-600 cursor-not-allowed select-none">
                              Resolved
                            </button>
                          )}
                          <button
                            disabled={isSubmitting}
                            onClick={() => openBanConfirm(r.freelancerId, r.entityName, r.id)}
                            className="h-8 px-4 rounded border border-red-200 dark:border-red-500/20 bg-transparent text-[10px] font-bold text-red-600 dark:text-red-400 hover:text-white hover:bg-red-500 dark:hover:bg-red-500/30 transition-all cursor-pointer select-none disabled:opacity-50"
                          >
                            Ban User
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <Inbox className="w-10 h-10 mb-3 opacity-50" />
                        <p className="font-medium text-sm">
                          {searchQuery ? `Hasil pencarian "${searchQuery}" tidak ditemukan.` : 'Belum ada laporan yang ditemukan.'}
                        </p>
                        {!searchQuery && <p className="text-[10px] mt-1">Ekosistem bersih dan aman.</p>}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredReports.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090d16]/30 px-6 py-4.5 transition-colors">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">1-{filteredReports.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{reportsData.length}</span> Reports
              </p>
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent cursor-not-allowed transition-colors" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="w-8 h-8 rounded-md bg-cyan-500 text-white dark:bg-[#00d8ff] dark:text-slate-950 text-xs font-bold flex items-center justify-center shadow-md dark:shadow-[0_1px_6px_rgba(0,216,255,0.4)] transition-all">
                  1
                </button>
                <button className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent cursor-not-allowed transition-colors" disabled>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ========================================== */}
      {/* MODAL KONFIRMASI BAN */}
      {/* ========================================== */}
      {banModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">Blokir Pengguna (Ban)</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Apakah Anda yakin ingin memblokir akun <span className="font-bold text-slate-900 dark:text-white">"{banModal.entityName}"</span>?
                Pengguna ini tidak akan bisa lagi menawarkan jasa di dalam platform.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button disabled={isSubmitting} onClick={() => setBanModal({ isOpen: false, freelancerId: '', entityName: '', reportId: '' })} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer disabled:opacity-50">
                Batal
              </button>
              <button disabled={isSubmitting} onClick={executeBan} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                Blokir Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {successMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-center text-xl font-black text-slate-900 dark:text-white mb-2">
              Berhasil!
            </h2>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
              {successMsg}
            </p>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {errorMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
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
    </>
  );
}