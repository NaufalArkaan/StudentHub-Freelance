'use client';

import * as React from 'react';
import { Search, AlertTriangle, MoreVertical, Plus, Image as ImageIcon, Send } from 'lucide-react';

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

export default function ClientInbox() {
  const [activeThreadId, setActiveThreadId] = React.useState('thread-1');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [inputText, setInputText] = React.useState('');

  const [threads, setThreads] = React.useState<ChatThread[]>([
    {
      id: 'thread-1',
      name: 'Sarah J.',
      avatar: 'S',
      status: 'Online',
      lastMessage: "I've finished the integration section for Calculus II...",
      time: '12:45 PM',
      messages: [
        {
          id: 'msg-1-1',
          sender: 'other',
          text: 'Halo pak Budi. Untuk wireframe awal sudah selesai, sedang saya susun untuk visual mockup-nya.',
          time: '12:40 PM',
        },
        {
          id: 'msg-1-2',
          sender: 'other',
          text: 'Nanti siang saya kirimkan draft pertamanya via menu Order ya pak.',
          time: '12:41 PM',
        },
        {
          id: 'msg-1-3',
          sender: 'user',
          text: 'Baik, saya akan review draft-nya hari ini.',
          time: '12:43 PM',
        },
        {
          id: 'msg-1-4',
          sender: 'other',
          text: '...',
          time: '12:44 PM',
          isTyping: true,
        },
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
        {
          id: 'msg-2-1',
          sender: 'user',
          text: 'Hi Alex, did you modify the onboarding flow?',
          time: 'Yesterday, 3:00 PM',
        },
        {
          id: 'msg-2-2',
          sender: 'other',
          text: 'The Figma file has been updated with the new designs. Take a look at page 3.',
          time: 'Yesterday, 3:15 PM',
        },
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
        {
          id: 'msg-3-1',
          sender: 'other',
          text: 'The Python script is ready for your lab data.',
          time: 'Monday, 10:00 AM',
        },
        {
          id: 'msg-3-2',
          sender: 'user',
          text: 'Awesome, will test it tonight and let you know!',
          time: 'Monday, 10:15 AM',
        },
      ],
    },
  ]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Filter out typing indicator first if it exists
    const cleanedMessages = activeThread.messages.filter((m) => !m.isTyping);

    const newMsg: Message = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Re-append typing indicator for Sarah J thread if it was there
    const updatedMessages = [...cleanedMessages, newMsg];
    if (activeThread.id === 'thread-1') {
      updatedMessages.push({
        id: 'msg-1-4',
        sender: 'other',
        text: '...',
        time: '',
        isTyping: true,
      });
    }

    setThreads(
      threads.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            lastMessage: inputText,
            time: 'Just now',
            messages: updatedMessages,
          };
        }
        return t;
      })
    );

    setInputText('');
  };

  // Filter threads by search query
  const filteredThreads = threads.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)] flex flex-col">
      {/* Split Pane Area */}
      <div className="flex-grow flex rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0e1626] overflow-hidden shadow-sm">

        {/* Left Sidebar - Thread List */}
        <aside className="w-80 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-[#0e1626]/20">
          <div className="p-4 border-b border-slate-200 dark:border-slate-900 space-y-4">
            <h2 className="text-xl font-extrabold tracking-tight">Messages</h2>
            {/* Search conversations */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-400 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:ring-cyan-500 text-xs"
              />
            </div>
          </div>

          {/* Conversations Scroll List */}
          <div className="flex-grow overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900/50">
            {filteredThreads.map((thread) => {
              const isActive = thread.id === activeThreadId;
              return (
                <button
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`w-full flex items-start gap-3 p-4 text-left transition-colors duration-150 relative cursor-pointer ${isActive
                    ? 'bg-slate-100 dark:bg-[#0c1220]/80'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-900/20'
                    }`}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
                  )}

                  {/* Avatar with Status Dot */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-650 dark:text-slate-300">
                      {thread.avatar}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#0e1626] ${thread.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                    />
                  </div>

                  {/* Thread details */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h3 className="text-xs sm:text-sm font-bold truncate text-slate-850 dark:text-slate-200">
                        {thread.name}
                      </h3>
                      <span className="text-[9px] text-slate-400 whitespace-nowrap flex-shrink-0">
                        {thread.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {thread.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Pane - Chat Window */}
        <section className="flex-grow flex flex-col bg-white dark:bg-[#090d16]">
          {/* Yellow Warning Banner */}
          <div className="bg-amber-50 border-b border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 px-4 py-2.5 flex items-center gap-2 text-[10px] sm:text-xs text-amber-700 dark:text-amber-500/90 font-medium">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500 flex-shrink-0" />
            <span>Demi keamanan, dilarang bertransaksi atau membagikan kontak pribadi di luar platform.</span>
          </div>

          {/* Active Chat Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-900 flex items-center justify-between bg-slate-50/20 dark:bg-[#0e1626]/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-650 dark:text-slate-350">
                  {activeThread.avatar}
                </div>
                <span
                  className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#090d16] ${activeThread.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-850 dark:text-slate-200">{activeThread.name}</h3>
                <p className="text-[10px] text-slate-400 font-semibold">{activeThread.status}</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-650 dark:hover:text-white p-2">
              <MoreVertical className="h-5 w-5" />
            </button>
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
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''
                      }`}
                  >
                    {/* Avatar for recipient */}
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-slate-650 dark:text-slate-300 text-xs">
                        {activeThread.avatar}
                      </div>
                    )}

                    {/* Speech Bubble */}
                    <div className="space-y-1">
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm leading-relaxed ${isUser
                          ? 'bg-cyan-400 text-slate-950 font-medium rounded-tr-none'
                          : message.isTyping
                            ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 italic rounded-tl-none tracking-widest'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800/80 dark:text-slate-200 rounded-tl-none'
                          }`}
                      >
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
            className="p-4 border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0e1626]/40 flex items-center gap-3"
          >
            {/* Attachment Button */}
            <button
              type="button"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-650 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Plus className="h-5 w-5" />
            </button>

            {/* Upload Image Button */}
            <button
              type="button"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-650 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ImageIcon className="h-5 w-5" />
            </button>

            {/* TextInput Box */}
            <input
              type="text"
              placeholder="Type your message here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-grow py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-white dark:focus:ring-cyan-500 text-xs sm:text-sm"
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
