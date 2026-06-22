'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, AlertTriangle, Plus, Image as ImageIcon, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  order_id: string; // PERBAIKAN: Menambahkan order_id agar tidak error
  sender: 'user' | 'other';
  text: string;
  time: string;
}

interface ChatThread {
  id: string;
  receiverId: string;
  name: string;
  avatar: string;
  status: 'Online' | 'Offline' | 'Away';
  lastMessage: string;
  time: string;
  unread?: boolean; // PERBAIKAN: Penanda notifikasi pesan baru
}

// ==========================================
// KONTEN BALON CHAT (DIPISAH AGAR TIDAK ERROR SYNTAX)
// ==========================================
function ChatBubble({
  message,
  isUser,
  threadName,
  avatarUrl
}: {
  message: Message;
  isUser: boolean;
  threadName: string;
  avatarUrl: string;
}) {
  const text = message.text;
  const isAttachment = text.includes('📎 Mengirim lampiran:') && text.includes('🔗 Link:');

  return (
    <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={threadName} className="w-full h-full object-cover" />
          ) : (
            threadName.charAt(0).toUpperCase()
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
        {message.time && (
          <p className="text-[9px] text-slate-400 px-1 text-right">
            {message.time}
          </p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
function InboxContent() {
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get('orderId');
  const supabase = createClient();

  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null);

  const [threads, setThreads] = React.useState<ChatThread[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [inputText, setInputText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Ambil Data User Aktif & Daftar Obrolan
  React.useEffect(() => {
    const loadInboxData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, client_id, service:services!inner(title, freelancer_id)');

      if (!ordersError && orders) {
        const counterpartyIds = orders.map((o: any) =>
          o.client_id === user.id ? o.service?.freelancer_id : o.client_id
        ).filter(Boolean);

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', counterpartyIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]));

        const formattedThreads = orders.map((order: any) => {
          const isClient = order.client_id === user.id;
          const receiverId = isClient ? order.service?.freelancer_id : order.client_id;
          const profile = profileMap.get(receiverId);

          return {
            id: order.id,
            receiverId: receiverId,
            name: profile?.full_name || (isClient ? 'Freelancer' : 'Client'),
            avatar: profile?.avatar_url || '',
            status: 'Online',
            lastMessage: `Layanan: ${order.service?.title}`,
            time: new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            unread: false
          } as ChatThread;
        });

        setThreads(formattedThreads);

        if (orderIdFromUrl && formattedThreads.find(t => t.id === orderIdFromUrl)) {
          setActiveThreadId(orderIdFromUrl);
        } else if (formattedThreads.length > 0) {
          setActiveThreadId(formattedThreads[0].id);
        }
      }
      setIsLoading(false);
    };

    loadInboxData();
  }, [orderIdFromUrl, supabase]);

  // 2. Fetch Messages awal saat pindah room
  const fetchChatMessages = React.useCallback(async (threadId: string) => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('order_id', threadId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data.map(msg => ({
        id: msg.id,
        order_id: msg.order_id,
        sender: msg.sender_id === currentUser.id ? 'user' : 'other',
        text: msg.text || '',
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })));
    }
  }, [currentUser, supabase]);

  React.useEffect(() => {
    if (activeThreadId) {
      Promise.resolve().then(() => {
        fetchChatMessages(activeThreadId);
      });
    }
  }, [activeThreadId, fetchChatMessages]);

  // 3. GLOBAL REALTIME SUBSCRIPTION (Mendeteksi Notifikasi)
  React.useEffect(() => {
    if (!currentUser) return;

    const chatChannel = supabase
      .channel(`global-inbox-client-${currentUser.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUser.id}` // Dengarkan semua pesan yang dikirim kepadamu
      }, (payload) => {
        const incomingMsg = payload.new;

        // 1. Update UI pesan JIKA room aktif
        if (incomingMsg.order_id === activeThreadId) {
          setMessages(prev => {
            if (prev.some(m => m.id === incomingMsg.id)) return prev;
            return [...prev, {
              id: incomingMsg.id,
              order_id: incomingMsg.order_id,
              sender: 'other',
              text: incomingMsg.text || '',
              time: new Date(incomingMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }];
          });
        }

        // 2. Update Teks Sidebar & Tandai Unread Notifikasi
        setThreads(prevThreads => prevThreads.map(t => {
          if (t.id === incomingMsg.order_id) {
            return {
              ...t,
              lastMessage: incomingMsg.text || 'Pesan baru',
              unread: incomingMsg.order_id !== activeThreadId // true jika tidak dibuka
            };
          }
          return t;
        }));

      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [activeThreadId, currentUser, supabase]);

  // 4. Mengirim Pesan Teks
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThreadId || !currentUser) return;

    const currentThread = threads.find(t => t.id === activeThreadId);
    if (!currentThread) return;

    const messageText = inputText;
    setInputText('');

    const temporaryId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: temporaryId,
      order_id: activeThreadId,
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, lastMessage: messageText } : t));

    const { error } = await supabase
      .from('messages')
      .insert({
        order_id: activeThreadId,
        sender_id: currentUser.id,
        receiver_id: currentThread.receiverId,
        text: messageText
      });

    if (error) console.error("Gagal menyimpan pesan ke database:", error);
  };

  // 5. Mengunggah File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetedFile = e.target.files?.[0];
    if (!targetedFile || !activeThreadId || !currentUser) return;

    const currentThread = threads.find(t => t.id === activeThreadId);
    if (!currentThread) return;

    try {
      const fileExtension = targetedFile.name.split('.').pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const destinationPath = `${activeThreadId}/${uniqueFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat_attachments')
        .upload(destinationPath, targetedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(destinationPath);

      const fileMessageContent = `📎 Mengirim lampiran: ${targetedFile.name} \n🔗 Link: ${publicUrl}`;

      await supabase.from('messages').insert({
        order_id: activeThreadId,
        sender_id: currentUser.id,
        receiver_id: currentThread.receiverId,
        text: fileMessageContent
      });

      setMessages(prev => [...prev, {
        id: `file-${Date.now()}`,
        order_id: activeThreadId,
        sender: 'user',
        text: fileMessageContent,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, lastMessage: `📎 Lampiran` } : t));

    } catch (error) {
      console.error("Proses upload gagal:", error);
      alert("Gagal mengupload lampiran file.");
    } finally {
      e.target.value = '';
    }
  };

  const filteredThreads = threads.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeThread = threads.find((t) => t.id === activeThreadId);

  if (isLoading) return <div className="flex justify-center items-center h-full text-slate-500">Memuat Obrolan...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)] flex flex-col">
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
            {filteredThreads.map((thread) => {
              const isActive = thread.id === activeThreadId;
              return (
                <button
                  key={thread.id}
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    // Reset Notifikasi Unread ketika chat diklik
                    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread: false } : t));
                  }}
                  className={`w-full flex items-start gap-3 p-4 text-left transition-colors duration-150 relative cursor-pointer ${isActive ? 'bg-slate-100 dark:bg-[#0c1220]/80' : 'hover:bg-slate-50 dark:hover:bg-slate-900/20'}`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />}
                  <div className="relative flex-shrink-0">
                    {thread.avatar ? (
                      <img src={thread.avatar} alt={thread.name} className="w-10 h-10 rounded-full object-cover border dark:border-slate-700" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                        {thread.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#0e1626] bg-emerald-500" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h3 className="text-xs sm:text-sm font-bold truncate text-slate-900 dark:text-slate-200">{thread.name}</h3>
                      <span className="text-[9px] text-slate-400 whitespace-nowrap flex-shrink-0">{thread.time}</span>
                    </div>

                    {/* BAGIAN PENANDA UNREAD (TITIK BERKEDIP) */}
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs truncate flex-1 ${thread.unread ? 'text-cyan-500 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-400 font-medium'}`}>
                        {thread.lastMessage}
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

        {/* --- PANEL KANAN: JENDELA OBROLAN JALUR UTAMA --- */}
        <section className="flex-1 min-w-0 min-h-0 flex flex-col bg-white dark:bg-[#090d16]">
          <div className="flex-shrink-0 bg-amber-50 border-b border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 px-4 py-2.5 flex items-center gap-2 text-[10px] sm:text-xs text-amber-700 dark:text-amber-500/90 font-medium">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500 flex-shrink-0" />
            <span>Demi keamanan, dilarang bertransaksi atau membagikan kontak pribadi di luar platform.</span>
          </div>

          {activeThread ? (
            <>
              {/* Header Informasi Lawan Bicara */}
              <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/20 dark:bg-[#0e1626]/20">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {activeThread.avatar ? (
                      <img src={activeThread.avatar} alt={activeThread.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                        {activeThread.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#090d16] bg-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200">{activeThread.name}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">{activeThread.status}</p>
                  </div>
                </div>
              </div>

              {/* Tampilan Riwayat Percakapan */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/20 dark:bg-[#090d16]/30">
                <div className="flex items-center justify-center py-2 mb-4">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-3 bg-white dark:bg-[#090d16] rounded-full z-10">
                    Koneksi Terhubung
                  </span>
                </div>

                <div className="space-y-4 flex flex-col">
                  {messages.map((message) => (
                    <ChatBubble
                      key={message.id}
                      message={message}
                      isUser={message.sender === 'user'}
                      threadName={activeThread.name}
                      avatarUrl={activeThread.avatar}
                    />
                  ))}
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
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
  );
}

export default function ClientInbox() {
  return (
    <React.Suspense fallback={<div className="flex h-[calc(100vh-80px)] items-center justify-center text-slate-500">Memuat Inbox...</div>}>
      <InboxContent />
    </React.Suspense>
  );
}