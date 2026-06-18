'use client';

import * as React from 'react';
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddServicePage() {
    const [loading, setLoading] = React.useState(false);

    // State untuk menyimpan kategori dari database
    const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([]);

    // Form State
    const [formData, setFormData] = React.useState({
        title: '',
        price: '',
        category_id: '',
        description: '',
    });

    // Custom Alert State
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showError, setShowError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    const supabase = createClient();
    const router = useRouter();

    // MENGAMBIL KATEGORI ASLI DARI DATABASE SUPABASE
    React.useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase.from('categories').select('*');
            if (!error && data) {
                setCategories(data);
            }
        };
        fetchCategories();
    }, [supabase]);

    // Fungsi Submit Data
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi Custom Alert: Kategori kosong
        if (!formData.category_id) {
            setErrorMessage('Mohon pilih kategori layanan terlebih dahulu agar klien mudah menemukan jasa Anda!');
            setShowError(true);
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Sesi login tidak ditemukan. Silakan login ulang.');

            const { error } = await supabase.from('services').insert([
                {
                    freelancer_id: user.id,
                    title: formData.title,
                    price: Number(formData.price), // Angka murni
                    category_id: formData.category_id, // UUID Asli
                    description: formData.description,
                    is_active: true
                }
            ]);

            if (error) throw error;

            // Tampilkan Modal Sukses dan Redirect otomatis
            setShowSuccess(true);
            setTimeout(() => {
                router.push('/freelancer/services');
                router.refresh();
            }, 2000);

        } catch (error: any) {
            console.error('Error adding service:', error);
            setErrorMessage('Terjadi kesalahan pada sistem: ' + (error.message || 'Gagal menyimpan layanan.'));
            setShowError(true);
        } finally {
            setLoading(false);
        }
    };

    // Handler Format Rupiah
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'price') {
            const numericValue = value.replace(/\D/g, '');
            setFormData({ ...formData, [name]: numericValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    return (
        <>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Link href="/freelancer/services" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-cyan-500 transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke My Services
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Buat Layanan Baru</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                        Tawarkan keahlian Anda. Isi detail layanan dengan jelas agar klien tertarik.
                    </p>
                </div>

                <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Judul Layanan <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Contoh: Pembuatan Website E-Commerce Profesional"
                                className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Kategori <span className="text-red-500">*</span></label>
                                <select
                                    name="category_id"
                                    required
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>-- Pilih Kategori --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Harga Mulai Dari (Rp) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
                                    <input
                                        type="text"
                                        name="price"
                                        required
                                        value={formData.price ? Number(formData.price).toLocaleString('id-ID') : ''}
                                        onChange={handleChange}
                                        placeholder="500.000"
                                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Deskripsi Layanan <span className="text-red-500">*</span></label>
                            <textarea
                                name="description"
                                required
                                rows={6}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Jelaskan secara detail apa yang akan klien dapatkan dari layanan ini, proses pengerjaan, dan ketentuan revisi..."
                                className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none leading-relaxed"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-4">
                            <Link href="/freelancer/services">
                                <button type="button" className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                                    Batal
                                </button>
                            </Link>
                            <button
                                type="submit"
                                disabled={loading || categories.length === 0}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white dark:text-slate-900 transition-all shadow-sm
                                    ${loading || categories.length === 0
                                        ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                                        : 'bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-400 dark:hover:bg-cyan-500 hover:shadow-md cursor-pointer'
                                    }`}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {loading ? 'Menyimpan...' : 'Terbitkan Layanan'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* CUSTOM SUCCESS MODAL */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
                    <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                            <CheckCircle2 size={40} className="text-emerald-500" />
                        </div>
                        <h2 className="text-center text-2xl font-black text-slate-900 dark:text-white mb-2">
                            Layanan Tayang!
                        </h2>
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                            Layanan baru Anda berhasil diterbitkan dan sekarang siap dipesan oleh klien.
                        </p>
                        <div className="flex justify-center">
                            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div className="h-full animate-pulse bg-emerald-500" />
                            </div>
                        </div>
                        <p className="mt-4 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
                            Mengalihkan ke My Services...
                        </p>
                    </div>
                </div>
            )}

            {/* CUSTOM ERROR MODAL */}
            {showError && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
                    <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-2 text-amber-500">
                                <AlertCircle className="w-5 h-5" />
                                <h3 className="font-bold text-slate-900 dark:text-white">Pemberitahuan</h3>
                            </div>
                            <button
                                onClick={() => setShowError(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 cursor-pointer"
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
                                onClick={() => setShowError(false)}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer"
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