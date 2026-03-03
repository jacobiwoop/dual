import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Eye } from 'lucide-react';
import api from '../services/api';

const TAGS = ['All', 'Verified', 'New'];

interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  subscriptionPrice: number;
  isVerified: boolean;
  subscribersCount: number;
  postsCount: number;
}

export const ExplorePage = () => {
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState('All');
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/client/creators');
        setCreators(res.data.creators);
      } catch (error) {
        console.error('Erreur lors du chargement des créateurs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, []);

  const filteredCreators = creators.filter(c => {
    if (activeTag === 'All') return true;
    if (activeTag === 'Verified') return c.isVerified;
    return true;
  });

  return (
    <div className="-mx-8 min-h-screen bg-gray-100 p-8 pt-6">
      <div className="max-w-6xl mx-auto">
        
        {/* En-tête de page */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Explore</h1>
          <p className="text-gray-500 text-sm">Découvrez de nouveaux profils et connectez-vous avec vos créateurs favoris.</p>
        </div>

        {/* Barre de filtres (tags) */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                activeTag === tag
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <>
            {/* Grille de résultats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredCreators.map(creator => (
                <div 
                  key={creator.id} 
                  onClick={() => navigate(`/profile/${creator.username}`)}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 group cursor-pointer hover:shadow-md transition-shadow relative"
                >
                  {/* Image */}
                  <div className="aspect-[3/4] overflow-hidden relative bg-black">
                    <img 
                      src={creator.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'} 
                      alt={creator.displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    
                    {/* Badge Verifié */}
                    {creator.isVerified && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        ✓ VERIFIED
                      </div>
                    )}
                    
                    {/* Overlay Hover (Icon) */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="text-white" size={32} />
                    </div>
                  </div>

                  {/* Infos Profil */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{creator.displayName}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span>@{creator.username}</span>
                    </div>
                    <div className="flex items-center mt-2 gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Camera size={12} /> {creator.postsCount}</span>
                      <span>❤️ {creator.subscribersCount} abonnés</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCreators.length === 0 && (
              <div className="text-center py-20 text-gray-500 border border-dashed border-gray-300 rounded-xl bg-white mt-4">
                Aucun profil ne correspond à ce filtre.
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
