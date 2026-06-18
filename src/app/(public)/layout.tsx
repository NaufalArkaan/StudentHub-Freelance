import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userProfile = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Query profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Query user role
      const { data: dbUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      userProfile = {
        id: user.id,
        full_name: profile?.full_name || user.user_metadata?.full_name || 'User',
        avatar_url: profile?.avatar_url || null,
        role: dbUser?.role || user.user_metadata?.role || 'client',
        updated_at: profile?.updated_at || new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('Error loading user profile in layout:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-50 font-sans selection:bg-cyan-500/30 selection:text-white">
      <Navbar userProfile={userProfile} />
      <main className="flex-grow w-full flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}