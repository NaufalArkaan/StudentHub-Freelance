'use client';

import * as React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Definisi tipe props yang lebih rapi
type ServiceItem = {
  id: string;
  title: string;
  price: number;
  is_active: boolean;
  category?: { name: string } | null;
};

export default function ServicesList({ initialServices }: { initialServices: ServiceItem[] }) {
  const [services, setServices] = React.useState<ServiceItem[]>(initialServices);
  const [loading, setLoading] = React.useState(false);
  const supabase = createClient();
  const router = useRouter();

  // Memastikan UI tetap sinkron dengan data server saat ada refresh
  React.useEffect(() => {
    Promise.resolve().then(() => {
      setServices(initialServices);
    });
  }, [initialServices]);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      // Optimistic update (Ubah UI duluan agar terasa cepat)
      setServices(services.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));

      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      router.refresh(); // Sinkronkan data di background
    } catch (error) {
      console.error('Error toggling status:', error);
      // Revert/Kembalikan status jika ternyata error di server
      setServices(services.map(s => s.id === id ? { ...s, is_active: currentStatus } : s));
      alert('Gagal mengubah status layanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus layanan ini? Tindakan ini tidak dapat dibatalkan.')) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;

      // Update UI dengan membuang layanan yang dihapus
      setServices(services.filter(s => s.id !== id));
      router.refresh();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Gagal menghapus layanan. Pastikan layanan ini tidak sedang dipesan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Action Bar (Add Service) */}
      <div className="flex justify-end">
        <Link href="/freelancer/services/new">
          <button className="bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-400 dark:hover:bg-cyan-500 text-white dark:text-[#0f1219] px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm hover:shadow-md">
            <Plus className="h-4 w-4" /> Add New Service
          </button>
        </Link>
      </div>

      {/* Services List Wrapper */}
      <div className="space-y-4">
        {services.length > 0 ? services.map((service) => (
          <div
            key={service.id}
            className={`
              bg-slate-50 dark:bg-[#111827] 
              border border-slate-200 dark:border-slate-800 
              rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 
              transition-all hover:border-slate-300 dark:hover:border-slate-700
              ${!service.is_active ? 'opacity-70 grayscale-[20%]' : ''}
            `}
          >
            {/* Kiri: Info Layanan */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">{service.title}</h3>
                <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider whitespace-nowrap">
                  {service.category?.name || 'Uncategorized'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>Mulai dari Rp {(service.price / 1000).toLocaleString('id-ID')}k</span>
              </div>
            </div>

            {/* Kanan: Action & Toggle */}
            <div className="flex items-center gap-6 md:gap-8 justify-between md:justify-end border-t border-slate-200 dark:border-slate-800 md:border-0 pt-4 md:pt-0 mt-2 md:mt-0">

              {/* Toggle Switch */}
              <div className="flex items-center gap-3">
                <button
                  disabled={loading}
                  onClick={() => toggleStatus(service.id, service.is_active)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-[#111827]
                    ${service.is_active ? 'bg-cyan-500 dark:bg-cyan-400' : 'bg-slate-300 dark:bg-slate-700'}
                    ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  `}
                >
                  <span className="sr-only">Toggle Active Status</span>
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
                      ${service.is_active ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
                <span className={`text-sm font-semibold w-16 ${service.is_active ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                  {service.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              {/* Action Buttons (Edit & Delete) */}
              <div className="flex items-center gap-2">
                <Link href={`/freelancer/services/edit/${service.id}`}>
                  <button
                    disabled={loading}
                    className="p-2 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit Service"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </Link>
                <button
                  disabled={loading}
                  onClick={() => deleteService(service.id)}
                  className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete Service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )) : (
          /* Empty State */
          <div className="text-center py-20 bg-slate-50 dark:bg-[#111827] border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Belum Ada Layanan</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">Anda belum membuat layanan apa pun. Mulai tawarkan keahlian Anda sekarang!</p>
            <Link href="/freelancer/services/new">
              <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-lg text-sm font-bold transition-transform hover:scale-105">
                Buat Layanan Pertama
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}