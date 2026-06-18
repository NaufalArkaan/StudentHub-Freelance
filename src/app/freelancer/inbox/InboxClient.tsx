/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import * as React from 'react';
import { Search, AlertTriangle, Plus, Image as ImageIcon, Send, AlertCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type ThreadItem = {
  id: string;
  client: { id: string; full_name: string; avatar_url: string };
  service: { title: string };
  last_message?: string;
  last_time?: string;
  unread?: boolean;
};

type MessageItem = {
  id: string;
  order_id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
};

// ==========================================
// KONTEN BALON CHAT (DESAIN SAMA DENGAN CLIENT)
// ==========================================
function ChatBubble({
  message,
  isUser,
  clientName,
  avatarUrl
}: {
  message: MessageItem;
  isUser: boolean;
  clientName: string;
  avatarUrl: string;
}) {
  const text = message.text;
  const isAttachment = text.includes('📎 Mengirim lampiran:') && text.includes('🔗 Link:');

  return (
    <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={clientName} className="w-full h-full object-cover" />
          ) : (
            clientName.charAt(0).toUpperCase()
          )}
        </div>
      )}
      <div className="space-y-1">
        <div className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm leading-relaxed whitespace-pre-wrap break-words ${isUser
          ? 'bg-cyan-400 text-slate-950 font-medium rounded-tr-none'
          : 'bg-slate-100 text-slate-800 dark:bg-slate-800/80 dark:text-slate-200 rounded-tl-none'
          }`}>
          {isAttachment ? (
            (() => {
              const lines = text.split('\n');
              const fileNameLine = lines[0];
              const fileUrl = lines.find(l => l.includes('🔗 Link:'))?.replace('🔗 Link:', '').trim() || '';
              const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png|webp)(?:\?.*)?$/i);

              return (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] opacity-75">{fileNameLine}</span>
                  {isImage ? (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block relative group mt-1">
                      <img
                        src={fileUrl}
                        alt="Attachment Preview"
                        className="max-w-[200px] sm:max-w-[250px] max-h-48 object-cover rounded-lg border border-black/10 dark:border-white/10 group-hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ) : (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={`underline font-bold break-all hover:opacity-80 ${isUser ? 'text-slate-900' : 'text-blue-600 dark:text-blue-400'}`}>
                      ⬇️ Unduh Berkas Lampiran
                    </a>
                  )}
                </div>
              );
            })()
          ) : (
            <>{text}</>
          )}
        </div>
        {message.created_at && (
          <p className="text-[9px] text-slate-400 px-1 text-right">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// KOMPONEN UTAMA (FREELANCER INBOX)
// ==========================================
export default function InboxClient({
  user,
  threads: initialThreads,
  initialOrderId
}: {
  user: { id: string },
  threads: ThreadItem[],
  initialOrderId?: string
}) {
  const [threads, setThreads] = React.useState<ThreadItem[]>(initialThreads);
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(initialOrderId || (initialThreads.length > 0 ? initialThreads[0].id : null));
  const [messages, setMessages] = React.useState<MessageItem[]>([]);
  const [inputText, setInputText] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loadingMsg, setLoadingMsg] = React.useState(false);

  // State untuk Custom Error Modal
  const [errorMsg, setErrorMsg] = React.useState('');

  const supabase = createClient();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setThreads(initialThreads);
  }, [initialThreads]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = React.useCallback(async (orderId: string) => {
    setLoadingMsg(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (!error) {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMsg(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    if (activeThreadId) {
      fetchMessages(activeThreadId);
    }
  }, [activeThreadId, fetchMessages]);

  React.useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`global-inbox-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          const newMsg = payload.new as MessageItem;

          if (newMsg.order_id === activeThreadId) {
            setMessages((prev) => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }

          setThreads((prevThreads) =>
            prevThreads.map((t) => {
              if (t.id === newMsg.order_id) {
                return {
                  ...t,
                  last_message: newMsg.text,
                  unread: newMsg.order_id !== activeThreadId
                };
              }
              return t;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeThreadId, user.id, supabase]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThreadId) return;

    const activeThread = threads.find(t => t.id === activeThreadId);
    if (!activeThread) return;

    const msgText = inputText.trim();
    const tempId = `temp-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newMsg: MessageItem = {
      id: tempId,
      order_id: activeThreadId,
      sender_id: user.id,
      receiver_id: activeThread.client.id,
      text: msgText,
      created_at: timestamp
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, last_message: msgText } : t));

    try {
      const { error } = await supabase.from('messages').insert([{
        order_id: activeThreadId,
        sender_id: user.id,
        receiver_id: activeThread.client.id,
        text: msgText
      }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setErrorMsg('Gagal mengirim pesan. Silakan periksa koneksi internet Anda dan coba lagi.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeThreadId) return;

    const activeThread = threads.find(t => t.id === activeThreadId);
    if (!activeThread) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${activeThreadId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(filePath);

      const fileTextContent = `📎 Mengirim lampiran: ${file.name} \n🔗 Link: ${publicUrl}`;

      await supabase.from('messages').insert({
        order_id: activeThreadId,
        sender_id: user.id,
        receiver_id: activeThread.client.id,
        text: fileTextContent
      });

      setMessages(prev => [...prev, {
        id: `file-${Date.now()}`,
        order_id: activeThreadId,
        sender_id: user.id,
        receiver_id: activeThread.client.id,
        text: fileTextContent,
        created_at: new Date().toISOString()
      }]);

      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, last_message: `📎 Lampiran berkas` } : t));

    } catch (error) {
      console.error("Gagal mengunggah file:", error);
      setErrorMsg("Gagal mengirim lampiran berkas. Pastikan ukuran file tidak terlalu besar.");
    } finally {
      e.target.value = '';
    }
  };

  const filteredThreads = threads.filter((t) =>
    t.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeThread = threads.find((t) => t.id === activeThreadId);

  const getMockTime = (index: number) => {
    if (index === 0) return '12:45 PM';
    if (index === 1) return 'Yesterday';
    return 'Monday';
  };

  return (
    <>
      {/* KOTAK MELAYANG DI TENGAH (SAMA PERSIS SEPERTI CLIENT) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)] flex flex-col w-full">
        <div className="flex-grow flex rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1626] overflow-hidden shadow-sm">

          {/* --- PANEL KIRI: DAFTAR PENGGUNA --- */}
          <aside className="w-80 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0e1626]/20">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Messages</h2>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Cari obrolan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-cyan-500 text-xs"
                />
              </div>
            </div>

            <div className="flex-grow overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredThreads.map((thread, idx) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread: false } : t));
                    }}
                    className={`w-full flex items-start gap-3 p-4 text-left transition-colors duration-150 relative cursor-pointer ${isActive ? 'bg-slate-100 dark:bg-[#0c1220]/80' : 'hover:bg-slate-50 dark:hover:bg-slate-900/20'}`}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />}
                    <div className="relative flex-shrink-0">
                      <img
                        src={thread.client?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.client?.id}`}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#0e1626] bg-emerald-500" />
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h3 className="text-xs sm:text-sm font-bold truncate text-slate-900 dark:text-slate-200">
                          {thread.client?.full_name || 'Klien'}
                        </h3>
                        <span className="text-[9px] text-slate-400 whitespace-nowrap flex-shrink-0">{getMockTime(idx)}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate flex-1 ${thread.unread ? 'text-cyan-500 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-400 font-medium'}`}>
                          {thread.last_message || thread.service?.title}
                        </p>
                        {thread.unread && (
                          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* --- PANEL KANAN: AREA CHAT --- */}
          <section className="flex-1 min-w-0 min-h-0 flex flex-col bg-white dark:bg-[#090d16]">
            {activeThread ? (
              <>
                <div className="flex-shrink-0 bg-amber-50 border-b border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 px-4 py-2.5 flex items-center gap-2 text-[10px] sm:text-xs text-amber-700 dark:text-amber-500/90 font-medium">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-500 flex-shrink-0" />
                  <span>Demi keamanan, dilarang bertransaksi atau membagikan kontak pribadi di luar platform.</span>
                </div>

                <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/20 dark:bg-[#0e1626]/20">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={activeThread.client?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeThread.client?.id}`}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#090d16] bg-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200">{activeThread.client?.full_name || 'Klien'}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">Online</p>
                    </div>
                  </div>
                </div>

                {/* Jendela Riwayat Obrolan */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/20 dark:bg-[#090d16]/30">
                  <div className="flex items-center justify-center py-2 mb-4">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-3 bg-white dark:bg-[#090d16] rounded-full z-10">
                      Koneksi Terhubung
                    </span>
                  </div>

                  <div className="space-y-4 flex flex-col">
                    {loadingMsg && messages.length === 0 ? (
                      <div className="flex-grow flex items-center justify-center text-slate-400 text-sm">Memuat pesan...</div>
                    ) : messages.length === 0 ? (
                      <div className="flex-grow flex flex-col items-center justify-center text-slate-500 text-sm">
                        <p className="font-medium text-slate-700 dark:text-slate-300">Mulai percakapan dengan {activeThread.client?.full_name}</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isUser = message.sender_id === user.id;
                        return (
                          <ChatBubble
                            key={message.id}
                            message={message}
                            isUser={isUser}
                            clientName={activeThread.client?.full_name || 'Klien'}
                            avatarUrl={activeThread.client?.avatar_url || ''}
                          />
                        );
                      })
                    )}
                    <div ref={messagesEndRef} className="h-1 flex-shrink-0" />
                  </div>
                </div>

                {/* Panel Input Form Pengiriman Pesan */}
                <form
                  onSubmit={handleSendMessage}
                  className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1626]/40 flex items-center gap-3"
                >
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                  <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleFileUpload} />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer hidden sm:block"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </button>

                  <input
                    type="text"
                    placeholder="Ketik pesan Anda di sini..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 min-w-0 py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:focus:ring-cyan-500 text-xs sm:text-sm"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className={`p-2.5 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${inputText.trim() ? 'bg-cyan-400 hover:bg-cyan-500 text-slate-950 shadow cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                Silakan pilih salah satu pesanan aktif untuk membuka obrolan.
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ========================================== */}
      {/* CUSTOM ERROR MODAL */}
      {/* ========================================== */}
      {errorMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-white">Pesan Gagal Terkirim</h3>
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