'use client';

import * as React from 'react';
import Card from '@/components/ui/Card';
import { Eye, FileText, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils/utils';

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [timeFilter, setTimeFilter] = React.useState('Bulan Ini');

  const orders = [
    { 
      id: '#ORD-7782', 
      date: '24 May 2026', 
      service: 'UI/UX Design for Fintech', 
      category: 'DESIGN', 
      freelancer: 'Alex D.', 
      freelancerInitials: 'AD',
      freelancerBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      client: 'Sarah M.', 
      clientInitials: 'SM',
      clientBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      amount: 500000, 
      status: 'disputed' 
    },
    { 
      id: '#ORD-7783', 
      date: '25 May 2026', 
      service: 'Mobile App Development', 
      category: 'TECH', 
      freelancer: 'Ryan J.', 
      freelancerInitials: 'RJ',
      freelancerBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      client: 'Evelyn L.', 
      clientInitials: 'EL',
      clientBg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      amount: 2500000, 
      status: 'in_progress' 
    },
    { 
      id: '#ORD-7784', 
      date: '25 May 2026', 
      service: 'Content Writing - SEO', 
      category: 'CREATIVE', 
      freelancer: 'Kevin M.', 
      freelancerInitials: 'KM',
      freelancerBg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      client: 'Tom B.', 
      clientInitials: 'TB',
      clientBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      amount: 750000, 
      status: 'completed' 
    },
    { 
      id: '#ORD-7785', 
      date: '26 May 2026', 
      service: 'Translation (EN-ID)', 
      category: 'SERVICE', 
      freelancer: 'Liana A.', 
      freelancerInitials: 'LA',
      freelancerBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      client: 'Global Corp.', 
      clientInitials: 'GC',
      clientBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      amount: 300000, 
      status: 'in_progress' 
    }
  ];

  const handleAction = (id: string, actionType: string) => {
    alert(`Aksi "${actionType}" untuk pesanan ${id} (fitur simulasi).`);
  };

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Global Orders</h1>
          <p className="text-xs text-slate-400 mt-1">
            Pantau seluruh transaksi aktif, riwayat pesanan, dan selesaikan sengketa transaksi.
          </p>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3">
          {/* Time Filter */}
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-800 rounded-lg px-4 pr-10 py-2 text-xs font-semibold text-slate-350 focus:outline-none focus:border-slate-700 cursor-pointer"
            >
              <option value="Bulan Ini">Bulan Ini</option>
              <option value="Minggu Ini">Minggu Ini</option>
              <option value="Semua">Semua Waktu</option>
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
              <option value="All">Semua Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="disputed">Disputed</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders Table Card */}
      <Card className="border-slate-900 bg-[#0c1222]/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-4.5 px-6 font-semibold">ORDER ID & DATE</th>
                <th className="py-4.5 px-6 font-semibold">SERVICE & CATEGORY</th>
                <th className="py-4.5 px-6 font-semibold">FREELANCER</th>
                <th className="py-4.5 px-6 font-semibold">CLIENT</th>
                <th className="py-4.5 px-6 font-semibold">AMOUNT</th>
                <th className="py-4.5 px-6 font-semibold">STATUS</th>
                <th className="py-4.5 px-6 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50">
              {orders
                .filter(o => statusFilter === 'All' || o.status === statusFilter)
                .map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/10 transition-colors group">
                    {/* Order ID & Date */}
                    <td className="py-4.5 px-6">
                      <p className="font-bold text-slate-100 group-hover:text-white transition-colors">{o.id}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{o.date}</p>
                    </td>

                    {/* Service & Category */}
                    <td className="py-4.5 px-6">
                      <p className="font-bold text-slate-200 group-hover:text-white transition-colors max-w-xs truncate">{o.service}</p>
                      <span className="inline-block text-[8px] font-bold text-blue-400 bg-blue-900/10 border border-blue-500/20 px-1.5 py-0.5 rounded mt-1">
                        {o.category}
                      </span>
                    </td>

                    {/* Freelancer */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] select-none border ${o.freelancerBg}`}>
                          {o.freelancerInitials}
                        </div>
                        <span className="font-semibold text-slate-300">{o.freelancer}</span>
                      </div>
                    </td>

                    {/* Client */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] select-none border ${o.clientBg}`}>
                          {o.clientInitials}
                        </div>
                        <span className="font-semibold text-slate-300">{o.client}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4.5 px-6 font-bold text-cyan-400 text-sm">
                      {formatPrice(o.amount)}
                    </td>

                    {/* Status */}
                    <td className="py-4.5 px-6">
                      {o.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Completed
                        </span>
                      )}
                      {o.status === 'in_progress' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          In Progress
                        </span>
                      )}
                      {o.status === 'disputed' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Disputed
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleAction(o.id, 'View Detail')}
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-950 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAction(o.id, 'Manage Escrow')}
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-950 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                          title="Manage Escrow / Dispute"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t border-slate-900 bg-[#090d16]/30 px-6 py-4.5">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-400">1-10</span> of{' '}
            <span className="font-semibold text-slate-400">89,104</span> Orders
          </p>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-md border border-slate-800 text-slate-500 hover:text-slate-350 hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="w-8 h-8 rounded-md bg-[#00d8ff] text-slate-950 text-xs font-bold flex items-center justify-center shadow-[0_1px_6px_rgba(0,216,255,0.4)]">
              1
            </button>
            <button className="w-8 h-8 rounded-md border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-bold hover:bg-slate-900 cursor-pointer">
              2
            </button>
            <button className="w-8 h-8 rounded-md border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-bold hover:bg-slate-900 cursor-pointer">
              3
            </button>
            <span className="text-slate-600 px-1 font-bold text-xs select-none">...</span>
            <button className="w-12 h-8 rounded-md border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-bold hover:bg-slate-900 cursor-pointer">
              8910
            </button>
            <button className="p-1.5 rounded-md border border-slate-805 text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
