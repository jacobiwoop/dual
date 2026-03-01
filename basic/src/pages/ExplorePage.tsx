import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Eye } from 'lucide-react';

// ─── Mock Data ─────────────────────────────────────────────────────────────
const TAGS = ['All', 'New', 'Live', 'Blonde', 'Brunette', 'Tattoos', 'Curvy', 'Petite', 'France', 'USA'];

const CREATORS = [
  { id: 1,  username: 'luna_star', name: 'Luna Star', age: 24, country: 'France', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', isLive: true, tags: ['Blonde', 'France'] },
  { id: 2,  username: 'anna_belle', name: 'Anna Belle', age: 22, country: 'USA', img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80', isLive: false, tags: ['Brunette', 'USA'] },
  { id: 3,  username: 'hot_alissa', name: 'Alissa', age: 27, country: 'UK', img: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=400&q=80', isLive: true, tags: ['Tattoos', 'Brunette'] },
  { id: 4,  username: 'jessica_s', name: 'Jessica', age: 21, country: 'Canada', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', isLive: false, tags: ['Blonde', 'New'] },
  { id: 5,  username: 'emily_dream', name: 'Emily', age: 25, country: 'France', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', isLive: true, tags: ['Brunette', 'France', 'Petite'] },
  { id: 6,  username: 'wet_wonder', name: 'Wonder', age: 29, country: 'Brazil', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', isLive: false, tags: ['Curvy'] },
  { id: 7,  username: 'sophia_l', name: 'Sophia', age: 23, country: 'Italy', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', isLive: true, tags: ['Brunette'] },
  { id: 8,  username: 'analola', name: 'Ana', age: 26, country: 'Spain', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80', isLive: false, tags: ['Tattoos', 'Petite'] },
  { id: 9,  username: 'sarah_rose', name: 'Sarah', age: 20, country: 'USA', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80', isLive: true, tags: ['Blonde', 'New', 'USA'] },
  { id: 10, username: 'charlotte_xx', name: 'Charlotte', age: 28, country: 'France', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80', isLive: true, tags: ['Curvy', 'France'] },
];

export const ExplorePage = () => {
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState('All');

  const filteredCreators = CREATORS.filter(c => {
    if (activeTag === 'All') return true;
    if (activeTag === 'Live') return c.isLive;
    return c.tags.includes(activeTag);
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

        {/* Grille de résultats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCreators.map(creator => (
            <div 
              key={creator.id} 
              onClick={() => navigate(`/profile/${creator.username}`)}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 group cursor-pointer hover:shadow-md transition-shadow relative"
            >
              {/* Image */}
              <div className="aspect-[3/4] overflow-hidden relative">
                <img 
                  src={creator.img} 
                  alt={creator.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badge Live */}
                {creator.isLive && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    LIVE
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
                  <h3 className="font-bold text-gray-900 text-sm truncate">{creator.name}</h3>
                  <span className="text-xs font-semibold text-gray-500">{creator.age}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={10} />
                  <span>{creator.country}</span>
                  {creator.tags.length > 0 && <span className="ml-auto truncate">{creator.tags[0]}</span>}
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

      </div>
    </div>
  );
};
