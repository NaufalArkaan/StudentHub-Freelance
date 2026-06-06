'use client';

import * as React from 'react';
import Card, { CardTitle } from '@/components/ui/Card';
import { 
  Eye, 
  CheckCircle, 
  CheckCircle2,
  AlertTriangle, 
  Clock, 
  ExternalLink,
  Laptop,
  Smartphone,
  Home,
  MessageSquare
} from 'lucide-react';

export default function AdminPortfoliosPage() {
  const [feedback, setFeedback] = React.useState('');

  const handleApprove = () => {
    alert('Portofolio telah disetujui!');
  };

  const handleReject = () => {
    alert(`Portofolio ditolak dengan feedback: "${feedback || 'Tidak ada catatan'}"`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Portfolio Moderation</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review and verify freelancer portfolio submissions to maintain platform quality.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (Main Review Content) - Width 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Freelancer Profile Overview Card */}
          <Card className="border-slate-900 bg-[#0c1222]/50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar Picture */}
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700">
                {/* Visual Representation of Avatar */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600 to-indigo-700 flex items-center justify-center font-bold text-white text-base">
                  BS
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-white leading-none">Budi Santoso</h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                    Pending Review
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-semibold text-slate-450 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    UI/UX Design
                  </span>
                  <span className="text-[10px] font-semibold text-slate-450 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Product Design
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 font-semibold mt-2">
                  Joined June 12, 2024 • 14 Projects Uploaded
                </p>
              </div>
            </div>

            <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-slate-950/60 border border-slate-900 rounded-lg px-3.5 py-2 hover:border-slate-850 cursor-pointer">
              <Eye className="h-3.5 w-3.5" />
              View Profile
            </button>
          </Card>

          {/* Project Deliverables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Project 1 */}
            <div className="bg-[#0c1222]/50 border border-slate-900 rounded-xl overflow-hidden group hover:border-slate-800 transition-all flex flex-col h-full">
              {/* Graphic Mockup Area */}
              <div className="h-32 bg-[#080d16] flex items-center justify-center border-b border-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-indigo-900/20" />
                <Laptop className="h-10 w-10 text-blue-500/40 relative z-10 group-hover:scale-105 transition-transform" />
                <div className="absolute bottom-2 left-2 text-[8px] bg-slate-950/80 text-slate-400 font-mono px-1 rounded">
                  Mockup Dashboard
                </div>
              </div>
              <div className="p-3.5 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="text-xs font-bold text-slate-100 group-hover:text-white transition-colors">Fintech Dashboard</h3>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Figma</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase">•</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase">After Effects</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className="bg-[#0c1222]/50 border border-slate-900 rounded-xl overflow-hidden group hover:border-slate-800 transition-all flex flex-col h-full">
              {/* Graphic Mockup Area */}
              <div className="h-32 bg-[#080d16] flex items-center justify-center border-b border-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-purple-900/20" />
                <Smartphone className="h-10 w-10 text-indigo-550/40 relative z-10 group-hover:scale-105 transition-transform" />
                <div className="absolute bottom-2 left-2 text-[8px] bg-slate-950/80 text-slate-400 font-mono px-1 rounded">
                  Mockup Mobile
                </div>
              </div>
              <div className="p-3.5 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="text-xs font-bold text-slate-100 group-hover:text-white transition-colors">E-commerce App</h3>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Sketch</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase">•</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Invision</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 3 */}
            <div className="bg-[#0c1222]/50 border border-slate-900 rounded-xl overflow-hidden group hover:border-slate-800 transition-all flex flex-col h-full">
              {/* Graphic Mockup Area */}
              <div className="h-32 bg-[#080d16] flex items-center justify-center border-b border-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/10 to-cyan-900/20" />
                <Home className="h-10 w-10 text-teal-500/40 relative z-10 group-hover:scale-105 transition-transform" />
                <div className="absolute bottom-2 left-2 text-[8px] bg-slate-950/80 text-slate-400 font-mono px-1 rounded">
                  Mockup SmartHome
                </div>
              </div>
              <div className="p-3.5 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="text-xs font-bold text-slate-100 group-hover:text-white transition-colors">Smart Home Hub</h3>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Figma</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase">•</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Principle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Details Card */}
          <Card className="border-slate-900 bg-[#0c1222]/50 p-6 space-y-6">
            <h3 className="text-sm font-bold text-white border-b border-slate-900 pb-3">Submission Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div>
                <p className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Original Submission Date</p>
                <p className="text-slate-200 font-medium mt-1.5">May 24, 2024 at 14:30 PM</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Last Revision</p>
                <p className="text-slate-200 font-medium mt-1.5">June 02, 2024 at 09:15 AM</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Verification Level</p>
                <p className="text-slate-200 font-medium mt-1.5">Standard Creative Portfolio</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-900/60">
              <p className="text-slate-550 font-semibold uppercase tracking-wider text-[9px]">Freelancer Bio Snippet</p>
              <p className="text-xs text-slate-450 leading-relaxed mt-2.5 italic">
                &quot;Passionate UI/UX designer with 4+ years of experience focusing on fintech and web3 ecosystems. I specialize in building systematic design languages that scale for enterprise-level applications...&quot;
              </p>
            </div>
          </Card>

        </div>

        {/* Right Column (Moderator Controls & Checks) - Width 1/3 */}
        <div className="space-y-6">
          
          {/* Moderator Panel Card */}
          <Card className="border-slate-900 bg-[#0c1222]/50 p-6 space-y-5">
            <h3 className="text-sm font-bold text-white">Moderator Panel</h3>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Admin Notes / Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide constructive feedback for the freelancer regarding their portfolio items..."
                className="w-full h-24 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 placeholder-slate-650 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 transition-all resize-none"
              />
              <p className="text-[9px] text-slate-500 leading-normal">
                Feedback will be visible to the freelancer if rejected or revision requested.
              </p>
            </div>

            <div className="space-y-2.5 pt-1.5">
              <button
                onClick={handleApprove}
                className="w-full h-9.5 rounded-lg bg-[#00d8ff] text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-cyan-400 active:scale-[0.99] transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Portfolio
              </button>

              <button
                onClick={handleReject}
                className="w-full h-9.5 rounded-lg border border-red-500/20 bg-transparent text-red-400 text-xs font-bold hover:bg-red-500/10 active:scale-[0.99] transition-all cursor-pointer"
              >
                Reject / Request Revision
              </button>
            </div>
          </Card>

          {/* Review Timeline Card */}
          <Card className="border-slate-900 bg-[#0c1222]/50 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              Review Timeline
            </h3>

            <div className="relative border-l border-slate-900 ml-2.5 pl-5 space-y-5 py-1 text-xs">
              {/* Item 1 */}
              <div className="relative">
                <span className="absolute -left-[24.5px] top-0.5 flex h-2 w-2 items-center justify-center rounded-full bg-[#00d8ff] ring-4 ring-[#0c1222]" />
                <p className="font-semibold text-slate-200">Under Review by Sarah Jenkins</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Started 2 hours ago</p>
              </div>

              {/* Item 2 */}
              <div className="relative">
                <span className="absolute -left-[24.5px] top-0.5 flex h-2 w-2 items-center justify-center rounded-full bg-slate-600 ring-4 ring-[#0c1222]" />
                <p className="font-semibold text-slate-400">System Auto-Validation</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Completed June 02, 2024</p>
              </div>
            </div>
          </Card>

          {/* Quality Standards Card */}
          <Card className="border-slate-900 bg-[#0c1222]/50 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-slate-550" />
              Quality Standards
            </h3>
            
            <ul className="space-y-3 text-xs font-medium text-slate-350">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Projects must have clear titles.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Thumbnails must be high-resolution.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Tool badges must be relevant.
              </li>
            </ul>
          </Card>

        </div>

      </div>
    </div>
  );
}
