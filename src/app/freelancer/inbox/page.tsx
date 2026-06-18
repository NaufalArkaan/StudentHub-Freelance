import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InboxClient from './InboxClient';

export const dynamic = 'force-dynamic';

type ThreadItem = {
  id: string;
  client: { id: string; full_name: string; avatar_url: string };
  service: { title: string };
};

// 1. UBAH BAGIAN INI: Jadikan searchParams sebagai Promise
export default async function FreelancerInboxPage(props: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  // 2. UBAH BAGIAN INI: Tunggu (await) paket searchParams dibuka
  const searchParams = await props.searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch data dengan join tabel melewati users secara aman (orders -> users -> profiles)
  const { data: threads, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      client_user:users!orders_client_id_fkey(
        profile:profiles(id, full_name, avatar_url)
      ),
      service:services!inner(title, freelancer_id)
    `)
    .eq('service.freelancer_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching backend threads:', error);
  }

  // Petakan struktur data agar cocok dengan ekspektasi properti InboxClient
  const formattedThreads: ThreadItem[] = (threads || []).map((order: any) => ({
    id: order.id,
    client: {
      id: order.client_user?.profile?.id || '',
      full_name: order.client_user?.profile?.full_name || 'Client',
      avatar_url: order.client_user?.profile?.avatar_url || ''
    },
    service: {
      title: order.service?.title || 'Layanan'
    }
  }));

  return (
    <div className="bg-slate-50 dark:bg-[#0f1219]">
      <InboxClient
        user={user}
        threads={formattedThreads}
        initialOrderId={searchParams.orderId}
      />
    </div>
  );
}