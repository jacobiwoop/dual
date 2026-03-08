import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft, Star, Send, Mic, MessageCircle, Smile, Heart,
  Gift, Users, Paperclip, Crown, Camera, CheckCircle2, Lock,
  ChevronLeft, ChevronRight, X, Film, User, ImageOff, Loader
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────
type ProfileTab = 'details' | 'game' | 'pictures' | 'friends';
interface OutletContext { openChat: (id: string | number) => void; activeChatId: string | number | null; }

// ─── Component Helper ───────────────────────────────────────────────────────
const CAMS = [
  { id: 2, name: 'Anna_Belle',  age: 22, isLive: true,  img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80', msg: 'Hi welcome 😊🥰😍' },
  { id: 3, name: 'Hot-Alissa',  age: 27, isLive: true,  img: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=400&q=80', msg: 'Come join me!' },
  { id: 4, name: 'wet-wonder',  age: 25, isLive: true,  img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80', msg: 'totally horny 🔥' },
  { id: 5, name: 'SophiaL',     age: 23, isLive: false, img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80', msg: 'Miss me? 😘' },
  { id: 6, name: 'Analola',     age: 24, isLive: true,  img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', msg: 'Ready for fun 💋' },
];
const ABOUT_CARDS = (a: any) => [
  { icon: '🎂', label: 'Age',       value: a?.age ? `${a.age} ans` : 'Non renseigné' },
  { icon: '🌍', label: 'Country',   value: a?.country || 'Non renseigné' },
  { icon: '📏', label: 'Height',    value: a?.height || 'Non renseigné' },
  { icon: '👙', label: 'Body Type', value: a?.bodyType || 'Non renseigné' },
  { icon: '✂️', label: 'Hair',      value: a?.hairColor || 'Non renseigné' },
  { icon: '👁️', label: 'Eye Color', value: a?.eyeColor || 'Non renseigné' },
  { icon: '🎨', label: 'Tattoos',   value: a?.tattoos || 'Non renseigné' },
];

// ─── Media Viewer Modal ───────────────────────────────────────────────────────

interface MediaViewerModalProps {
  items: any[];
  initialIndex: number;
  onClose: () => void;
}

function MediaViewerModal({ items, initialIndex, onClose }: MediaViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const item = items[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < items.length - 1) setCurrentIndex(currentIndex + 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, items.length, onClose]);

  if (!item) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < items.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const libItem = item.mediaItem || item;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col backdrop-blur-sm" onClick={onClose}>
      {/* Header bars */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent relative z-10" onClick={e => e.stopPropagation()}>
        <div className="text-white">
          <p className="font-semibold text-sm md:text-base">{libItem?.filename || 'Fichier sans nom'}</p>
          <p className="text-xs text-white/60 mt-0.5">{currentIndex + 1} / {items.length}</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Fermer (Échap)">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center min-h-0 overflow-hidden" onClick={e => e.stopPropagation()}>
        {currentIndex > 0 && (
          <button onClick={handlePrev} className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10 backdrop-blur-md">
            <ChevronLeft size={28} />
          </button>
        )}
        
        <div className="max-w-full max-h-full p-4 flex items-center justify-center w-full h-full relative group">
          {libItem?.type === 'video' ? (
            <video src={libItem?.url} controls autoPlay className="max-w-full max-h-full object-contain rounded-lg shadow-2xl h-[85vh]" />
          ) : (
             <img src={libItem?.url} alt="" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl h-[85vh]" />
          )}
        </div>

        {currentIndex < items.length - 1 && (
          <button onClick={handleNext} className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10 backdrop-blur-md">
            <ChevronRight size={28} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Composant ──────────────────────────────────────────────────────────────
export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate      = useNavigate();
  const { openChat, activeChatId } = useOutletContext<OutletContext>();

  const [activeTab, setActiveTab] = useState<ProfileTab | 'galleries'>('details');
  const [message,   setMessage]   = useState('');
  const [favorite,  setFavorite]  = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<any>(null);
  
  // Real creator data state
  const [creatorData, setCreatorData] = useState<any>(null);
  const [creatorPosts, setCreatorPosts] = useState<any[]>([]);
  const [creatorGalleries, setCreatorGalleries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Viewer state
  const [viewingItems, setViewingItems] = useState<any[] | null>(null);
  const [viewingIndex, setViewingIndex] = useState<number>(0);

  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async () => {
    if (!creatorData) return;
    if (!confirm(`S'abonner au profil de ${creatorData.displayName} pour ${creatorData.subscriptionPrice || 0}🪙/mois ?`)) return;
    
    setIsSubscribing(true);
    try {
      const { default: api } = await import('../services/api');
      await api.post(`/api/client/creators/${creatorData.id}/subscribe`);
      setIsSubscribed(true);
      alert('Abonnement validé !');
    } catch (error: any) {
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert("Erreur lors de l'abonnement.");
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { default: api } = await import('../services/api');
        const [profileRes, postsRes, galleriesRes] = await Promise.all([
           api.get(`/api/client/creators/${username}`),
           api.get(`/api/client/creators/${username}/posts`),
           api.get(`/api/client/creators/${username}/galleries`)
        ]);
        setCreatorData(profileRes.data.creator);
        setCreatorPosts(postsRes.data.posts || []);
        setCreatorGalleries(galleriesRes.data.galleries || []);
        setIsSubscribed(profileRes.data.isSubscribed);
      } catch (err) {
        console.error("Erreur lors de la récupération du créateur", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (username) fetchData();
  }, [username]);

  const allMediaItems = [...creatorPosts, ...creatorGalleries].flatMap(item => {
    // Collect from posts
    if (item.mediaItems) return item.mediaItems.map((link: any) => link.mediaItem || link);
    // Collect from galleries
    if (item.items) return item.items.map((i: any) => i.mediaItem || i);
    return [];
  });
  
  const galleriesCount = creatorGalleries.length;
  const pictureCount = allMediaItems.length;

  const tabs: { id: ProfileTab | 'galleries'; label: string }[] = [
    { id: 'details',  label: 'Details' },
    { id: 'galleries', label: `Galeries (${galleriesCount})` },
    { id: 'pictures', label: `Médias libres (${pictureCount})` },
    { id: 'game',     label: 'Game' },
    { id: 'friends',  label: 'Friends' },
  ];

  const actionBtns = [
    { 
      icon: <MessageCircle size={17} />, 
      label: `Chat with ${creatorData?.displayName?.split(' ')[0] || 'Creator'}`, 
      action: () => {
        if (creatorData?.id) {
          openChat(creatorData.id);
        } else {
          alert("Erreur: Créateur non trouvé.");
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

  if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
             <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p className="text-gray-500 font-medium">Chargement du profil...</p>
          </div>
        </div>
      );
  }

  if (!creatorData) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-4">
             <p className="text-gray-500 font-medium text-lg">Créateur introuvable 😕</p>
             <button onClick={() => navigate(-1)} className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition">Retour</button>
        </div>
      );
  }

  return (
    <div className="-mx-8 min-h-screen bg-gray-100">

      {/* ── Desktop Banner ── */}
      <div className="hidden md:flex h-64 md:h-80 w-full relative bg-gray-200 items-center justify-center">
        {creatorData?.bannerUrl ? (
          <img src={creatorData.bannerUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <ImageOff size={48} className="mb-2 opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all">
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* ── Desktop Profile Header ── */}
      <div className="hidden md:block px-4 md:px-8 pb-6 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-16 md:-mt-20 z-10 relative">
          <div className="flex items-end gap-4">
            <div className="relative">
              {creatorData?.avatarUrl ? (
                <img src={creatorData.avatarUrl} alt={creatorData?.displayName || creatorData?.username} className="w-40 h-40 rounded-2xl object-cover border-4 border-gray-900 shadow-2xl relative z-10 bg-white" />
              ) : (
                <div className="w-40 h-40 rounded-2xl border-4 border-gray-900 shadow-2xl relative z-10 bg-gray-100 flex items-center justify-center">
                  <User size={48} className="text-gray-400 opacity-50" />
                </div>
              )}
            </div>
            
            <div className="pb-2">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {creatorData?.displayName || creatorData?.username}
                {creatorData?.isVerified && <CheckCircle2 size={24} className="text-blue-500" />}
              </h1>
              <p className="text-gray-500 font-medium">@{creatorData?.username}</p>
            </div>
          </div>
          
          {creatorData?.isSubscriptionEnabled && (
            <div className="flex items-center mt-4 md:mt-0 pb-2">
              <button 
                onClick={handleSubscribe}
                disabled={isSubscribing || isSubscribed}
                className={`py-3 px-8 rounded-full font-bold shadow-lg transition-transform flex items-center justify-center gap-2 w-full md:w-auto ${
                  isSubscribed 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-pink-500 hover:-translate-y-1 hover:shadow-xl text-white'
                }`}
              >
                {isSubscribing ? (
                  <Loader size={20} className="animate-spin" />
                ) : isSubscribed ? (
                  <>Abonné <CheckCircle2 size={18} /></>
                ) : (
                  <>S'abonner pour {creatorData.subscriptionPrice || 0} 🪙</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

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
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'galleries') setSelectedGallery(null);
                }}
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
              <span className="text-gray-900 font-bold text-base">{creatorData.displayName}</span>
              <span className="text-gray-300 ml-2">from Earth</span>
            </p>
          </div>

          {/* ─── Contenu selon onglet ─── */}

          {activeTab === 'details' && (
            <div className="p-4 space-y-4">
              {/* ── [3] Photo principale (Mobile) ── */}
              <div className="relative bg-black overflow-hidden shadow-sm md:hidden">
                {creatorData?.avatarUrl ? (
                  <img src={creatorData.avatarUrl} alt={creatorData.displayName} className="w-full object-cover max-h-[480px]" />
                ) : (
                  <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                    <User size={48} className="text-gray-400 opacity-50" />
                  </div>
                )}
              </div>

              {/* ── [4] Barre rating ── */}
              <div className="flex items-center gap-3 px-5 py-3 bg-white shadow text-sm">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={13} className={i <= 4 ? 'text-orange-400 fill-orange-400' : 'text-gray-300 fill-gray-300'} />
                  ))}
                  <span className="text-orange-500 font-bold ml-1">4.8</span>
                </div>
                <span className="text-gray-300">|</span>
                <button 
                  className="text-gray-400 hover:text-gray-700 hover:underline"
                  onClick={() => setActiveTab('pictures')}
                >to gallery</button>
                <span className="text-gray-200">|</span>
                <button className="text-gray-400 hover:text-gray-700 hover:underline">Comments (0)</button>
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
                    placeholder={creatorData?.isPayPerMessageEnabled ? `Your message (${creatorData.messagePrice} 🪙)` : "Your message"}
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
                  {ABOUT_CARDS(creatorData).map((c, i) => (
                    <div key={i} className="border border-gray-200 bg-gray-50 p-3 text-center shadow-sm">
                      <div className="text-xl mb-1">{c.icon}</div>
                      <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">{c.label}</p>
                      <p className="text-gray-700 text-xs font-semibold">{c.value}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    ['Gender',    'Female'],
                    ['Body type', 'Slim'],
                    ['Hair length', 'Long'],
                    ['Ethnicity', 'White / Caucasian'],
                    ['Country',   'Earth'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-gray-700 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── [7b] BIO ── */}
              <div className="bg-white shadow p-5">
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">BIO</p>
                <p className="text-sm font-semibold text-gray-700 mb-3 whitespace-pre-wrap">{creatorData.bio || "Aucune description fournie pour le moment."}</p>
              </div>
            </div>
          )}

          {activeTab === 'galleries' && (
            <div className="p-4">
              {selectedGallery ? (
                <div>
                  <button 
                    onClick={() => setSelectedGallery(null)}
                    className="mb-4 flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft size={16} className="mr-1"/> Retour aux galeries
                  </button>
                  
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedGallery.title}</h2>
                    {selectedGallery.description && <p className="text-gray-600 mb-4">{selectedGallery.description}</p>}
                    <div className="flex gap-2">
                       <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                         {selectedGallery.items?.length || 0} médias
                       </span>
                       {selectedGallery.priceCredits > 0 ? (
                         <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                           <Lock size={12}/> {selectedGallery.priceCredits} 🪙
                         </span>
                       ) : (
                         <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                           Gratuit
                         </span>
                       )}
                    </div>
                  </div>

                  {/* Verrouiller le contenu si la galerie est payante et non achetée (TODO: vérifier l'achat) */}
                  {selectedGallery.priceCredits > 0 ? (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Lock size={32} className="text-pink-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Contenu Premium</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                          Cette galerie contient {selectedGallery.items?.length || 0} médias exclusifs. Débloquez-la pour y accéder.
                        </p>
                        <button className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
                          Débloquer pour {selectedGallery.priceCredits} 🪙
                        </button>
                      </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedGallery.items && selectedGallery.items.length > 0 ? (
                        selectedGallery.items.map((item: any, i: number) => {
                          const libItem = item;
                          const isVideo = libItem?.type === 'video';
                          return (
                            <div 
                              key={i} 
                              className="relative aspect-square rounded-xl overflow-hidden group shadow-sm bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setViewingItems(selectedGallery.items);
                                setViewingIndex(i);
                              }}
                            >
                               {isVideo && !libItem?.thumbnailUrl ? (
                                <video
                                  src={libItem?.url}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  muted playsInline autoPlay loop
                                />
                              ) : (
                                <img
                                  src={libItem?.thumbnailUrl || libItem?.url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              )}
                              {isVideo && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors pointer-events-none">
                                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg text-blue-600">
                                    <span className="ml-1 font-bold text-xl">▶</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full py-12 text-center text-gray-400">
                          <Camera size={48} className="mx-auto mb-4 opacity-50" />
                          <p>Aucun média dans cette galerie.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {creatorGalleries.length > 0 ? (
                    creatorGalleries.map((gallery: any) => {
                      // Fetch first available thumbnail for cover fallback
                      const firstMedia = gallery.items && gallery.items.length > 0 ? gallery.items[0] : null;
                      const fallbackCover = firstMedia ? (firstMedia.thumbnailUrl || firstMedia.url) : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80';

                      return (
                      <div 
                        key={gallery.id} 
                        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer"
                        onClick={() => setSelectedGallery(gallery)}
                      >
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                           {firstMedia?.type === 'video' && !firstMedia?.thumbnailUrl && !gallery.coverUrl ? (
                              <video
                                src={fallbackCover}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                muted playsInline autoPlay loop
                              />
                           ) : (
                            <img 
                              src={gallery.coverUrl || fallbackCover} 
                              alt={gallery.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                           )}
                          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            {gallery.priceCredits > 0 ? <><Lock size={12} /> {gallery.priceCredits}🪙</> : 'Gratuit'}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{gallery.title}</h3>
                          <p className="text-gray-500 text-sm line-clamp-2 mb-3">{gallery.description}</p>
                          <div className="flex items-center text-xs text-gray-400">
                            <Camera size={14} className="mr-1" />
                            <span>{gallery.items?.length || gallery._count?.items || 0} médias</span>
                          </div>
                        </div>
                      </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-12 text-center text-gray-400">
                      <p>Aucune galerie disponible.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pictures' && (
            <div className="p-4 grid grid-cols-3 gap-1">
              {allMediaItems.filter(item => {
                 const libItem = item.mediaItem || item;
                 return libItem?.visibility === 'free';
              }).map((item, i, filteredItems) => {
                const libItem = item.mediaItem || item;
                const isVideo = libItem?.type === 'video';
                return (
                  <div 
                    key={i} 
                    className="aspect-square bg-gray-100 relative group cursor-pointer"
                    onClick={() => {
                      setViewingItems(filteredItems);
                      setViewingIndex(i);
                    }}
                  >
                    {isVideo && !libItem?.thumbnailUrl ? (
                      <video
                        src={libItem?.url}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        muted playsInline autoPlay loop
                      />
                    ) : (
                      <img
                        src={libItem?.thumbnailUrl || libItem?.url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors pointer-events-none">
                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg text-blue-600">
                          <span className="ml-1 font-bold text-xl">▶</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {allMediaItems.filter(item => {
                const libItem = item.mediaItem || item;
                return libItem?.visibility === 'free';
              }).length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400">
                  <Camera size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Aucun média libre disponible.</p>
                </div>
              )}
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

      {/* ── Modal d'affichage de photo/vidéo pleine taille ── */}
      {viewingItems && (
        <MediaViewerModal
          items={viewingItems}
          initialIndex={viewingIndex}
          onClose={() => setViewingItems(null)}
        />
      )}

    </div>
  );
};
