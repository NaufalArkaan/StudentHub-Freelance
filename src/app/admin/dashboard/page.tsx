'use client';

import * as React from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { 
  Users, 
  Sparkles, 
  ShoppingCart, 
  CreditCard,
  ChevronRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { 
      label: 'TOTAL USERS', 
      value: '14,208', 
      trend: '~ +12%', 
      trendType: 'up',
      icon: <Users className="h-4.5 w-4.5 text-slate-400" /> 
    },
    { 
      label: 'ACTIVE SERVICES', 
      value: '3,842', 
      trend: '~ +5%', 
      trendType: 'up',
      icon: <Sparkles className="h-4.5 w-4.5 text-slate-400" /> 
    },
    { 
      label: 'TOTAL ORDERS', 
      value: '89,104', 
      trend: '→ 0%', 
      trendType: 'neutral',
      icon: <ShoppingCart className="h-4.5 w-4.5 text-slate-400" /> 
    },
    { 
      label: 'REVENUE', 
      value: 'Rp 2.4M', 
      trend: '~ +18%', 
      trendType: 'up',
      icon: <CreditCard className="h-4.5 w-4.5 text-slate-400" /> 
    }
  ];

  const recentOrders = [
    { id: '#ORD-9012', service: 'Advanced UI Mentorship', status: 'active' },
    { id: '#ORD-9011', service: 'React App Debugging', status: 'pending' },
    { id: '#ORD-9010', service: 'Logo Design Pitch', status: 'completed' },
    { id: '#ORD-9009', service: 'Data Analysis Script', status: 'active' }
  ];

  const recentReports = [
    { name: 'John S.', initials: 'JS', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', reason: 'Inappropriate Content', action: 'review' },
    { name: 'Anna K.', initials: 'AK', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', reason: 'Spam / Bot Behavior', action: 'review' },
    { name: 'Marcus R.', initials: 'MR', bg: 'bg-red-500/10 text-red-400 border-red-500/20', reason: 'Harassment', action: 'escalate' },
    { name: 'Lin T.', initials: 'LT', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', reason: 'Fake Profile', action: 'review' }
  ];

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Overview</h1>
        <p className="text-xs text-slate-400 mt-1">
          High-level telemetry and platform activity for the StudentHub ecosystem.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <Card key={i} className="border-slate-900 bg-[#0c1222]/40 p-5 flex flex-col justify-between group hover:border-slate-800 transition-all">
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                {stat.label}
              </span>
              {stat.icon}
            </div>
            
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">{stat.value}</span>
              <span className={`text-[10px] font-bold ${
                stat.trendType === 'up' 
                  ? 'text-cyan-400' 
                  : 'text-slate-500'
              }`}>
                {stat.trend}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Orders Card */}
        <Card className="border-slate-900 bg-[#0c1222]/40 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-900/60">
            <h3 className="text-sm font-bold text-white">Recent Orders</h3>
            <Link 
              href="/admin/orders" 
              className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-0.5 transition-colors"
            >
              View All
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex-grow overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-550 border-b border-slate-900/60 font-bold uppercase tracking-wider">
                  <th className="py-3 px-5 font-semibold">ORDER ID</th>
                  <th className="py-3 px-5 font-semibold">SERVICE (JASA)</th>
                  <th className="py-3 px-5 font-semibold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/10 transition-colors group">
                    <td className="py-3.5 px-5 font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                      {o.id}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {o.service}
                    </td>
                    <td className="py-3.5 px-5">
                      {o.status === 'active' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      )}
                      {o.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-550" />
                          Pending
                        </span>
                      )}
                      {o.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-450 border border-slate-700">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Reports Card */}
        <Card className="border-slate-900 bg-[#0c1222]/40 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-900/60">
            <h3 className="text-sm font-bold text-white">Recent Reports</h3>
            <Link 
              href="/admin/reports" 
              className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-0.5 transition-colors"
            >
              Review All
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex-grow overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-550 border-b border-slate-900/60 font-bold uppercase tracking-wider">
                  <th className="py-3 px-5 font-semibold">USER</th>
                  <th className="py-3 px-5 font-semibold">REASON</th>
                  <th className="py-3 px-5 font-semibold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40">
                {recentReports.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/10 transition-colors group">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[9px] border ${r.bg}`}>
                          {r.initials}
                        </div>
                        <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {r.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-350 font-medium">
                      {r.reason}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {r.action === 'review' ? (
                        <button className="h-7 px-3.5 rounded border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer select-none">
                          Review
                        </button>
                      ) : (
                        <button className="h-7 px-3.5 rounded border border-red-500/20 bg-transparent text-[10px] font-bold text-red-400 hover:text-white hover:bg-red-500/15 transition-colors cursor-pointer select-none">
                          Escalate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
}
