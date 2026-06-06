'use client';

import * as React from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Eye, Ban, Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = React.useState('All');
  const [statusFilter, setStatusFilter] = React.useState('All');

  const users = [
    {
      id: '1',
      name: 'Budi Santoso',
      nim: '123456789',
      email: 'budi.s@student.univ.ac.id',
      role: 'freelancer',
      status: 'active',
      avatarColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: '2',
      name: 'Siti Aminah',
      nim: '987654321',
      email: 'siti.a@student.univ.ac.id',
      role: 'client',
      status: 'active',
      avatarColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      id: '3',
      name: 'Reza Pratama',
      nim: '456123789',
      email: 'reza.p@student.univ.ac.id',
      role: 'freelancer',
      status: 'suspended',
      avatarColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      id: '4',
      name: 'Dewi Lestari',
      nim: '321654987',
      email: 'dewi.l@student.univ.ac.id',
      role: 'client',
      status: 'active',
      avatarColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }
  ];

  const handleToggleStatus = (id: string, currentStatus: string) => {
    alert(`Status akun user dengan ID ${id} diubah dari ${currentStatus} (fitur simulasi).`);
  };

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">User Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola akun mahasiswa, pantau peran, dan atur status akses platform.
          </p>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3">
          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-800 rounded-lg px-4 pr-10 py-2 text-xs font-semibold text-slate-350 focus:outline-none focus:border-slate-700 cursor-pointer"
            >
              <option value="All">Filter Role: All</option>
              <option value="freelancer">Role: Freelancer</option>
              <option value="client">Role: Client</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-800 rounded-lg px-4 pr-10 py-2 text-xs font-semibold text-slate-350 focus:outline-none focus:border-slate-700 cursor-pointer"
            >
              <option value="All">Status: All</option>
              <option value="active">Status: Active</option>
              <option value="suspended">Status: Suspended</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <Card className="border-slate-900 bg-[#0c1222]/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-4.5 px-6 font-semibold">USER INFO</th>
                <th className="py-4.5 px-6 font-semibold">EMAIL</th>
                <th className="py-4.5 px-6 font-semibold">ROLE</th>
                <th className="py-4.5 px-6 font-semibold">STATUS</th>
                <th className="py-4.5 px-6 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50">
              {users
                .filter(u => roleFilter === 'All' || u.role === roleFilter)
                .filter(u => statusFilter === 'All' || u.status === statusFilter)
                .map((u) => {
                  const initials = u.name.split(' ').map(n => n[0]).join('').substring(0, 2);
                  return (
                    <tr key={u.id} className="hover:bg-slate-900/10 transition-colors group">
                      {/* User Info Column */}
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3.5">
                          {/* Avatar Circle */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs select-none border ${u.avatarColor}`}>
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-100 group-hover:text-white transition-colors">{u.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">NIM: {u.nim}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email Column */}
                      <td className="py-4.5 px-6 text-slate-350 font-medium">{u.email}</td>

                      {/* Role Column */}
                      <td className="py-4.5 px-6">
                        {u.role === 'freelancer' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                            Freelancer
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wider">
                            Client
                          </span>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="py-4.5 px-6">
                        {u.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-4.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-3.5">
                          {/* View Portfolio Button */}
                          <Link
                            href="/admin/portfolios"
                            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
                            title="Review Portfolio"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </Link>

                          {/* Block/Unblock Toggle */}
                          {u.status === 'active' ? (
                            <button
                              onClick={() => handleToggleStatus(u.id, u.status)}
                              className="p-1.5 rounded-md text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                              title="Suspend User"
                            >
                              <Ban className="h-4.5 w-4.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(u.id, u.status)}
                              className="p-1.5 rounded-md text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                              title="Activate User"
                            >
                              <Check className="h-4.5 w-4.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t border-slate-900 bg-[#090d16]/30 px-6 py-4.5">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-400">1</span> to{' '}
            <span className="font-semibold text-slate-400">4</span> of{' '}
            <span className="font-semibold text-slate-400">24,592</span> Users
          </p>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-md border border-slate-800 text-slate-500 hover:text-slate-350 hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-md border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
