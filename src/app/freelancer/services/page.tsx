import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ServicesList from './ServicesList';

export const dynamic = 'force-dynamic';

export default async function MyServicesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch Services dengan relasi nama kategori
  const { data: services } = await supabase
    .from('services')
    .select('*, category:categories(name)')
    .eq('freelancer_id', user.id)
    .order('created_at', { ascending: false });

  return (
    // Menggunakan max-w-7xl dan space-y-8 agar konsisten dengan Dashboard
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Header Halaman yang dipoles */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          My Services
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Manage your service listings, pricing, and availability.
        </p>
      </div>

      {/* Konten Utama (Komponen List) */}
      <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <ServicesList initialServices={services || []} />
      </div>

    </div>
  );
}