import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft, Star, Send, Mic, MessageCircle, Smile, Heart,
  Gift, Users, Paperclip, Crown, Camera, CheckCircle2
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────
type ProfileTab = 'details' | 'game' | 'pictures' | 'friends';
interface OutletContext { openChat: (id: string | number) => void; activeChatId: string | number | null; }

// ─── Mock Creator ───────────────────────────────────────────────────────────
const CREATOR = {
  id: 1,
  name: 'Luna Star',
  age: 24,
  country: 'France',
  isLive: true,
  rating: 4.82,
  pictureCount: 12,
  messageCost: 50,
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
  about: {
    age: 24, height: '165 cm', hairColor: 'brown', eyeColor: 'green',
    tattoos: 'none', glasses: 'no', gender: 'female', bodyType: 'slim',
    hairLength: 'long', ethnicity: 'White / Caucasian', country: 'France',
  },
  tags: ['Brunette', 'European', 'Long Hair', 'Roleplay', 'Student', 'Teens 18+'],
  preferences: {
    lookingFor: 'a man',
    wouldLike: ['a relationship', 'a flirt', 'a ONS', 'an exciting friendship'],
    turnsOn: ['Being dominant', 'RPG'],
  },
};

// ─── Mock CAMS ──────────────────────────────────────────────────────────────
const CAMS = [
  { id: 2, name: 'Anna_Belle',  age: 22, isLive: true,  img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80', msg: 'Hi welcome 😊🥰😍' },
  { id: 3, name: 'Hot-Alissa',  age: 27, isLive: true,  img: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=400&q=80', msg: 'Come join me!' },
  { id: 4, name: 'wet-wonder',  age: 25, isLive: true,  img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80', msg: 'totally horny 🔥' },
  { id: 5, name: 'SophiaL',     age: 23, isLive: false, img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80', msg: 'Miss me? 😘' },
  { id: 6, name: 'Analola',     age: 24, isLive: true,  img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', msg: 'Ready for fun 💋' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const ABOUT_CARDS = (a: typeof CREATOR.about) => [
  { icon: '🎂', label: 'Age',       value: a.age },
  { icon: '📏', label: 'Height',    value: a.height },
  { icon: '💇', label: 'Hair',      value: a.hairColor },
  { icon: '👁️', label: 'Eyes',      value: a.eyeColor },
  { icon: '🌸', label: 'Tattoos',   value: a.tattoos },
  { icon: '👓', label: 'Glasses',   value: a.glasses },
];

// ─── Composant ──────────────────────────────────────────────────────────────
export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate      = useNavigate();
  const { openChat, activeChatId } = useOutletContext<OutletContext>();

  const [activeTab, setActiveTab] = useState<ProfileTab>('details');
  const [message,   setMessage]   = useState('');
  const [favorite,  setFavorite]  = useState(false);
  
  // Real creator data state
  const [creatorData, setCreatorData] = useState<any>(null);

  React.useEffect(() => {
    const fetchCreator = async () => {
      try {
        const { default: api } = await import('../services/api');
        const res = await api.get(`/api/client/creators/${username}`);
        setCreatorData(res.data.creator);
      } catch (err) {
        console.error("Erreur lors de la récupération du créateur", err);
      }
    };
    if (username) fetchCreator();
  }, [username]);

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: 'details',  label: 'Details' },
    { id: 'game',     label: 'Game' },
    { id: 'pictures', label: `Pictures (${CREATOR.pictureCount})` },
    { id: 'friends',  label: 'Friends' },
  ];

  const actionBtns = [
    { 
      icon: <MessageCircle size={17} />, 
      label: `Chat with ${creatorData?.displayName?.split(' ')[0] || CREATOR.name.split(' ')[0]}`, 
      action: () => {
        if (creatorData?.id) {
          openChat(creatorData.id);
        } else {
          alert("Ce profil est un profil de démonstration (Mock). Vous ne pouvez chatter qu'avec un vrai profil enregistré en base de données, comme 'bella_creator'.");
        }
      }, 
      accent: 'text-pink-500' 
    },
    { icon: <Smile         size={17} />, label: 'Smileys',   action: () => {}, accent: 'text-yellow-500' },
    { icon: <span className="text-base leading-none">🎭</span>, label: 'Sexicons', action: () => {}, accent: '' },
    { icon: <Heart         size={17} />, label: 'Free Kiss',  action: () => {}, accent: 'text-red-500' },
    { icon: <Star          size={17} />, label: favorite ? 'Favorited ★' : 'Favorite', action: () => setFavorite(!favorite), accent: 'text-orange-400' },
    { icon: <span className="text-base leading-none">🪙</span>, label: 'Buy coins', action: () => navigate('/credits'), accent: '' },
    { icon: <Paperclip    size={17} />, label: 'Attachment', action: () => {}, accent: 'text-gray-500' },
    { icon: <Gift          size={17} />, label: 'Gift',       action: () => {}, accent: 'text-pink-400' },
    { icon: <Users         size={17} />, label: 'Friends',    action: () => {}, accent: 'text-blue-400' },
  ];

  return (
    <div className="-mx-8 min-h-screen bg-gray-100">

      {/* ── Back ── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors px-5 py-3 text-sm"
      >
        <ArrowLeft size={15} /> Retour
      </button>

      <div className="flex flex-col xl:flex-row">

        {/* ══════════════════════════════
            COLONNE GAUCHE
        ══════════════════════════════ */}
        <div className="flex-1 min-w-0">

          {/* ── [1] Onglets ── */}
          <div className="flex bg-white border-b border-gray-300 px-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── [2] Bandeau Nom ── */}
          <div className="px-5 py-3 bg-white border-b border-gray-200">
            <p className="text-sm">
              <span className="text-gray-900 font-bold text-base">{CREATOR.name} ({CREATOR.age})</span>
              <span className="text-gray-300 ml-2">from {CREATOR.country}</span>
            </p>
          </div>

          {/* ─── Contenu selon onglet ─── */}

          {activeTab === 'details' && (
            <div className="p-4 space-y-4">
              {/* ── [3] Photo principale ── */}
              <div className="relative bg-black overflow-hidden shadow-sm">
                <img
                  src={CREATOR.avatar}
                  alt={CREATOR.name}
                  className="w-full object-cover max-h-[480px]"
                />
                {CREATOR.isLive && (
                  <span className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    EN LIVE
                  </span>
                )}
              </div>

              {/* ── [4] Barre rating ── */}
              <div className="flex items-center gap-3 px-5 py-3 bg-white shadow text-sm">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={13} className={i <= Math.round(CREATOR.rating) ? 'text-orange-400 fill-orange-400' : 'text-gray-300 fill-gray-300'} />
                  ))}
                  <span className="text-orange-500 font-bold ml-1">{CREATOR.rating}</span>
                </div>
                <span className="text-gray-300">|</span>
                <button className="text-gray-400 hover:text-gray-700 hover:underline">to gallery</button>
                <span className="text-gray-200">|</span>
                <button className="text-gray-400 hover:text-gray-700 hover:underline">Comments (2)</button>
              </div>

              {/* ── [5] YOUR MESSAGE ── */}
              <div className="bg-white shadow px-5 py-4">
                <p className="text-xs font-bold tracking-widest text-orange-500 mb-3">YOUR MESSAGE</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && setMessage('')}
                    placeholder={`Your message (${CREATOR.messageCost} Coins)`}
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"
                  />
                  <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 rounded-lg transition-colors">
                    <Send size={16} />
                  </button>
                  <button className="bg-orange-400 hover:bg-orange-500 text-white px-4 rounded-lg transition-colors">
                    <Mic size={16} />
                  </button>
                </div>
              </div>

              {/* ── [6] Grille d'actions (2× mobile / 3× desktop) ── */}
              <div className={`grid gap-px bg-gray-100 overflow-hidden shadow-sm ${activeChatId ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                {actionBtns.map((btn, i) => (
                  <button
                    key={i}
                    onClick={btn.action}
                    className="flex items-center gap-2.5 px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors text-sm"
                  >
                    <span className={btn.accent}>{btn.icon}</span>
                    <span className="text-gray-600 font-medium">{btn.label}</span>
                  </button>
                ))}
              </div>

              {/* ── [7a] ABOUT ME ── */}
              <div className="bg-white shadow p-5">
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">ABOUT ME</p>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {ABOUT_CARDS(CREATOR.about).map((c, i) => (
                    <div key={i} className="border border-gray-200 bg-gray-50 p-3 text-center shadow-sm">
                      <div className="text-xl mb-1">{c.icon}</div>
                      <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">{c.label}</p>
                      <p className="text-gray-700 text-xs font-semibold">{c.value}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    ['Gender',    CREATOR.about.gender],
                    ['Body type', CREATOR.about.bodyType],
                    ['Hair length', CREATOR.about.hairLength],
                    ['Ethnicity', CREATOR.about.ethnicity],
                    ['Country',   CREATOR.about.country],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-gray-700 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── [7b] INFOS ── */}
              <div className="bg-white shadow p-5">
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">INFOS</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {CREATOR.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 font-medium border border-gray-200 hover:bg-gray-200 cursor-pointer transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-sm font-semibold text-gray-700 mb-3">My preferences</p>

                <p className="text-xs font-semibold text-pink-500 uppercase tracking-wide mb-2">What I'm looking for</p>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{CREATOR.preferences.lookingFor}</span>
                </div>

                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">What I'd like to experience</p>
                <div className="space-y-1.5 mb-4">
                  {CREATOR.preferences.wouldLike.map(item => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                      <span className="text-gray-500 text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">What turns me on</p>
                <div className="space-y-1.5">
                  {CREATOR.preferences.turnsOn.map(item => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                      <span className="text-gray-500 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pictures' && (
            <div className="p-4">
              <div className="bg-white shadow p-5">
              <div className="grid grid-cols-3 gap-3">
                {[...Array(CREATOR.pictureCount)].map((_, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-sm">
                    <img
                      src={`https://images.unsplash.com/photo-${['1544005313-94ddf0286df2','1529626455594-4ff0802cfb7e','1515886657613-9f3515b0c78f','1517841905240-472988babdf9','1524504388940-b1c1722653e1','1500917293891-ef795e70e1f6'][i % 6]}?w=300&q=80`}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {i > 3 && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center">
                          <Crown size={24} className="text-pink-500 mx-auto mb-1" />
                          <span className="text-xs font-bold text-pink-600">Premium</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              </div>
            </div>
          )}

          {(activeTab === 'game' || activeTab === 'friends') && (
            <div className="m-4 bg-white shadow-sm flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="text-5xl mb-4">{activeTab === 'game' ? '🎮' : '👥'}</div>
              <p className="text-sm">Section {activeTab === 'game' ? 'Game' : 'Friends'} bientôt disponible</p>
            </div>
          )}
        </div>

        {/* ══════════════════════════════
            COLONNE DROITE — CAMS
        ══════════════════════════════ */}
        <div className="hidden xl:block w-64 flex-shrink-0 border-l border-gray-300 bg-gray-50">

          {/* ── En-tête CAMS ── */}
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">CAMS</span>
          </div>

          {/* ── Cards CAMS ── */}
          <div className="overflow-y-auto scrollbar-hide">
            {CAMS.map(cam => (
              <div
                key={cam.id}
                onClick={() => navigate(`/profile/${cam.name.toLowerCase()}`)}
                className="border-b border-gray-100 group cursor-pointer"
              >
                {/* Miniature */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={cam.img}
                    alt={cam.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Message overlay */}
                  {cam.msg && (
                    <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/60 to-transparent px-3 py-2">
                      <p className="text-white text-xs font-medium">{cam.msg}</p>
                    </div>
                  )}
                  {/* Live badge */}
                  {cam.isLive && (
                    <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                    </span>
                  )}
                </div>

                {/* Barre nom + icônes */}
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 group-hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cam.isLive ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-gray-700 text-xs font-semibold truncate">{cam.name} ({cam.age})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Camera       size={13} className="hover:text-gray-700" />
                    <MessageCircle size={13} className="hover:text-gray-700" />
                    <Star         size={13} className="hover:text-orange-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
