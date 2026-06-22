'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';
import {
  Plus,
  Save,
  Edit2,
  Trash2,
  Palette,
  Terminal,
  GraduationCap,
  Camera,
  Layers,
  Briefcase,
  MonitorSmartphone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FolderOpen,
  X,
  AlertCircle,
  CheckCircle2,
  Tag
} from 'lucide-react';

// 2. Bungkus dengan Suspense
export default function AdminCategoriesPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    }>
      <CategoriesContent />
    </React.Suspense>
  );
}

interface Category {
  id: string;
  name: string;
  description: string;
  servicesCount: number;
  status: string;
  icon: React.ReactNode;
  iconBg: string;
}

const iconPresets = [
  { icon: <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />, bg: 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20' },
  { icon: <Terminal className="h-5 w-5 text-teal-600 dark:text-teal-400" />, bg: 'bg-teal-50 border-teal-200 dark:bg-teal-500/10 dark:border-teal-500/20' },
  { icon: <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />, bg: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20' },
  { icon: <Camera className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />, bg: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-500/10 dark:border-cyan-500/20' },
  { icon: <MonitorSmartphone className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />, bg: 'bg-fuchsia-50 border-fuchsia-200 dark:bg-fuchsia-500/10 dark:border-fuchsia-500/20' },
  { icon: <Briefcase className="h-5 w-5 text-amber-600 dark:text-amber-400" />, bg: 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' },
  { icon: <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' },
];

function CategoriesContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get('q') || '').toLowerCase();

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  const [formModal, setFormModal] = React.useState({
    isOpen: false,
    mode: 'add' as 'add' | 'edit',
    id: '',
    name: '',
    description: ''
  });

  const [deleteModal, setDeleteModal] = React.useState({
    isOpen: false,
    id: '',
    name: ''
  });

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const fetchCategoriesData = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (catError) throw catError;

      const { data: svcData, error: svcError } = await supabase
        .from('services')
        .select('category_id');

      if (svcError) throw svcError;

      if (catData) {
        const formattedCategories = catData.map((cat: { id: string; name: string | null; description: string | null; status: string | null; }, index: number) => {
          const totalServices = svcData ? svcData.filter((s: { category_id: string | null; }) => s.category_id === cat.id).length : 0;
          const preset = iconPresets[index % iconPresets.length];

          return {
            id: cat.id,
            name: cat.name || 'Unnamed Category',
            description: cat.description || 'Tidak ada deskripsi untuk kategori ini.',
            servicesCount: totalServices,
            status: cat.status || 'active',
            icon: preset.icon,
            iconBg: preset.bg
          };
        });

        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error("Gagal menarik data kategori:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    Promise.resolve().then(() => {
      fetchCategoriesData();
    });
  }, [fetchCategoriesData]);

  const openAddModal = () => {
    setFormModal({ isOpen: true, mode: 'add', id: '', name: '', description: '' });
  };

  const openEditModal = (cat: Category) => {
    setFormModal({ isOpen: true, mode: 'edit', id: cat.id, name: cat.name, description: cat.description });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formModal.name.trim()) {
      setErrorMsg("Nama kategori tidak boleh kosong!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (formModal.mode === 'add') {
        const slug = formModal.name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');

        const { error } = await supabase
          .from('categories')
          .insert([
            {
              name: formModal.name.trim(),
              slug,
              description: formModal.description.trim()
            }
          ]);

        if (error) throw error;
        showSuccess('Kategori baru berhasil ditambahkan!');
      } else {
        const slug = formModal.name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');

        const { error } = await supabase
          .from('categories')
          .update({
            name: formModal.name.trim(),
            slug,
            description: formModal.description.trim()
          })
          .eq('id', formModal.id);

        if (error) throw error;
        showSuccess('Kategori berhasil diperbarui!');
      }

      setFormModal({ ...formModal, isOpen: false });
      fetchCategoriesData();
    } catch (error) {
      const err = error as Error;
      console.error("Error saving category:", err);
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan data ke database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const executeDelete = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', deleteModal.id);

      if (error) throw error;

      showSuccess(`Kategori "${deleteModal.name}" berhasil dihapus dari sistem.`);
      setDeleteModal({ isOpen: false, id: '', name: '' });
      fetchCategoriesData();
    } catch (error) {
      const err = error as Error;
      console.error("Error deleting category:", err);
      setErrorMsg(err.message || "Gagal menghapus kategori. Pastikan tidak ada layanan yang terkait dengan kategori ini.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. LOGIKA PENCARIAN & FILTER
  const filteredCategories = categories.filter(cat => {
    if (!searchQuery) return true; // Loloskan semua jika kosong

    const matchName = cat.name?.toLowerCase().includes(searchQuery);
    const matchDesc = cat.description?.toLowerCase().includes(searchQuery);

    return matchName || matchDesc;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Memuat data kategori...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Category Management</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kelola daftar kategori utama untuk layanan dan jasa di dalam platform StudentHub untuk optimasi navigasi pengguna.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="h-10 sm:h-9.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-[#00d8ff] dark:hover:bg-cyan-400 dark:text-slate-950 px-4 text-xs font-bold flex items-center gap-1.5 active:scale-[0.99] transition-all cursor-pointer select-none shadow-sm dark:shadow-[0_0_10px_rgba(0,216,255,0.2)]"
          >
            <Plus className="h-4 w-4" />
            Add New Category
          </button>
        </div>

        <Card className="border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0c1222]/50 overflow-hidden shadow-sm dark:shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-900 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-900/30">
                  <th className="py-4.5 px-6 font-semibold w-1/4">CATEGORY NAME</th>
                  <th className="py-4.5 px-6 font-semibold w-2/5">DESCRIPTION</th>
                  <th className="py-4.5 px-6 font-semibold text-center">TOTAL SERVICES</th>
                  <th className="py-4.5 px-6 font-semibold text-center">STATUS</th>
                  <th className="py-4.5 px-6 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group">
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className={`p-2.5 rounded-lg border flex items-center justify-center shrink-0 ${cat.iconBg}`}>
                            {cat.icon}
                          </div>
                          <p className="font-bold text-slate-700 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white transition-colors text-sm line-clamp-1">
                            {cat.name}
                          </p>
                        </div>
                      </td>

                      <td className="py-4.5 px-6 text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm line-clamp-2">
                        {cat.description}
                      </td>

                      <td className="py-4.5 px-6 text-center">
                        <span className="font-bold text-slate-700 dark:text-slate-200">{cat.servicesCount}</span>
                        <span className="text-slate-500 dark:text-slate-400 ml-1">Services</span>
                      </td>

                      <td className="py-4.5 px-6 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded text-[9px] font-bold bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20 uppercase tracking-wider">
                          {cat.status}
                        </span>
                      </td>

                      <td className="py-4.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(cat.id, cat.name)}
                            className="p-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 border border-transparent hover:border-red-200 dark:hover:border-red-500/20 transition-all cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <FolderOpen className="w-10 h-10 mb-3 opacity-50" />
                        <p className="font-medium text-sm">
                          {searchQuery ? `Hasil pencarian "${searchQuery}" tidak ditemukan.` : 'Belum ada kategori yang ditambahkan.'}
                        </p>
                        {!searchQuery && (
                          <button
                            onClick={openAddModal}
                            className="mt-4 text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 text-xs font-bold underline underline-offset-2 transition-colors cursor-pointer"
                          >
                            Buat kategori pertama Anda
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredCategories.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-[#090d16]/30 px-6 py-4.5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">1-{filteredCategories.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{categories.length}</span> Categories
              </p>
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent cursor-not-allowed transition-colors" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="w-8 h-8 rounded-md bg-cyan-500 text-white dark:bg-[#00d8ff] dark:text-slate-950 text-xs font-bold flex items-center justify-center shadow-sm dark:shadow-[0_1px_6px_rgba(0,216,255,0.4)]">
                  1
                </button>
                <button className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent cursor-not-allowed transition-colors" disabled>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 1. MODAL FORM (ADD/EDIT) */}
      {formModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <form onSubmit={handleSaveCategory}>
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-500">
                  <Tag className="w-5 h-5" />
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {formModal.mode === 'add' ? 'Tambah Kategori Baru' : 'Edit Kategori'}
                  </h3>
                </div>
                <button type="button" disabled={isSubmitting} onClick={() => setFormModal({ ...formModal, isOpen: false })} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Nama Kategori</label>
                  <input
                    autoFocus
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={formModal.name}
                    onChange={(e) => setFormModal({ ...formModal, name: e.target.value })}
                    placeholder="Contoh: Desain Grafis"
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Deskripsi</label>
                  <textarea
                    rows={3}
                    disabled={isSubmitting}
                    value={formModal.description}
                    onChange={(e) => setFormModal({ ...formModal, description: e.target.value })}
                    placeholder="Tuliskan deskripsi singkat mengenai kategori ini..."
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
                <button type="button" disabled={isSubmitting} onClick={() => setFormModal({ ...formModal, isOpen: false })} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer disabled:opacity-50">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (formModal.mode === 'add' ? <Plus className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                  {formModal.mode === 'add' ? 'Tambahkan' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL CONFIRM DELETE */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">Hapus Kategori</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Apakah Anda yakin ingin menghapus kategori <span className="font-bold text-slate-900 dark:text-white">&quot;{deleteModal.name}&quot;</span>? Tindakan ini dapat memengaruhi layanan aktif yang terhubung dengannya.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button disabled={isSubmitting} onClick={() => setDeleteModal({ isOpen: false, id: '', name: '' })} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer disabled:opacity-50">
                Batal
              </button>
              <button disabled={isSubmitting} onClick={executeDelete} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUCCESS MODAL */}
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

      {/* 4. ERROR MODAL */}
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