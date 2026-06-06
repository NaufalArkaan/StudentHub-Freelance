'use client';

import * as React from 'react';
import Card from '@/components/ui/Card';
import { ChevronDown, ChevronLeft, ChevronRight, Terminal, User } from 'lucide-react';

export default function AdminReportsPage() {
  const [urgencyFilter, setUrgencyFilter] = React.useState('All');
  const [statusFilter, setStatusFilter] = React.useState('All');

  const reports = [
    {
      id: '#REP-099',
      date: '24 May 2026',
      entityName: 'Alex Mercer',
      entityType: 'user',
      entityInitials: 'AM',
      entityBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      reportedBy: 'Sarah Jenkins',
      reason: 'Suspected Fraud',
      urgency: 'critical',
      status: 'pending'
    },
    {
      id: '#REP-098',
      date: '23 May 2026',
      entityName: 'Web App Dev',
      entityType: 'service',
      reportedBy: 'Michael Chen',
      reason: 'Inappropriate Content',
      urgency: 'minor',
      status: 'pending'
    },
    {
      id: '#REP-097',
      date: '22 May 2026',
      entityName: 'Elena Rostova',
      entityType: 'user',
      entityInitials: 'ER',
      entityBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      reportedBy: 'David Kim',
      reason: 'Spam/Bot',
      urgency: 'minor',
      status: 'resolved'
    }
  ];

  const handleReview = (id: string) => {
    alert(`Membuka panel peninjauan untuk laporan ${id} (fitur simulasi).`);
  };

  const handleBan = (entityName: string) => {
    alert(`Melakukan pemblokiran terhadap "${entityName}" (fitur simulasi).`);
  };

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reports & Moderation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tinjau keluhan pengguna dan jaga keamanan ekosistem.
          </p>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3">
          {/* Urgency Filter */}
          <div className="relative">
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-800 rounded-lg px-4 pr-10 py-2 text-xs font-semibold text-slate-350 focus:outline-none focus:border-slate-700 cursor-pointer"
            >
              <option value="All">Urgency: All</option>
              <option value="critical">Urgency: Critical</option>
              <option value="minor">Urgency: Minor</option>
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
              <option value="pending">Status: Pending</option>
              <option value="resolved">Status: Resolved</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Reports Table Card */}
      <Card className="border-slate-900 bg-[#0c1222]/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-4.5 px-6 font-semibold">REPORT ID & DATE</th>
                <th className="py-4.5 px-6 font-semibold">REPORTED ENTITY</th>
                <th className="py-4.5 px-6 font-semibold">REPORTED BY</th>
                <th className="py-4.5 px-6 font-semibold">REASON</th>
                <th className="py-4.5 px-6 font-semibold">URGENCY</th>
                <th className="py-4.5 px-6 font-semibold">STATUS</th>
                <th className="py-4.5 px-6 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50">
              {reports
                .filter(r => urgencyFilter === 'All' || r.urgency === urgencyFilter)
                .filter(r => statusFilter === 'All' || r.status === statusFilter)
                .map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/10 transition-colors group">
                    {/* Report ID & Date */}
                    <td className="py-4.5 px-6">
                      <p className="font-bold text-slate-105 group-hover:text-white transition-colors">{r.id}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{r.date}</p>
                    </td>

                    {/* Reported Entity */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-2.5">
                        {r.entityType === 'user' ? (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[9px] select-none border ${r.entityBg}`}>
                            {r.entityInitials}
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded bg-blue-900/10 border border-blue-550/20 text-blue-400 flex items-center justify-center">
                            <Terminal className="h-4 w-4" />
                          </div>
                        )}
                        <span className="font-semibold text-slate-200">{r.entityName}</span>
                      </div>
                    </td>

                    {/* Reported By */}
                    <td className="py-4.5 px-6 font-medium text-slate-350">{r.reportedBy}</td>

                    {/* Reason */}
                    <td className="py-4.5 px-6 text-slate-350 leading-relaxed max-w-xs">{r.reason}</td>

                    {/* Urgency */}
                    <td className="py-4.5 px-6">
                      {r.urgency === 'critical' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-red-500/15 text-red-500 border border-red-500/20 uppercase tracking-wide">
                          Critical
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wide">
                          Minor
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4.5 px-6">
                      {r.status === 'pending' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                          Resolved
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReview(r.id)}
                          className="h-7 px-3.5 rounded border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition-all cursor-pointer select-none"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleBan(r.entityName)}
                          className="h-7 px-3.5 rounded border border-red-500/20 bg-transparent text-[10px] font-bold text-red-400 hover:text-white hover:bg-red-500/25 transition-all cursor-pointer select-none"
                        >
                          Ban User
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
            <span className="font-semibold text-slate-400">124</span> Reports
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
            <button className="p-1.5 rounded-md border border-slate-805 text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
