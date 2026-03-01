import { Heart, MessageCircle, UserPlus, Star, Video } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'like',
    user: 'luna_star',
    userImg: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    content: 'has liked your comment on their post.',
    time: '2m',
    isNew: true,
  },
  {
    id: 2,
    type: 'follow',
    user: 'jessica_s',
    userImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    content: 'started following you.',
    time: '12m',
    isNew: true,
  },
  {
    id: 3,
    type: 'live',
    user: 'emily_dream',
    userImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    content: 'is explicitly LIVE right now. Join the room!',
    time: '25m',
    isNew: false,
  },
  {
    id: 4,
    type: 'message',
    user: 'anna_belle',
    userImg: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=100&q=80',
    content: 'sent you a private message: "Hey, thanks for the tip! 💕"',
    time: '4h',
    isNew: false,
  },
  {
    id: 5,
    type: 'tip',
    user: 'System',
    userImg: null,
    content: 'You received a daily reward of 50 Coins! 🪙',
    time: '1d',
    isNew: false,
  },
  {
    id: 6,
    type: 'like',
    user: 'anna_belle',
    userImg: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=100&q=80',
    content: 'liked your profile.',
    time: '2d',
    isNew: false,
  },
];

export const NotificationsPage = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'like':    return <Heart className="text-pink-500 fill-pink-500" size={16} />;
      case 'follow':  return <UserPlus className="text-blue-500" size={16} />;
      case 'live':    return <Video className="text-red-500" size={16} />;
      case 'message': return <MessageCircle className="text-green-500" size={16} />;
      case 'tip':     return <Star className="text-yellow-500 fill-yellow-500" size={16} />;
      default:        return <Heart className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className="-mx-8 min-h-screen bg-gray-100 p-8 pt-6">
      <div className="max-w-3xl mx-auto">
        
        {/* En-tête de page */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-500 text-sm">Restez à jour avec vos créateurs et votre communauté.</p>
          </div>
          <button className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
            Marquer tout comme lu
          </button>
        </div>

        {/* Liste des Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {NOTIFICATIONS.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {NOTIFICATIONS.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`flex gap-4 p-5 hover:bg-gray-50 transition-colors cursor-pointer ${notif.isNew ? 'bg-pink-50/30' : ''}`}
                >
                  {/* Avatar / Icône Système */}
                  <div className="relative flex-shrink-0">
                    {notif.userImg ? (
                      <img 
                        src={notif.userImg} 
                        alt={notif.user} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm text-xl">
                        🤖
                      </div>
                    )}
                    {/* Badge d'action */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                      {getIcon(notif.type)}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm text-gray-800 leading-snug">
                      <span className="font-bold text-gray-900 mr-1">{notif.user}</span>
                      {notif.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">{notif.time}</p>
                  </div>

                  {/* Point bleu pour isNew */}
                  {notif.isNew && (
                    <div className="flex-shrink-0 flex items-center justify-center w-3">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Vous n'avez aucune notification pour le moment.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
