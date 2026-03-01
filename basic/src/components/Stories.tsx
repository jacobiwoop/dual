import { ChevronRight, Video } from 'lucide-react';

const cams = [
  { id: 1, name: 'luna_star',    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', viewers: 342 },
  { id: 2, name: 'anna_belle',   img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=100&q=80', viewers: 218 },
  { id: 3, name: 'hot_alissa',   img: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=100&q=80', viewers: 591 },
  { id: 4, name: 'jessica_s',    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', viewers: 130 },
  { id: 5, name: 'emily_dream',  img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', viewers: 477 },
  { id: 6, name: 'wet_wonder',   img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80', viewers: 89  },
  { id: 7, name: 'sophia_l',     img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&q=80', viewers: 263 },
  { id: 8, name: 'analola',      img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=100&q=80', viewers: 415 },
  { id: 9, name: 'sarah_rose',   img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', viewers: 172 },
];

export const Stories = ({ onClickStory }: { onClickStory?: (id: string | number) => void }) => {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
          <h2 className="text-lg font-bold text-gray-900">Webcams en direct</h2>
        </div>
        <button className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          Voir tout <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {cams.map((cam) => (
          <div
            key={cam.id}
            className="flex flex-col items-center gap-1.5 min-w-[72px] cursor-pointer group"
            onClick={() => onClickStory?.(cam.id)}
          >
            {/* Avatar avec bordure rouge live */}
            <div className="relative w-16 h-16">
              <div className="w-full h-full rounded-full p-[2.5px] bg-red-500 group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                  <img
                    src={cam.img}
                    alt={cam.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Icône caméra */}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white rounded-full p-0.5">
                <Video size={9} />
              </span>
            </div>

            {/* Nom */}
            <span className="text-[11px] font-medium text-gray-700 truncate w-full text-center">{cam.name}</span>

            {/* Viewers */}
            <span className="text-[10px] text-gray-400">{cam.viewers} 👁</span>
          </div>
        ))}
      </div>
    </div>
  );
};
