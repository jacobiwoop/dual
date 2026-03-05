import { useState, useEffect } from 'react';
import { Heart, MessageCircle, BadgeCheck } from 'lucide-react';
import api from '../services/api';

interface FeedProps {
  onOpenChat: (id: string | number) => void;
  isChatActive: boolean;
  onClickCard?: (username: string) => void;
}

// Images fallback avec des ratios variés — h-auto laisse chaque image garder
// sa hauteur naturelle, créant le vrai effet masonry désorganisé
const FALLBACKS = [
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&h=600&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=500&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=560&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=460&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&h=640&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=420&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=520&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=480&q=80',
  'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=400&h=600&q=80',
  'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=400&h=440&q=80',
];

export const Feed = ({ onOpenChat, isChatActive, onClickCard }: FeedProps) => {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await api.get('/api/client/feed');
        setCreators(res.data.creators || []);
      } catch (err) {
        console.error('Error fetching feed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Feed</h2>
        <div className="flex gap-6 text-sm font-medium">
          <button className="text-black relative">
            Latest
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full"></span>
          </button>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">Popular</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E1306C]"></div>
        </div>
      ) : creators.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border border-dashed border-gray-300 rounded-xl bg-white mt-4">
          Aucun créateur disponible pour le moment.
        </div>
      ) : (
        <div className={`columns-2 gap-2 md:gap-6 space-y-2 md:space-y-6 ${isChatActive ? 'xl:columns-2' : 'xl:columns-3'}`}>
          {creators.map((creator, index) => {
            const imageUrl = creator.avatarUrl || FALLBACKS[index % FALLBACKS.length];
            // Pour l'esthétique du screenshot : alternates icons
            const hasVideo = index % 3 === 0;
            const hasStar = index % 2 === 0;
            const isOnline = index % 4 !== 0; // Simulation status online

            return (
              <div key={creator.id} className="break-inside-avoid group cursor-pointer">
                <div
                  className="relative rounded-[2.5rem] overflow-hidden mb-3 cursor-pointer"
                  onClick={() => onClickCard?.(creator.username)}
                >
                  <img
                    src={imageUrl}
                    alt={creator.displayName}
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACKS[index % FALLBACKS.length]; }}
                  />

                  {/* Icones décoratives du screenshot */}
                  {hasStar && (
                    <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm p-1.5 rounded-full">
                      <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px]">★</span>
                      </div>
                    </div>
                  )}

                  {hasVideo && (
                    <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm p-1.5 rounded-full">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M23 7l-7 5 7 5V7zM1 17h14V7H1v10z"/></svg>
                      </div>
                    </div>
                  )}

                  {/* Badge Vérifié (Lucide) */}
                  {creator.isVerified && !hasVideo && (
                    <div className="absolute top-4 right-4 bg-blue-500 p-1.5 rounded-full shadow-lg">
                      <BadgeCheck size={14} className="text-white fill-white" />
                    </div>
                  )}

                  {/* Description Overlay au hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col justify-end">
                    <p className="text-white text-xs font-medium line-clamp-2 mb-1 opacity-90">
                      {creator.bio || "Available for chat"}
                    </p>
                    <div className="h-1 w-8 bg-pink-500 rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span
                      className="text-[13px] font-bold text-gray-800 cursor-pointer hover:underline"
                      onClick={() => onClickCard?.(creator.username)}
                    >{creator.username}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-400 text-[12px] font-semibold">
                    <div className="flex items-center gap-1">
                      <Heart size={14} className="text-red-500" fill="#ef4444" />
                      <span>{creator.subscribersCount > 999 ? (creator.subscribersCount/1000).toFixed(1)+'k' : creator.subscribersCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      <span>{creator.postsCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

};
