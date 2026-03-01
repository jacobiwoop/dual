import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, Gift, Send, Users,
  Maximize2, Volume2, VolumeX, MessageCircle, Crown, Eye, Star
} from 'lucide-react';

interface ChatMsg {
  id: number;
  user: string;
  text: string;
  type: 'normal' | 'tip' | 'mod' | 'vip';
  amount?: number;
  color: string;
}

const CREATOR = {
  id: 1,
  name: 'Luna Star',
  username: 'luna_star',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  banner: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80',
  viewers: 1247,
  goal: { current: 320, target: 500, label: '🔥 Full show' },
};

const OTHER_CAMS = [
  { id: 2, name: 'Anna_Belle', age: 22, isLive: true,  img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80', msg: 'Come join 😊' },
  { id: 3, name: 'Hot-Alissa', age: 27, isLive: true,  img: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=400&q=80', msg: 'totally horny 🔥' },
  { id: 4, name: 'wet-wonder', age: 25, isLive: true,  img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80', msg: 'Ready for you 💋' },
  { id: 5, name: 'SophiaL',    age: 23, isLive: false, img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80', msg: 'Miss me? 😘' },
  { id: 6, name: 'Analola',    age: 24, isLive: true,  img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', msg: 'Ready for fun 💋' },
];

const TIP_AMOUNTS = [10, 20, 50, 100, 200];

const INITIAL_MSGS: ChatMsg[] = [
  { id: 1, user: 'Moderator', text: 'Bienvenue ! Restez respectueux 🙏', type: 'mod', color: '#4fc3f7' },
  { id: 2, user: 'MaxV',      text: 'Luna tu es incroyable ce soir 😍', type: 'vip', color: '#c8a84b' },
  { id: 3, user: 'alex_94',   text: 'Première fois ici, trop bien !',   type: 'normal', color: '#9c96ff' },
  { id: 4, user: 'MaxV',      text: '🎁 a envoyé 100 🪙',              type: 'tip', amount: 100, color: '#c8a84b' },
  { id: 5, user: 'Sophie_K',  text: 'Je suis fan depuis le début 💜',   type: 'vip', color: '#e040fb' },
];

const AUTO_MSGS = [
  { user: 'alex_94',  text: 'trop belle 🔥🔥',               type: 'normal' as const, color: '#9c96ff' },
  { user: 'Marco_V',  text: 'on est combien là ?',             type: 'normal' as const, color: '#4caf50' },
  { user: 'Sophie_K', text: 'GOAT 👑',                         type: 'vip'    as const, color: '#e040fb' },
  { user: 'chris_88', text: '🎁 a envoyé 50 🪙',              type: 'tip'    as const, color: '#c8a84b', amount: 50 },
  { user: 'luc_p',    text: 'wsh première fois ici',           type: 'normal' as const, color: '#ff8a65' },
  { user: 'MaxV',     text: 'Luna tu gères 💜',                type: 'vip'    as const, color: '#c8a84b' },
  { user: 'kevin_x',  text: '🎁 a envoyé 200 🪙',             type: 'tip'    as const, color: '#c8a84b', amount: 200 },
  { user: 'tom_11',   text: 'plus que quelques tokens !',      type: 'normal' as const, color: '#4caf50' },
];

export const LivePage = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [msgs, setMsgs]         = useState<ChatMsg[]>(INITIAL_MSGS);
  const [input, setInput]       = useState('');
  const [muted, setMuted]       = useState(false);
  const [goalProgress, setGoal] = useState(CREATOR.goal.current);
  const [viewers, setViewers]   = useState(CREATOR.viewers);
  const [liked, setLiked]       = useState(false);
  const [tipFlash, setTipFlash] = useState<number | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const msgId   = useRef(100);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs]);

  // Auto messages
  useEffect(() => {
    const interval = setInterval(() => {
      const m = AUTO_MSGS[Math.floor(Math.random() * AUTO_MSGS.length)];
      setMsgs(prev => [...prev.slice(-60), { id: msgId.current++, user: m.user, text: m.text, type: m.type, color: m.color, amount: (m as any).amount }]);
      setViewers(v => Math.max(100, v + Math.floor(Math.random() * 7) - 3));
      if (m.type === 'tip' && (m as any).amount) {
        setGoal(g => Math.min(g + (m as any).amount / 10, CREATOR.goal.target));
      }
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const sendMsg = () => {
    if (!input.trim()) return;
    setMsgs(prev => [...prev.slice(-60), { id: msgId.current++, user: 'Vous', text: input, type: 'vip', color: '#c8a84b' }]);
    setInput('');
  };

  const sendTip = (amount: number) => {
    setGoal(g => Math.min(g + amount / 10, CREATOR.goal.target));
    setTipFlash(amount);
    setMsgs(prev => [...prev.slice(-60), { id: msgId.current++, user: 'Vous', text: `🎁 a envoyé ${amount} 🪙`, type: 'tip', color: '#c8a84b', amount }]);
    setTimeout(() => setTipFlash(null), 2000);
  };

  const goalPct = Math.min((goalProgress / CREATOR.goal.target) * 100, 100);

  return (
    <div className="-mx-8 min-h-screen bg-gray-950 text-white flex flex-col xl:flex-row">

      {/* ── COLONNE PRINCIPALE ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Back bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Retour
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Eye size={14} />
            <span className="font-bold text-white">{viewers.toLocaleString()}</span>
            <span>viewers</span>
          </div>
        </div>

        {/* PLAYER */}
        <div className="relative bg-black w-full" style={{ aspectRatio: '16/9' }}>
          <img src={CREATOR.banner} alt="live" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

          {/* Badge LIVE */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
          </div>

          {/* Contrôles */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button onClick={() => setMuted(!muted)} className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <button className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
              <Maximize2 size={14} />
            </button>
          </div>

          {/* Infos créatrice */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3">
            <img src={CREATOR.avatar} alt={CREATOR.name} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
            <div>
              <p className="font-bold text-white text-sm">{CREATOR.name}</p>
              <p className="text-gray-300 text-xs">@{CREATOR.username}</p>
            </div>
          </div>

          {/* Tip flash */}
          {tipFlash && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-amber-400/90 text-black font-black text-2xl px-8 py-4 rounded-2xl shadow-2xl animate-bounce">
                🎁 +{tipFlash} 🪙
              </div>
            </div>
          )}
        </div>

        {/* GOAL BAR */}
        <div className="bg-gray-900 px-4 py-3 border-b border-gray-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-gray-300">🎯 {CREATOR.goal.label}</span>
            <span className="text-xs font-bold text-amber-400">{Math.round(goalProgress)} / {CREATOR.goal.target} 🪙</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${goalPct}%` }} />
          </div>
          {goalPct >= 100 && <p className="text-center text-xs font-black text-amber-400 mt-1 animate-pulse">🎉 OBJECTIF ATTEINT !</p>}
        </div>

        {/* TIPS RAPIDES */}
        <div className="bg-gray-900 px-4 py-2.5 flex items-center gap-2 border-b border-gray-800 overflow-x-auto">
          <Gift size={14} className="text-amber-400 flex-shrink-0" />
          <span className="text-xs text-gray-400 flex-shrink-0 mr-1">Tip :</span>
          {TIP_AMOUNTS.map(amount => (
            <button key={amount} onClick={() => sendTip(amount)}
              className="flex-shrink-0 px-3 py-1.5 bg-gray-800 hover:bg-amber-500 hover:text-black text-amber-400 text-xs font-bold rounded-full border border-gray-700 hover:border-amber-500 transition-all">
              {amount}🪙
            </button>
          ))}
          <button onClick={() => navigate('/credits')}
            className="flex-shrink-0 ml-auto px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs rounded-full border border-gray-700 transition-colors whitespace-nowrap">
            + Acheter 🪙
          </button>
        </div>

        {/* CHAT */}
        <div className="flex-1 flex flex-col bg-gray-950">
          <div ref={chatRef} className="overflow-y-auto px-4 py-3 space-y-2" style={{ maxHeight: '300px' }}>
            {msgs.map(msg => (
              <div key={msg.id} className={`flex gap-2 text-sm ${msg.type === 'tip' ? 'bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2' : ''}`}>
                {msg.type === 'tip' ? (
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-lg">🎁</span>
                    <span className="font-bold text-amber-400">{msg.user}</span>
                    <span className="text-gray-300 text-xs">{msg.text.replace('🎁 a envoyé ', 'a envoyé ')}</span>
                  </div>
                ) : (
                  <>
                    <span className="font-bold flex-shrink-0 text-xs" style={{ color: msg.color }}>
                      {msg.type === 'mod' && '🛡️ '}{msg.type === 'vip' && '⭐ '}{msg.user}
                    </span>
                    <span className="text-gray-300 text-xs break-words">{msg.text}</span>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-gray-800">
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2 border border-gray-700 focus-within:border-gray-500 transition-colors">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
                placeholder="Écrire un message..." className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none" />
              <button onClick={sendMsg} className="w-7 h-7 bg-pink-500 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                <Send size={13} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-3">
                <button onClick={() => setLiked(!liked)} className={`flex items-center gap-1 text-xs font-semibold transition-colors ${liked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}>
                  <Heart size={14} className={liked ? 'fill-pink-500' : ''} /> J'aime
                </button>
                <button onClick={() => navigate(`/profile/${CREATOR.username}`)} className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-amber-400 transition-colors">
                  <Crown size={14} /> S'abonner
                </button>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users size={12} /><span>{viewers.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── COLONNE DROITE — AUTRES CAMS ── */}
      <div className="hidden xl:flex flex-col w-60 flex-shrink-0 bg-gray-900 border-l border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">Autres Cams</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {OTHER_CAMS.map(cam => (
            <div key={cam.id} onClick={() => navigate(`/live/${cam.id}`)}
              className="border-b border-gray-800 group cursor-pointer hover:bg-gray-800 transition-colors">
              <div className="relative h-36 overflow-hidden">
                <img src={cam.img} alt={cam.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {cam.msg && (
                  <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/70 to-transparent px-3 py-2">
                    <p className="text-white text-xs">{cam.msg}</p>
                  </div>
                )}
                {cam.isLive ? (
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                  </span>
                ) : (
                  <span className="absolute bottom-2 left-2 bg-gray-700 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Hors ligne</span>
                )}
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cam.isLive ? 'bg-green-500' : 'bg-gray-600'}`} />
                  <span className="text-gray-300 text-xs font-semibold truncate">{cam.name} ({cam.age})</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <MessageCircle size={11} /><Star size={11} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};