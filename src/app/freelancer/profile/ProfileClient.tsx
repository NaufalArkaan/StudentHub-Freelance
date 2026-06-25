'use client';

import * as React from 'react';
import { Plus, User as UserIcon, Briefcase, FileText, Loader2, Trash2, RefreshCcw, Edit2, X, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Helper functions for filename generation to prevent React Compiler purity error (calling Date.now() during render analysis)
const generateAvatarFileName = (userId: string, originalName: string) => {
  const fileExt = originalName.split('.').pop();
  return `avatars/${userId}-${Date.now()}.${fileExt}`;
};

const generatePortfolioFileName = (userId: string, originalName: string) => {
  const fileExt = originalName.split('.').pop();
  return `${userId}-${Date.now()}.${fileExt}`;
};

export default function ProfileClient({
  user,
  initialProfile,
  initialPortfolios
}: {
  user: { id: string; email?: string },
  initialProfile: { nim?: string; program_study?: string; skills?: string[]; avatar_url?: string; bio?: string },
  initialPortfolios: { id: string; title: string; file_url: string }[]
}) {
  // State untuk data profil (teks)
  const [profile, setProfile] = React.useState({
    nim: initialProfile.nim || '',
    program_study: initialProfile.program_study || '',
    skills: initialProfile.skills || [],
    avatar_url: initialProfile.avatar_url || ''
  });

  const [description, setDescription] = React.useState(
    initialProfile.bio || 'Full-stack developer specializing in modern web apps and UI design. Passionate about clean code and intuitive user experiences.'
  );

  const [portfolios, setPortfolios] = React.useState(initialPortfolios);

  // State Logika UI
  const [isEditing, setIsEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);

  // State untuk Custom Modals
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [confirmConfig, setConfirmConfig] = React.useState<{ isOpen: boolean, msg: string, action: (() => void) | null }>({ isOpen: false, msg: '', action: null });
  const [promptConfig, setPromptConfig] = React.useState<{ isOpen: boolean, file: File | null, title: string }>({ isOpen: false, file: null, title: '' });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const supabase = createClient();
  const router = useRouter();

  // Helper trigger success auto-close
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  // ==========================================
  // LOGIKA TEKS PROFIL (EDIT, SIMPAN, BATAL)
  // ==========================================
  const handleCancelEdit = () => {
    setProfile({ ...profile, nim: initialProfile.nim || '', program_study: initialProfile.program_study || '' });
    setDescription(initialProfile.bio || '');
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          nim: profile.nim,
          program_study: profile.program_study,
          bio: description
        })
        .eq('id', user.id);

      if (error) throw error;
      showSuccess('Data diri berhasil diperbarui!');
      setIsEditing(false);
      router.refresh();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrorMsg('Gagal memperbarui profil: ' + (error.message || 'Terjadi kesalahan sistem.'));
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGIKA FOTO PROFIL (UPLOAD & RESET)
  // ==========================================
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const fileName = generateAvatarFileName(user.id, file.name);

      const { error: uploadError } = await supabase.storage.from('portfolios').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('portfolios').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      if (dbError) throw dbError;

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      showSuccess('Foto profil berhasil diperbarui!');
      router.refresh();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setErrorMsg('Gagal memperbarui foto profil.');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const confirmResetAvatar = () => {
    setConfirmConfig({
      isOpen: true,
      msg: "Yakin ingin mereset foto kembali ke foto asli KTM?",
      action: async () => {
        setConfirmConfig({ isOpen: false, msg: '', action: null });
        try {
          setIsUploadingAvatar(true);
          const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
          if (error) throw error;

          setProfile((prev) => ({ ...prev, avatar_url: '' }));
          showSuccess('Foto profil berhasil direset!');
          router.refresh();
        } catch (error) {
          console.error("Error resetting avatar:", error);
          setErrorMsg('Gagal mereset foto profil.');
        } finally {
          setIsUploadingAvatar(false);
        }
      }
    });
  };

  // ==========================================
  // LOGIKA PORTOFOLIO (UPLOAD & DELETE)
  // ==========================================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Tampilkan Custom Prompt Modal daripada window.prompt
    setPromptConfig({ isOpen: true, file, title: file.name.split('.')[0] });
  };

  const executeUploadPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    const { file, title } = promptConfig;
    if (!file || !title) return;

    setPromptConfig({ isOpen: false, file: null, title: '' });

    try {
      setIsUploading(true);
      const fileName = generatePortfolioFileName(user.id, file.name);

      const { error: uploadError } = await supabase.storage.from('portfolios').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('portfolios').getPublicUrl(fileName);

      const { data: newPortfolio, error: dbError } = await supabase.from('portfolios').insert([{ freelancer_id: user.id, title: title, file_url: publicUrl }]).select().single();
      if (dbError) throw dbError;

      setPortfolios([newPortfolio, ...portfolios]);
      showSuccess('Karya berhasil ditambahkan ke portofolio!');
    } catch (error) {
      console.error("Error uploading portfolio:", error);
      setErrorMsg("Gagal mengupload portofolio.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmDeletePortfolio = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      msg: "Yakin ingin menghapus karya ini dari portofolio Anda?",
      action: async () => {
        setConfirmConfig({ isOpen: false, msg: '', action: null });
        try {
          const { error } = await supabase.from('portfolios').delete().eq('id', id);
          if (error) throw error;
          setPortfolios(portfolios.filter(porto => porto.id !== id));
          showSuccess('Karya berhasil dihapus!');
        } catch (error) {
          console.error("Error deleting portfolio:", error);
          setErrorMsg("Gagal menghapus karya.");
        }
      }
    });
  };

  const getAvatar = () => {
    if (profile.avatar_url) return profile.avatar_url;
    if (profile.nim && profile.nim.length >= 4) {
      return `https://krs.umm.ac.id/Poto/${profile.nim.slice(0, 4)}/${profile.nim}.JPG`;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ===== KOLOM KIRI: DATA DIRI ===== */}
        <div className="lg:col-span-1">

          {/* Header & Tombol Edit Teks */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
              Data Diri
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Ubah
              </button>
            )}
          </div>

          {/* Input File Khusus Avatar */}
          <input hidden type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} />

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
            <div
              onClick={() => !isUploadingAvatar && avatarInputRef.current?.click()}
              className={`w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 p-1 relative group cursor-pointer transition-transform active:scale-95
                ${isUploadingAvatar ? 'opacity-70 cursor-wait' : ''}`}
              title="Klik untuk mengubah foto profil"
            >
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500 dark:border-cyan-400 pointer-events-none"></div>
              {isUploadingAvatar ? (
                <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
                </div>
              ) : (
                <img src={getAvatar()} alt="Profile" className="w-full h-full rounded-full object-cover bg-slate-200 dark:bg-slate-800" />
              )}
              {!isUploadingAvatar && (
                <div className="absolute inset-1 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Ubah</span>
                </div>
              )}
            </div>

            {/* Tombol Reset (Hanya muncul jika pakai foto upload) */}
            {profile.avatar_url && !isUploadingAvatar && (
              <button onClick={confirmResetAvatar} className="mt-4 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">
                <RefreshCcw className="w-3.5 h-3.5" /> Kembalikan ke Foto NIM
              </button>
            )}
          </div>

          {/* Form Data Diri (Bisa diedit jika isEditing = true) */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Email Institusi</label>
              <input type="text" disabled value={user.email} className="w-full bg-slate-100 dark:bg-[#1f2937]/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500 focus:outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">NIM</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.nim}
                onChange={(e) => setProfile({ ...profile, nim: e.target.value })}
                className={`w-full rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 
                  ${isEditing ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Program Studi</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.program_study}
                onChange={(e) => setProfile({ ...profile, program_study: e.target.value })}
                className={`w-full rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 
                  ${isEditing ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Deskripsi Diri</label>
              <textarea
                rows={4}
                disabled={!isEditing}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full rounded-xl px-4 py-3 text-sm transition-all resize-none leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500/50 
                  ${isEditing ? 'bg-slate-50 border border-slate-300 text-slate-900' : 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'}`}
              />
            </div>

            {/* Tombol Simpan & Batal */}
            {isEditing && (
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 rounded-xl text-sm font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-all flex justify-center items-center gap-2"
                >
                  <X className="w-4 h-4" /> Batal
                </button>
                <button
                  disabled={loading}
                  onClick={handleSaveProfile}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all shadow-sm flex justify-center items-center gap-2
                    ${loading ? 'bg-slate-200 text-slate-400 cursor-wait' : 'bg-cyan-500 hover:bg-cyan-600 text-white hover:shadow-md'}`}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===== KOLOM KANAN: PORTFOLIO ===== */}
        <div className="lg:col-span-2 lg:border-l border-slate-200 dark:border-slate-800 lg:pl-8 mt-8 lg:mt-0 pt-8 lg:pt-0 border-t lg:border-t-0">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-500 dark:text-cyan-400" /> Portofolio
            </h2>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full">
              {portfolios.length} Karya
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <input type="file" accept="image/*,application/pdf" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />

            <button
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center h-56 transition-all group
                ${isUploading ? 'border-slate-200 bg-slate-50 cursor-wait' : 'border-slate-300 hover:border-cyan-500 bg-slate-50 hover:bg-slate-100 cursor-pointer'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors shadow-sm
                ${isUploading ? 'bg-slate-200' : 'bg-white group-hover:bg-cyan-50'}`}>
                {isUploading ? <Loader2 className="w-6 h-6 text-slate-400 animate-spin" /> : <Plus className="w-6 h-6 text-slate-400 group-hover:text-cyan-500" />}
              </div>
              <span className={`text-sm font-bold transition-colors ${isUploading ? 'text-slate-400' : 'text-slate-500 group-hover:text-cyan-600'}`}>
                {isUploading ? 'Mengupload...' : 'Upload Karya Baru'}
              </span>
            </button>

            {portfolios.length > 0 && portfolios.map((portfolio) => {
              const isPdf = portfolio.file_url?.toLowerCase().endsWith('.pdf');
              return (
                <div key={portfolio.id} className="relative group rounded-2xl overflow-hidden h-56 border border-slate-200 shadow-sm bg-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeletePortfolio(portfolio.id);
                    }}
                    className="absolute top-3 right-3 z-30 p-2 bg-white/90 hover:bg-red-500 hover:text-white text-slate-600 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm cursor-pointer"
                    title="Hapus Portofolio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <a
                    href={portfolio.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full cursor-pointer relative"
                  >
                    {isPdf ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                        <FileText className="w-16 h-16 text-slate-400 mb-3" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dokumen PDF</span>
                      </div>
                    ) : (
                      <img src={portfolio.file_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c'} alt={portfolio.title} onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c' }} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    )}
                    
                    <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 z-10">
                      <ExternalLink className="w-6 h-6 text-white drop-shadow-md" />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none z-10"></div>
                    <div className="absolute bottom-5 left-5 right-5 pointer-events-none z-20">
                      <h3 className="text-white font-bold text-sm truncate drop-shadow-md">{portfolio.title}</h3>
                    </div>
                  </a>
                </div>
              );
            })}
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
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
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

      {/* 3. CONFIRM MODAL (Hapus Porto / Reset Avatar) */}
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
              <button onClick={() => setConfirmConfig({ isOpen: false, msg: '', action: null })} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                Batal
              </button>
              <button onClick={() => confirmConfig.action && confirmConfig.action()} className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm">
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PROMPT MODAL (Input Judul Portofolio) */}
      {promptConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <form onSubmit={executeUploadPortfolio}>
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Upload Karya</h3>
              </div>
              <div className="p-6">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Judul Portofolio</label>
                <input
                  autoFocus
                  type="text"
                  required
                  value={promptConfig.title}
                  onChange={(e) => setPromptConfig({ ...promptConfig, title: e.target.value })}
                  placeholder="Contoh: Desain UI Aplikasi..."
                  className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />
              </div>
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
                <button type="button" onClick={() => { setPromptConfig({ isOpen: false, file: null, title: '' }); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  Batal
                </button>
                <button type="submit" className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm">
                  Upload Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
}