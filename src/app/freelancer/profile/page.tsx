import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';

export default async function FreelancerProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch data profil freelancer
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch daftar portofolio freelancer
  const { data: portfolios } = await supabase
    .from('portfolios')
    .select('*')
    .eq('freelancer_id', user.id)
    .order('created_at', { ascending: false });

  return (
    // max-w-7xl dan space-y-8 agar margin & padding seragam dengan halaman lain
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* --- HEADER HALAMAN --- */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Profile & Portfolio
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-2xl">
          Manage your professional presence. Update your personal details and showcase your best work to attract potential clients.
        </p>
      </div>

      {/* --- KONTEN UTAMA --- */}
      <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <ProfileClient
          user={user}
          initialProfile={profile || {}}
          initialPortfolios={portfolios || []}
        />
      </div>

    </div>
  );
}