import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Star, Heart, Paperclip, Send, MoreVertical, Phone, Video, X } from 'lucide-react';

interface ChatUser {
  id: number;
  name: string;
  avatar: string;
  status: string;
  message: string;
  time: string;
  isNew: boolean;
  hasAttachment: boolean;
}

const chatUsers: ChatUser[] = [
  {
    id: 1,
    name: 'Sarah_W',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    status: 'online',
    message: 'Hey, how are you doing today?',
    time: '4:05 PM',
    isNew: true,
    hasAttachment: true
  },
  {
    id: 2,
    name: 'Jessica_Rose',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&q=80',
    status: 'online',
    message: 'Check out this photo I took!',
    time: '4:04 PM',
    isNew: true,
    hasAttachment: false
  },
  {
    id: 3,
    name: 'Emily_Dream',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80',
    status: 'online',
    message: 'Are we still on for later?',
    time: '3:38 PM',
    isNew: true,
    hasAttachment: false
  },
  {
    id: 4,
    name: 'Anna_Bella',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    status: 'online',
    message: 'Hello! Long time no see.',
    time: '1:05 PM',
    isNew: false,
    hasAttachment: false
  },
  {
    id: 5,
    name: 'Lisa_Model',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=100&q=80',
    status: 'online',
    message: 'I would love to hear your thoughts.',
    time: '10:06 AM',
    isNew: true,
    hasAttachment: false
  },
  {
    id: 6,
    name: 'Bianca_C',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
    status: 'offline',
    message: 'See you tomorrow!',
    time: 'Jan 27, 2025',
    isNew: false,
    hasAttachment: false
  },
  {
    id: 7,
    name: 'Andrea_B',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    status: 'offline',
    message: 'You sent a photo.',
    time: 'Jan 27, 2025',
    isNew: false,
    hasAttachment: true
  }
];

interface ChatSidebarProps {
  activeChatId: number | null;
  onSelectChat: (id: number | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Type des messages
interface Message {
  id: number;
  text: string;
  fromMe: boolean;
  time: string;
}

export const ChatSidebar = ({ activeChatId, onSelectChat, isOpen, onClose }: ChatSidebarProps) => {
  const activeUser = chatUsers.find(u => u.id === activeChatId);
  const [inputValue, setInputValue] = useState('');
  const [conversations, setConversations] = useState<Record<number, Message[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automatique vers le bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeChatId]);

  // Messages de la conversation active (messages mock + messages envoyés)
  const getMessages = (userId: number): Message[] => {
    const u = chatUsers.find(c => c.id === userId);
    const base: Message[] = [
      { id: 1, text: 'Hello! How are you doing?', fromMe: false, time: '10:00 AM' },
      { id: 2, text: "I'm doing great, thanks! Just working on this new project.", fromMe: true, time: '10:02 AM' },
      { id: 3, text: u?.message ?? '', fromMe: false, time: u?.time ?? '' },
    ];
    return [...base, ...(conversations[userId] ?? [])];
  };

  const sendMessage = () => {
    if (!inputValue.trim() || !activeChatId) return;
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: Date.now(),
      text: inputValue.trim(),
      fromMe: true,
      time: now,
    };
    setConversations(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] ?? []), newMsg],
    }));
    setInputValue('');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-x-0 bottom-0 top-[92px] bg-black/50 z-20 xl:hidden"
          onClick={onClose}
        />
      )}

      <div 
        className={`
          fixed bottom-0 right-0 top-[92px] bg-white border-l border-gray-200 shadow-xl z-30 transition-all duration-300 flex
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          xl:translate-x-0 xl:sticky xl:top-[92px] xl:h-[calc(100vh-92px)] xl:inset-auto
          w-full sm:w-[400px] xl:w-auto
          ${activeChatId ? 'xl:w-[640px]' : 'xl:w-80'}
        `}
      >
        {/* Left Side: Chat List */}
        <div className={`
          flex flex-col h-full border-r border-gray-100 w-full xl:w-80 flex-shrink-0 bg-white
          ${activeChatId ? 'hidden xl:flex' : 'flex'}
        `}>
          {/* Header Tabs */}
          <div className="flex items-center justify-between bg-black text-white h-14 px-4 flex-shrink-0">
            <div className="flex items-center gap-6">
              <button className="relative p-1 hover:text-gray-300 transition-colors">
                <MessageCircle size={24} className="text-orange-500 fill-orange-500" />
                <span className="absolute -top-1 -right-2 bg-lime-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-black">
                  8
                </span>
              </button>
              <button className="p-1 hover:text-gray-300 transition-colors">
                <Star size={24} className="text-white" />
              </button>
              <button className="p-1 hover:text-gray-300 transition-colors">
                <Heart size={24} className="text-white" />
              </button>
            </div>
            {/* Mobile Close Button */}
            <button onClick={onClose} className="xl:hidden p-1 hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 bg-white border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full pl-4 pr-4 py-2 bg-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {chatUsers.map((user) => (
              <div 
                key={user.id} 
                onClick={() => onSelectChat(user.id)}
                className={`flex items-start gap-3 p-3 border-b border-gray-100 cursor-pointer transition-colors group ${activeChatId === user.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  {user.status === 'online' && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-lime-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-orange-500 text-sm truncate">{user.name}</h3>
                    {user.isNew && (
                      <span className="text-xs font-bold text-lime-600">NEW</span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-800 font-medium truncate mt-0.5 flex items-center gap-1">
                    {user.hasAttachment && <Paperclip size={12} className="text-gray-500" />}
                    {user.message}
                  </p>
                  
                  <p className="text-xs text-gray-400 mt-1">{user.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Active Chat Window — animated wrapper */}
        <div className={`
          overflow-x-hidden transition-[width] duration-300 flex-shrink-0 h-full
          ${activeChatId ? 'w-full xl:w-80' : 'w-0 xl:w-0'}
        `}>
          {activeUser && (
            <div className="flex flex-col h-full bg-gray-50 xl:w-80 w-full">
              {/* Chat Header */}
              <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {/* Back Button (Mobile only) */}
                  <button 
                    onClick={() => onSelectChat(null)}
                    className="p-1 -ml-2 hover:bg-gray-100 rounded-full xl:hidden"
                  >
                    <X size={20} />
                  </button>
                  
                  <img src={activeUser.avatar} alt={activeUser.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <h3 className="font-bold text-sm">{activeUser.name}</h3>
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-500">
                  <Phone size={20} className="hover:text-gray-800 cursor-pointer" />
                  <Video size={20} className="hover:text-gray-800 cursor-pointer" />
                  <MoreVertical size={20} className="hover:text-gray-800 cursor-pointer" />
                  <button onClick={() => onSelectChat(null)} className="hover:text-red-500 hidden xl:block">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
                <div className="flex justify-center">
                  <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full">Today</span>
                </div>

                {activeChatId && getMessages(activeChatId).map((msg) => (
                  msg.fromMe ? (
                    <div key={msg.id} className="flex gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center self-end text-xs font-bold text-gray-600 flex-shrink-0">ME</div>
                      <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-br-none shadow-sm max-w-[70%]">
                        <p className="text-sm">{msg.text}</p>
                        <span className="text-[10px] text-blue-100 block mt-1 text-right">{msg.time}</span>
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex gap-3">
                      <img src={activeUser!.avatar} alt={activeUser!.name} className="w-8 h-8 rounded-full object-cover self-end flex-shrink-0" />
                      <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm max-w-[70%]">
                        <p className="text-sm text-gray-800">{msg.text}</p>
                        <span className="text-[10px] text-gray-400 block mt-1 text-right">{msg.time}</span>
                      </div>
                    </div>
                  )
                ))}
                {/* Ancre pour auto-scroll */}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <Paperclip size={20} className="text-gray-500 cursor-pointer hover:text-gray-700" />
                  <input
                    type="text"
                    placeholder="Écrire un message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 bg-transparent focus:outline-none text-sm"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim()}
                    className="bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
