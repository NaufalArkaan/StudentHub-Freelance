'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import {
  Eye,
  CheckCircle,
  CheckCircle2,
  Laptop,
  Smartphone,
  Home,
  Loader2,
  UserX,
  ExternalLink,
  AlertCircle,
  X,
  Info
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminPortfoliosPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    }>
      <PortfolioContent />
    </React.Suspense>
  );
}

function PortfolioContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const searchQuery = (searchParams.get('q') || '').toLowerCase();
  const router = useRouter();
  const supabase = createClient();

  const [feedback, setFeedback] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  interface FreelancerDetail {
    id: string;
    name: string;
    nim?: string;
    avatar_url?: string;
    status: string;
    created_at: string;
    initials: string;
  }

  interface PortfolioItem {
    id: string;
    title: string;
    category?: string;
    description?: string;
    image_url?: string;
    file_url?: string;
    link?: string;
    url?: string;
    project_url?: string;
    portfolio_url?: string;
  }

  const [freelancer, setFreelancer] = React.useState<FreelancerDetail | null>(null);
  const [portfolios, setPortfolios] = React.useState<PortfolioItem[]>([]);

  // State untuk Custom Modals
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [confirmConfig, setConfirmConfig] = React.useState<{ isOpen: boolean, type: 'approve' | 'reject' | '', msg: string, action: (() => void) | null }>({ isOpen: false, type: '', msg: '', action: null });
  const [infoConfig, setInfoConfig] = React.useState<{ isOpen: boolean, title: string, content: React.ReactNode | string }>({ isOpen: false, title: '', content: '' });

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
      router.push('/admin/users');
    }, 2500);
  };

  React.useEffect(() => {
    const fetchPortfolioData = async () => {
      setLoading(true);
      try {
        let userQuery = supabase
          .from('users')
          .select('id, role, status, created_at, profiles(full_name, nim, avatar_url)')
          .eq('role', 'freelancer');

        if (userId) {
          userQuery = userQuery.eq('id', userId);
        } else {
          userQuery = userQuery.eq('status', 'pending');
        }

        const { data: userData, error: userError } = await userQuery.order('created_at', { ascending: false }).limit(1).single();

        if (userError || !userData) {
          setFreelancer(null);
          return;
        }

        const profileData = Array.isArray(userData.profiles) ? userData.profiles[0] : userData.profiles;

        setFreelancer({
          id: userData.id,
          name: profileData?.full_name || 'Unnamed Freelancer',
          nim: profileData?.nim,
          avatar_url: profileData?.avatar_url,
          status: userData.status,
          created_at: userData.created_at,
          initials: (profileData?.full_name || 'UN').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        });

        const { data: portsData } = await supabase
          .from('portfolios')
          .select('*')
          .eq('freelancer_id', userData.id);

        if (portsData) {
          setPortfolios(portsData);
        }

      } catch (error) {
        console.error("Error fetching portfolio details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [supabase, userId]);

  // FUNGSI EKSEKUSI DATABASE
  const executeApprove = async () => {
    if (!freelancer) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('users').update({ status: 'active' }).eq('id', freelancer.id);
      if (error) throw error;
      showSuccess('Portofolio disetujui! Akun freelancer kini Aktif.');
    } catch (error) {
      console.error("Approve error:", error);
      setErrorMsg('Gagal mengaktifkan akun. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeReject = async () => {
    if (!freelancer) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('users').update({ status: 'suspended' }).eq('id', freelancer.id);
      if (error) throw error;
      showSuccess(`Portofolio ditolak dengan catatan: "${feedback || 'Tidak ada feedback'}"`);
    } catch (error) {
      console.error("Reject error:", error);
      setErrorMsg('Gagal menolak akun. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // FUNGSI TRIGGER MODAL
  const handleApprove = () => {
    setConfirmConfig({
      isOpen: true,
      type: 'approve',
      msg: `Apakah Anda yakin ingin menyetujui portofolio ini dan mengaktifkan akun ${freelancer?.name}?`,
      action: executeApprove
    });
  };

  const handleReject = () => {
    setConfirmConfig({
      isOpen: true,
      type: 'reject',
      msg: `Apakah Anda yakin ingin menolak portofolio ini? Akun ${freelancer?.name} akan ditandai sebagai suspended.`,
      action: executeReject
    });
  };

  const handleOpenPortfolio = (port: PortfolioItem) => {
    const fileLink = port.file_url || port.link || port.url || port.project_url || port.portfolio_url;

    setInfoConfig({
      isOpen: true,
      title: 'Detail Proyek Portofolio',
      content: (
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Judul Proyek</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{port.title || 'Tanpa Judul'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kategori</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{port.category || 'Desain'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deskripsi</p>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg mt-1 border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {port.description || 'Freelancer tidak menyertakan deskripsi detail untuk proyek ini.'}
              </p>
            </div>
          </div>
          {fileLink ? (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <a
                href={fileLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-cyan-500 hover:bg-cyan-600 dark:bg-[#00d8ff] dark:hover:bg-cyan-400 dark:text-slate-950 px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Lihat File / Link Portofolio
              </a>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-4">
              <p className="text-[10px] text-amber-600 dark:text-amber-500 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Catatan: Tidak ada tautan file yang disematkan pada proyek ini.
              </p>
            </div>
          )}
        </div>
      )
    });
  };

  const mockupStyles = [
    { icon: <Laptop className="h-10 w-10 text-blue-500/40 dark:text-blue-400/40 relative z-10 group-hover:scale-105 transition-transform" />, bg: 'from-blue-100 to-indigo-100 dark:from-blue-900/10 dark:to-indigo-900/20', label: 'Web/Dashboard' },
    { icon: <Smartphone className="h-10 w-10 text-indigo-500/40 dark:text-indigo-400/40 relative z-10 group-hover:scale-105 transition-transform" />, bg: 'from-indigo-100 to-purple-100 dark:from-indigo-900/10 dark:to-purple-900/20', label: 'Mobile App' },
    { icon: <Home className="h-10 w-10 text-teal-500/40 dark:text-teal-400/40 relative z-10 group-hover:scale-105 transition-transform" />, bg: 'from-teal-100 to-cyan-100 dark:from-teal-900/10 dark:to-cyan-900/20', label: 'Smart System' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
        <p className="text-slate-500 font-medium">Memuat detail portofolio...</p>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-500">
        <UserX className="h-12 w-12 opacity-50" />
        <p className="font-medium">Freelancer tidak ditemukan atau belum mengunggah portofolio.</p>
        <button onClick={() => router.push('/admin/users')} className="text-cyan-500 hover:underline text-sm mt-2">
          Kembali ke Manajemen User
        </button>
      </div>
    );
  }

  const joinDate = new Date(freelancer.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Portfolio Moderation</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review and verify freelancer portfolio submissions to maintain platform quality.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          <div className="lg:col-span-2 space-y-6">

            <Card className="border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0c1222]/50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
                  {freelancer.avatar_url ? (
                    <img src={freelancer.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600 to-indigo-700 flex items-center justify-center font-bold text-white text-base">
                      {freelancer.initials}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-none">{freelancer.name}</h2>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${freelancer.status === 'active'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                      : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                      }`}>
                      {freelancer.status === 'active' ? 'Active User' : 'Pending Review'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-450 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                      Freelancer
                    </span>
                    {freelancer.nim && (
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-450 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                        NIM: {freelancer.nim}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500 font-semibold mt-2">
                    Joined {joinDate} • {portfolios.length} Projects Uploaded
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInfoConfig({
                  isOpen: true,
                  title: 'Informasi Navigasi',
                  content: `Fitur View Full Profile akan mengarahkan Admin ke halaman publik profil freelancer:\n\n/freelancer/${freelancer.id}\n\n(Fitur dalam pengembangan)`
                })}
                className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900 rounded-lg px-3.5 py-2 hover:border-slate-300 dark:hover:border-slate-850 cursor-pointer shadow-sm dark:shadow-none"
              >
                <Eye className="h-3.5 w-3.5" />
                View Full Profile
              </button>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(() => {
                const filteredPortfolios = portfolios.filter(p => {
                  if (!searchQuery) return true;
                  const matchTitle = p.title?.toLowerCase().includes(searchQuery);
                  const matchDesc = p.description?.toLowerCase().includes(searchQuery);
                  const matchCategory = p.category?.toLowerCase().includes(searchQuery);
                  return matchTitle || matchDesc || matchCategory;
                });

                if (filteredPortfolios.length === 0) {
                  return (
                    <div className="col-span-3 py-10 text-center text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      {searchQuery ? `Hasil pencarian "${searchQuery}" tidak ditemukan.` : 'Freelancer ini belum memiliki item portofolio yang diunggah.'}
                    </div>
                  );
                }

                return filteredPortfolios.map((port, idx) => {
                  const style = mockupStyles[idx % mockupStyles.length];
                  const hasImage = port.file_url && !port.file_url.toLowerCase().endsWith('.pdf');

                  return (
                    <div
                      key={port.id || idx}
                      onClick={() => handleOpenPortfolio(port)}
                      className="cursor-pointer bg-white dark:bg-[#0c1222]/50 border border-slate-200 dark:border-slate-900 rounded-xl overflow-hidden group hover:border-cyan-400 dark:hover:border-cyan-800 hover:shadow-md transition-all flex flex-col h-full shadow-sm dark:shadow-none"
                      title="Klik untuk melihat detail portofolio"
                    >
                      <div className="h-32 bg-slate-50 dark:bg-[#080d16] flex items-center justify-center border-b border-slate-200 dark:border-slate-900 relative overflow-hidden">
                        {hasImage ? (
                          <img src={port.file_url} alt={port.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <>
                            <div className={`absolute inset-0 bg-gradient-to-br ${style.bg}`} />
                            {style.icon}
                            <div className="absolute bottom-2 left-2 text-[8px] bg-white/80 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 font-mono px-1 rounded backdrop-blur-sm border border-slate-200/50 dark:border-transparent">
                              {port.file_url?.toLowerCase().endsWith('.pdf') ? 'PDF DOKUMEN' : style.label}
                            </div>
                          </>
                        )}

                        {/* Hover Overlay Icon */}
                        <div className="absolute inset-0 bg-slate-900/30 dark:bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                          <ExternalLink className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      </div>
                      <div className="p-3.5 flex flex-col justify-between flex-grow">
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">{port.title || 'Untitled Project'}</h3>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="text-[8px] font-bold text-slate-500 uppercase">{port.category || 'Design'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <Card className="border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0c1222]/50 p-6 space-y-6 shadow-sm dark:shadow-none">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-900 pb-3">Submission Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div>
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Original Submission Date</p>
                  <p className="text-slate-700 dark:text-slate-200 font-medium mt-1.5">{joinDate}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Verification Level</p>
                  <p className="text-slate-700 dark:text-slate-200 font-medium mt-1.5">Standard Freelancer</p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Account Status</p>
                  <p className="text-slate-700 dark:text-slate-200 font-medium mt-1.5 capitalize">{freelancer.status}</p>
                </div>
              </div>
            </Card>

          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0c1222]/50 p-6 space-y-5 shadow-sm dark:shadow-none">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Moderator Panel</h3>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Admin Notes / Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback..."
                  className="w-full h-24 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 dark:focus:border-slate-700 dark:focus:ring-slate-700 transition-all resize-none"
                />
                <p className="text-[9px] text-slate-500 leading-normal">
                  Feedback will be visible to the freelancer if rejected or revision requested.
                </p>
              </div>

              <div className="space-y-2.5 pt-1.5">
                <button
                  disabled={isSubmitting || freelancer.status === 'active'}
                  onClick={handleApprove}
                  className="w-full h-9.5 rounded-lg bg-cyan-500 text-white dark:bg-[#00d8ff] dark:text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-cyan-600 dark:hover:bg-cyan-400 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm dark:shadow-none"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {freelancer.status === 'active' ? 'Already Approved' : 'Approve Portfolio'}
                </button>

                <button
                  disabled={isSubmitting}
                  onClick={handleReject}
                  className="w-full h-9.5 rounded-lg border border-red-200 dark:border-red-500/20 bg-transparent text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
                >
                  Reject / Request Revision
                </button>
              </div>
            </Card>

            <Card className="border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0c1222]/50 p-6 space-y-4 shadow-sm dark:shadow-none">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-slate-400 dark:text-slate-550" />
                Quality Standards
              </h3>

              <ul className="space-y-3 text-xs font-medium text-slate-600 dark:text-slate-350">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Projects must have clear titles.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Thumbnails must be high-resolution.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Tool badges must be relevant.
                </li>
              </ul>
            </Card>

          </div>

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

      {/* 3. CONFIRM MODAL (Approve & Reject) */}
      {confirmConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <AlertCircle className={`w-5 h-5 ${confirmConfig.type === 'approve' ? 'text-cyan-500' : 'text-amber-500'}`} />
              <h3 className="font-bold text-slate-900 dark:text-white">Konfirmasi Tindakan</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {confirmConfig.msg}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button onClick={() => setConfirmConfig({ isOpen: false, type: '', msg: '', action: null })} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer">
                Batal
              </button>
              <button onClick={() => { setConfirmConfig({ isOpen: false, type: '', msg: '', action: null }); if (confirmConfig.action) confirmConfig.action(); }} className={`px-6 py-2.5 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer ${confirmConfig.type === 'approve' ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-red-500 hover:bg-red-600'}`}>
                {confirmConfig.type === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. INFO MODAL (Detail Portofolio / Notifikasi Link) */}
      {infoConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-cyan-500">
                <Info className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-white">{infoConfig.title}</h3>
              </div>
              <button onClick={() => setInfoConfig({ isOpen: false, title: '', content: '' })} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Render content as ReactNode */}
              {typeof infoConfig.content === 'string' ? (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{infoConfig.content}</p>
              ) : (
                infoConfig.content
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
              <button onClick={() => setInfoConfig({ isOpen: false, title: '', content: '' })} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}