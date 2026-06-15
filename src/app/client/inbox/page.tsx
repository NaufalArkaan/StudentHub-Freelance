'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, AlertTriangle, MoreVertical, Plus, Image as ImageIcon, Send, User, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'other';
  text: string;
  time: string;
  isTyping?: boolean;
}

interface ChatThread {
  id: string;
  name: string;
  avatar: string;
  status: 'Online' | 'Offline' | 'Away';
  lastMessage: string;
  time: string;
  unread?: boolean;
  messages: Message[];
}

function InboxContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [inputText, setInputText] = React.useState('');

  // State untuk menu dropdown Titik Tiga
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Reference untuk trigger input file tersembunyi
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  // TODO: Supabase - Ganti mock data ini dengan fetch data dari tabel
  const [threads, setThreads] = React.useState<ChatThread[]>([
    {
      id: 'thread-1',
      name: 'Sarah J.',
      avatar: 'S',
      status: 'Online',
      lastMessage: "I've finished the integration section for Calculus II...",
      time: '12:45 PM',
      messages: [
        { id: 'msg-1-1', sender: 'other', text: 'Halo pak Budi. Untuk materi Calculus sudah siap.', time: '12:40 PM' },
        { id: 'msg-1-2', sender: 'other', text: 'Nanti siang saya kirimkan draft pertamanya via menu Order ya pak.', time: '12:41 PM' },
        { id: 'msg-1-3', sender: 'user', text: 'Baik, saya akan review draft-nya hari ini.', time: '12:43 PM' },
      ],
    },
    {
      id: 'thread-2',
      name: 'Alex R.',
      avatar: 'A',
      status: 'Offline',
      lastMessage: 'The Figma file has been updated with the new...',
      time: 'Yesterday',
      messages: [
        { id: 'msg-2-1', sender: 'user', text: 'Hi Alex, did you modify the onboarding flow?', time: 'Yesterday, 3:00 PM' },
        { id: 'msg-2-2', sender: 'other', text: 'The Figma file has been updated with the new designs. Take a look at page 3.', time: 'Yesterday, 3:15 PM' },
      ],
    },
    {
      id: 'thread-3',
      name: 'Budi W.',
      avatar: 'B',
      status: 'Offline',
      lastMessage: 'The Python script is ready for your lab data.',
      time: 'Monday',
      messages: [
        { id: 'msg-3-1', sender: 'other', text: 'The Python script is ready for your lab data.', time: 'Monday, 10:00 AM' },
        { id: 'msg-3-2', sender: 'user', text: 'Awesome, will test it tonight and let you know!', time: 'Monday, 10:15 AM' },
      ],
    },
  ]);

  // Efek untuk memetakan orderId dari URL ke chat thread yang sesuai
  React.useEffect(() => {
    if (orderId === 'ord-1') setActiveThreadId('thread-3');
    else if (orderId === 'ord-2') setActiveThreadId('thread-2');
    else if (orderId === 'ord-3') setActiveThreadId('thread-1');
    else if (!activeThreadId && threads.length > 0) setActiveThreadId(threads[0].id);
  }, [orderId, threads, activeThreadId]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThread) return;

    const cleanedMessages = activeThread.messages.filter((m) => !m.isTyping);
    const newMsg: Message = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // TODO: Supabase - Tambahkan logika insert ke tabel messages di sini

    setThreads(
      threads.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            lastMessage: inputText,
            time: 'Just now',
            messages: [...cleanedMessages, newMsg],
          };
        }
        return t;
      })
    );
    setInputText('');
  };

  // Fungsi untuk menangani file/gambar yang diupload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Supabase - Logika upload file ke Storage Supabase
      console.log("File siap di-upload:", file.name);
      alert(`File "${file.name}" dipilih! \n(Siap disambungkan ke Supabase Storage)`);
    }
    // Reset input agar file yang sama bisa dipilih lagi jika dihapus
    e.target.value = '';
  };

  const filteredThreads = threads.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!activeThread) return <div className="flex justify-center items-center h-full text-slate-500">Loading messages...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-grow flex rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1626] overflow-hidden shadow-sm">

        {/* Left Sidebar - Thread List */}
        <aside className="w-80 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0e1626]/20">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Messages</h2>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-cyan-500 text-xs"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
            {filteredThreads.map((thread) => {
              const isActive = thread.id === activeThreadId;
              return (
                <button
                  key={thread.id}
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    setIsDropdownOpen(false); // Menutup dropdown jika chat berganti
                  }}
                  className={`w-full flex items-start gap-3 p-4 text-left transition-colors duration-150 relative cursor-pointer ${isActive ? 'bg-slate-100 dark:bg-[#0c1220]/80' : 'hover:bg-slate-50 dark:hover:bg-slate-900/20'
                    }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                      {thread.avatar}
                    </div>
                    <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#0e1626] ${thread.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h3 className="text-xs sm:text-sm font-bold truncate text-slate-900 dark:text-slate-200">{thread.name}</h3>
                      <span className="text-[9px] text-slate-400 whitespace-nowrap flex-shrink-0">{thread.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{thread.lastMessage}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Pane - Chat Window */}
        <section className="flex-grow flex flex-col bg-white dark:bg-[#090d16]">
          {/* Warning Banner */}
          <div className="bg-amber-50 border-b border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 px-4 py-2.5 flex items-center gap-2 text-[10px] sm:text-xs text-amber-700 dark:text-amber-500/90 font-medium">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500 flex-shrink-0" />
            <span>Demi keamanan, dilarang bertransaksi atau membagikan kontak pribadi di luar platform.</span>
          </div>

          {/* Active Chat Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/20 dark:bg-[#0e1626]/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                  {activeThread.avatar}
                </div>
                <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#090d16] ${activeThread.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200">{activeThread.name}</h3>
                <p className="text-[10px] text-slate-400 font-semibold">{activeThread.status}</p>
              </div>
            </div>

            {/* Opsi Titik Tiga (Dropdown) */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                  <button className="w-full text-left px-4 py-3 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <User className="h-4 w-4" />
                    <span>Lihat Profil</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-slate-100 dark:border-slate-700">
                    <Trash2 className="h-4 w-4" />
                    <span>Hapus Obrolan</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Message History View */}
          <div className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-4 flex flex-col justify-end bg-slate-50/20 dark:bg-[#090d16]/30">
            <div className="flex items-center justify-center py-2">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-3 bg-white dark:bg-[#090d16] z-10">
                Today
              </span>
            </div>

            <div className="space-y-4">
              {activeThread.messages.map((message) => {
                const isUser = message.sender === 'user';
                return (
                  <div key={message.id} className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs">
                        {activeThread.avatar}
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm leading-relaxed ${isUser
                          ? 'bg-cyan-400 text-slate-950 font-medium rounded-tr-none'
                          : message.isTyping
                            ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 italic rounded-tl-none tracking-widest'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800/80 dark:text-slate-200 rounded-tl-none'
                        }`}>
                        {message.text}
                      </div>
                      {message.time && (
                        <p className="text-[9px] text-slate-400 px-1 text-right">
                          {message.time}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Message Input Panel */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1626]/40 flex items-center gap-3"
          >
            {/* HIDDEN INPUTS (Di-trigger oleh tombol) */}
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleFileUpload} />

            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Plus className="h-5 w-5" />
            </button>

            {/* Upload Image Button */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ImageIcon className="h-5 w-5" />
            </button>

            {/* TextInput Box */}
            <input
              type="text"
              placeholder="Type your message here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-grow py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:focus:ring-cyan-500 text-xs sm:text-sm"
            />

            {/* Send Button */}
            <button
              type="submit"
              className="p-2.5 rounded-full bg-cyan-400 hover:bg-cyan-500 text-slate-950 shadow transition-colors flex items-center justify-center cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

// Wrapper Suspense (Wajib untuk App Router Next.js saat menggunakan useSearchParams)
export default function ClientInbox() {
  return (
    <React.Suspense fallback={<div className="flex h-[calc(100vh-80px)] items-center justify-center text-slate-500">Loading Inbox...</div>}>
      <InboxContent />
    </React.Suspense>
  );
}