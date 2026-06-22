'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import {
  Eye,
  Ban,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserX,
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminUsersPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    }>
      <UsersContent />
    </React.Suspense>
  );
}

function UsersContent() {
  const supabase = createClient();

  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get('q') || '').toLowerCase();

  const [roleFilter, setRoleFilter] = React.useState('All');
  const [statusFilter, setStatusFilter] = React.useState('All');

  interface UserItem {
    id: string;
    name: string;
    nim: string;
    email: string;
    role: string;
    status: string;
    avatar_url?: string;
    avatarColor: string;
  }

  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // State untuk Custom Modals
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  const [confirmModal, setConfirmModal] = React.useState({
    isOpen: false,
    userId: '',
    userName: '',
    currentStatus: '',
    targetStatus: ''
  });

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          role,
          status,
          profiles (
            full_name,
            nim,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedUsers = data.map((u: {
          id: string;
          email: string | null;
          role: string | null;
          status: string | null;
          profiles: {
            full_name: string | null;
            nim: string | null;
            avatar_url: string | null;
          } | {
            full_name: string | null;
            nim: string | null;
            avatar_url: string | null;
          }[] | null;
        }) => {
          const profileData = Array.isArray(u.profiles) ? u.profiles[0] : u.profiles;
          const userRole = (u.role || 'client').toLowerCase();
          const userStatus = (u.status || 'active').toLowerCase();

          let avatarColor = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
          if (userStatus === 'suspended') {
            avatarColor = 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
          } else if (userRole === 'freelancer') {
            avatarColor = 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
          } else if (userRole === 'client') {
            avatarColor = 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
          } else if (userRole === 'admin') {
            avatarColor = 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
          }

          return {
            id: u.id,
            name: profileData?.full_name || 'Tanpa Nama',
            nim: profileData?.nim || '-',
            email: u.email || 'Email tidak ditemukan',
            role: userRole,
            status: userStatus,
            avatar_url: profileData?.avatar_url || undefined,
            avatarColor: avatarColor
          };
        });
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Gagal mengambil data user:', error);
      setErrorMsg("Gagal menarik data pengguna.");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, setErrorMsg]);

  React.useEffect(() => {
    Promise.resolve().then(() => {
      fetchUsers();
    });
  }, [fetchUsers]);

  const openConfirmModal = (id: string, name: string, currentStatus: string) => {
    const targetStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setConfirmModal({ isOpen: true, userId: id, userName: name, currentStatus, targetStatus });
  };

  const executeToggleStatus = async () => {
    setIsSubmitting(true);
    const { userId, userName, currentStatus, targetStatus } = confirmModal;

    try {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: targetStatus } : u));

      const { error } = await supabase
        .from('users')
        .update({ status: targetStatus })
        .eq('id', userId);

      if (error) throw error;

      setConfirmModal({ isOpen: false, userId: '', userName: '', currentStatus: '', targetStatus: '' });
      showSuccess(`Status akun "${userName}" berhasil diubah menjadi ${targetStatus.toUpperCase()}.`);

    } catch (error) {
      const err = error as Error;
      console.error("Gagal update status di database:", err);
      setErrorMsg("Terjadi kesalahan sistem saat menyimpan status: " + err.message);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: currentStatus } : u));
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // LOGIKA FILTER DAN PENCARIAN
  const filteredUsers = users
    .filter(u => roleFilter === 'All' || u.role === roleFilter)
    .filter(u => statusFilter === 'All' || u.status === statusFilter)
    .filter(u => {
      // Jika kotak pencarian kosong, loloskan semua
      if (!searchQuery) return true;

      // Jika ada teks, cek apakah cocok dengan nama, email, atau NIM
      const matchName = u.name?.toLowerCase().includes(searchQuery);
      const matchEmail = u.email?.toLowerCase().includes(searchQuery);
      const matchNim = u.nim?.toLowerCase().includes(searchQuery);

      return matchName || matchEmail || matchNim;
    });

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">User Management</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kelola akun mahasiswa, pantau peran, dan atur status akses platform.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 rounded-lg px-4 pr-10 py-2 text-xs font-semibold dark:text-slate-350 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 dark:focus:ring-0 dark:focus:border-slate-700 cursor-pointer transition-colors"
              >
                <option value="All">Filter Role: All</option>
                <option value="freelancer">Role: Freelancer</option>
                <option value="client">Role: Client</option>
                <option value="admin">Role: Admin</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 rounded-lg px-4 pr-10 py-2 text-xs font-semibold dark:text-slate-350 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 dark:focus:ring-0 dark:focus:border-slate-700 cursor-pointer transition-colors"
              >
                <option value="All">Status: All</option>
                <option value="active">Status: Active</option>
                <option value="suspended">Status: Suspended</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <Card className="border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0c1222]/50 overflow-hidden shadow-sm dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-900 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-900/30">
                  <th className="py-4.5 px-6 font-semibold">USER INFO</th>
                  <th className="py-4.5 px-6 font-semibold">EMAIL</th>
                  <th className="py-4.5 px-6 font-semibold">ROLE</th>
                  <th className="py-4.5 px-6 font-semibold">STATUS</th>
                  <th className="py-4.5 px-6 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-3 text-cyan-500" />
                        <p className="text-sm">Menarik data mahasiswa dari Supabase...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <UserX className="w-10 h-10 mb-3 opacity-50" />
                        <p className="text-sm">
                          {searchQuery ? `Hasil pencarian "${searchQuery}" tidak ditemukan.` : 'Tidak ada pengguna.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const initials = u.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/10 transition-colors group">
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-3.5">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt={u.name} className={`w-10 h-10 rounded-full object-cover border ${u.avatarColor}`} />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs select-none border ${u.avatarColor}`}>
                                {initials}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-white transition-colors">{u.name}</p>
                              <p className="text-[10px] text-slate-500 font-medium mt-0.5">NIM: {u.nim}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4.5 px-6 text-slate-600 dark:text-slate-350 font-medium">{u.email}</td>

                        <td className="py-4.5 px-6">
                          {u.role === 'freelancer' ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 uppercase tracking-wider">
                              Freelancer
                            </span>
                          ) : u.role === 'admin' ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 uppercase tracking-wider">
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 uppercase tracking-wider">
                              Client
                            </span>
                          )}
                        </td>

                        <td className="py-4.5 px-6">
                          {u.status === 'active' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Suspended
                            </span>
                          )}
                        </td>

                        <td className="py-4.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-3.5">
                            {u.role === 'freelancer' && (
                              <Link
                                href={`/admin/portfolios?userId=${u.id}`}
                                className="p-1.5 rounded-md text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:text-white dark:hover:bg-slate-900 transition-all"
                                title="Review Portfolio"
                              >
                                <Eye className="h-4.5 w-4.5" />
                              </Link>
                            )}

                            {u.status === 'active' ? (
                              <button
                                onClick={() => openConfirmModal(u.id, u.name, u.status)}
                                className="p-1.5 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all cursor-pointer"
                                title="Suspend User"
                              >
                                <Ban className="h-4.5 w-4.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => openConfirmModal(u.id, u.name, u.status)}
                                className="p-1.5 rounded-md text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 transition-all cursor-pointer"
                                title="Activate User"
                              >
                                <Check className="h-4.5 w-4.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-[#090d16]/30 px-6 py-4.5 transition-colors">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredUsers.length > 0 ? 1 : 0}</span> to{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredUsers.length}</span> of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{users.length}</span> Users
            </p>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent cursor-not-allowed transition-colors" disabled>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent cursor-not-allowed transition-colors" disabled>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* ========================================== */}
      {/* MODAL KONFIRMASI STATUS (SUSPEND/ACTIVATE) */}
      {/* ========================================== */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              {confirmModal.targetStatus === 'suspended' ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              )}
              <h3 className="font-bold text-slate-900 dark:text-white">
                {confirmModal.targetStatus === 'suspended' ? 'Blokir Pengguna' : 'Aktifkan Pengguna'}
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Apakah Anda yakin ingin {confirmModal.targetStatus === 'suspended' ? 'menskors (memblokir)' : 'mengaktifkan kembali'} akun <span className="font-bold text-slate-900 dark:text-white">&quot;{confirmModal.userName}&quot;</span>?
                {confirmModal.targetStatus === 'suspended' && " Pengguna ini tidak akan bisa menggunakan layanan platform."}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button disabled={isSubmitting} onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer disabled:opacity-50">
                Batal
              </button>
              <button
                disabled={isSubmitting}
                onClick={executeToggleStatus}
                className={`px-6 py-2.5 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${confirmModal.targetStatus === 'suspended'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (confirmModal.targetStatus === 'suspended' ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />)}
                {confirmModal.targetStatus === 'suspended' ? 'Blokir' : 'Aktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
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

      {/* ERROR MODAL */}
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