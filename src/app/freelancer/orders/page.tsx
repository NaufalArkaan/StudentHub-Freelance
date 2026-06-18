import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OrdersClient from './OrdersClient';

export const dynamic = 'force-dynamic';

export default async function FreelancerOrdersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch pesanan dengan jalur relasi yang benar (orders -> users -> profiles)
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      price,
      created_at,
      service:services!inner(title, price, freelancer_id),
      client_user:users!orders_client_id_fkey(
        profile:profiles(full_name, avatar_url)
      )
    `)
    .eq('service.freelancer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching freelancer orders:', error);
  }

  const formattedOrders = orders?.map((order: any) => ({
    id: order.id,
    status: order.status,
    price: order.price,
    created_at: order.created_at,
    service: order.service,
    client: {
      full_name: order.client_user?.profile?.full_name || 'Client',
      avatar_url: order.client_user?.profile?.avatar_url || ''
    }
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* --- HEADER HALAMAN --- */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Orders Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Pantau permintaan pesanan masuk, perbarui status pengerjaan, dan lihat riwayat transaksi Anda.
        </p>
      </div>

      {/* --- KONTEN UTAMA --- */}
      <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        {/* Kirim data yang sudah di-format ke komponen Client */}
        <OrdersClient initialOrders={formattedOrders} />
      </div>

    </div>
  );
}