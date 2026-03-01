import { Heart, MessageCircle, Video, Star } from 'lucide-react';

const posts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=600&q=80',
    user: { name: 'thesandfurra', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', status: 'online' },
    likes: '87k',
    comments: 132,
    isVideo: false,
    height: 'h-96',
    isFavorite: true,
    description: 'Enjoying the beautiful sunset view! 🌅 #nature #vibes'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    user: { name: 'ana.byrne', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80', status: 'offline' },
    likes: '71k',
    comments: 98,
    isVideo: false,
    height: 'h-64',
    isFavorite: false,
    description: 'Urban exploration in the city 🏙️'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80',
    user: { name: 'petergonzales3', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', status: 'online' },
    likes: '49k',
    comments: 243,
    isVideo: true,
    height: 'h-80',
    isFavorite: false,
    description: 'Running through the fields 🏃‍♂️💨'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=600&q=80',
    user: { name: 'thiessandfurra', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', status: 'online' },
    likes: '87k',
    comments: 132,
    isVideo: false,
    height: 'h-64',
    isFavorite: true,
    description: 'Minimalist architecture design 🏛️'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    user: { name: 'ana.byrne', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', status: 'offline' },
    likes: '71k',
    comments: 98,
    isVideo: true,
    height: 'h-80',
    isFavorite: false,
    description: 'Fashion week highlights ✨👗'
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1483706571191-85c0c76b1947?auto=format&fit=crop&w=600&q=80',
    user: { name: 'petergonzales3', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', status: 'online' },
    likes: '49k',
    comments: 243,
    isVideo: false,
    height: 'h-72',
    isFavorite: true,
    description: 'Winter wonderland ❄️🎿'
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    user: { name: 'sarah_j', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', status: 'online' },
    likes: '12k',
    comments: 45,
    isVideo: false,
    height: 'h-64',
    isFavorite: false,
    description: 'Camera gear ready for the shoot 📸'
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    user: { name: 'emily_w', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', status: 'offline' },
    likes: '34k',
    comments: 120,
    isVideo: true,
    height: 'h-96',
    isFavorite: true,
    description: 'Portrait mode on point 👩‍🦰'
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    user: { name: 'mike_t', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80', status: 'online' },
    likes: '56k',
    comments: 89,
    isVideo: false,
    height: 'h-72',
    isFavorite: false,
    description: 'Thinking about the next adventure 🤔'
  },
  {
    id: 10,
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
    user: { name: 'lisa_m', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=100&q=80', status: 'offline' },
    likes: '23k',
    comments: 67,
    isVideo: false,
    height: 'h-80',
    isFavorite: false,
    description: 'Casual sunday vibes ☕'
  },
  {
    id: 11,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    user: { name: 'jessica_s', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', status: 'online' },
    likes: '45k',
    comments: 112,
    isVideo: true,
    height: 'h-64',
    isFavorite: true,
    description: 'Smiling through the day 😊'
  },
  {
    id: 12,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    user: { name: 'david_m', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80', status: 'offline' },
    likes: '67k',
    comments: 156,
    isVideo: false,
    height: 'h-96',
    isFavorite: false,
    description: 'Business meeting done right 💼'
  },
  {
    id: 13,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    user: { name: 'alex_r', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80', status: 'online' },
    likes: '19k',
    comments: 34,
    isVideo: false,
    height: 'h-72',
    isFavorite: true,
    description: 'Artistic shadows and lights 🌓'
  },
  {
    id: 14,
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    user: { name: 'sophia_l', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80', status: 'offline' },
    likes: '92k',
    comments: 345,
    isVideo: true,
    height: 'h-80',
    isFavorite: false,
    description: 'Just another day in paradise 🌴'
  },
  {
    id: 15,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    user: { name: 'olivia_p', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&q=80', status: 'online' },
    likes: '78k',
    comments: 210,
    isVideo: false,
    height: 'h-64',
    isFavorite: true,
    description: 'Golden hour glow ✨'
  },
  {
    id: 16,
    image: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=600&q=80',
    user: { name: 'lucas_g', avatar: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=100&q=80', status: 'offline' },
    likes: '33k',
    comments: 88,
    isVideo: false,
    height: 'h-96',
    isFavorite: false,
    description: 'Exploring the wilderness 🌲'
  },
  {
    id: 17,
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80',
    user: { name: 'emma_b', avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=100&q=80', status: 'online' },
    likes: '41k',
    comments: 99,
    isVideo: true,
    height: 'h-72',
    isFavorite: true,
    description: 'Science and technology 🔬'
  },
  {
    id: 18,
    image: 'https://images.unsplash.com/photo-1522075469751-3a3694c2dd77?auto=format&fit=crop&w=600&q=80',
    user: { name: 'daniel_k', avatar: 'https://images.unsplash.com/photo-1522075469751-3a3694c2dd77?auto=format&fit=crop&w=100&q=80', status: 'offline' },
    likes: '62k',
    comments: 145,
    isVideo: false,
    height: 'h-80',
    isFavorite: false,
    description: 'Teamwork makes the dream work 🤝'
  }
];

interface FeedProps {
  onOpenChat: (id: number) => void;
  isChatActive: boolean;
  onClickCard?: (username: string) => void;
}

export const Feed = ({ onOpenChat, isChatActive, onClickCard }: FeedProps) => {
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

      <div className={`columns-2 gap-2 md:gap-6 space-y-2 md:space-y-6 ${isChatActive ? 'xl:columns-2' : 'xl:columns-3'}`}>
        {posts.map((post) => (
          <div key={post.id} className="break-inside-avoid group cursor-pointer">
            <div
              className="relative rounded-3xl overflow-hidden mb-3 cursor-pointer"
              onClick={() => onClickCard?.(post.user.name)}
            >
              <img 
                src={post.image} 
                alt="Post" 
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
              />
              {post.isVideo && (
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full">
                  <Video size={16} className="text-white" fill="white" />
                </div>
              )}
              {post.isFavorite && (
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-full">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                </div>
              )}
              {/* Description Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gray-900/90 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center">
                <p className="text-white text-sm font-medium line-clamp-3">
                  {post.description}
                </p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none"></div>
            </div>
            
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${post.user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span
                  className="text-sm font-bold text-gray-800 cursor-pointer hover:underline"
                  onClick={() => onClickCard?.(post.user.name)}
                >{post.user.name}</span>
              </div>
              
              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <div className="flex items-center gap-1">
                  <Heart size={16} className="text-red-500" fill="#ef4444" />
                  <span>{post.likes}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onOpenChat((post.id % 7) + 1); }} 
                  className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                >
                  <MessageCircle size={16} />
                  <span>{post.comments}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
