import { format, subMinutes, subHours, subDays } from 'date-fns';

// --- Types ---

export type User = {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  subscriptionTier: 'Free' | 'Normal' | 'Plus' | 'VIP';
  totalSpent: number;
  joinDate: Date;
  lastActive: Date;
  notes?: string;
};

export type Message = {
  id: string;
  senderId: string; // 'me' or userId
  text: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'gift' | 'tip';
  mediaUrl?: string;
  amount?: number;
};

export type Conversation = {
  userId: string;
  user: User;
  messages: Message[];
  unreadCount: number;
  lastMessage: Message;
};

export type Request = {
  id: string;
  userId: string;
  user: User;
  type: string;
  description: string;
  price: number;
  status: 'pending' | 'accepted' | 'refused';
  timestamp: Date;
};

export type MediaItem = {
  id: string;
  url: string;
  type: 'image' | 'video';
  price: number; // 0 = free
  visibility: 'free' | 'subscribers' | 'paid';
  galleryId?: string;
  uploadDate: Date;
};

export type Gallery = {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  price: number;
  items: MediaItem[];
  sales: number;
  totalRevenue: number;
};

export type LibraryItem = {
  id: string;
  url: string;
  type: 'image' | 'video';
  uploadDate: Date;
  folderId?: string;
};

export type LibraryFolder = {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  items: LibraryItem[];
};

// --- Mock Data ---

export const CURRENT_USER = {
  username: '@luna_star',
  displayName: 'Luna Star',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  bio: 'Bonjour à tous 🌸 Je partage mes moments...',
  welcomeMessage: "Merci de t'être abonné(e) ! 💕 Voici ce qui...",
  categories: ['Général', 'BDSM'],
  tags: ['Brunette', 'France', 'Long Hair'],
  physique: {
    height: '165cm',
    hairColor: 'Brune',
    eyeColor: 'Verts',
    bodyType: 'Mince',
    tattoos: 'Non',
  },
  balance: 56874, // From image
};

const USERS: User[] = [
  {
    id: 'u1',
    username: 'MaxV',
    displayName: 'MaxV',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    isOnline: true,
    subscriptionTier: 'Plus',
    totalSpent: 1200,
    joinDate: subDays(new Date(), 90),
    lastActive: subMinutes(new Date(), 2),
    notes: 'Aime les vidéos personnalisées.',
  },
  {
    id: 'u2',
    username: 'alex_94',
    displayName: 'Alex',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    isOnline: false,
    subscriptionTier: 'Normal',
    totalSpent: 450,
    joinDate: subDays(new Date(), 30),
    lastActive: subHours(new Date(), 5),
  },
  {
    id: 'u3',
    username: 'Sophie_K',
    displayName: 'Sophie',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    isOnline: true,
    subscriptionTier: 'VIP',
    totalSpent: 3500,
    joinDate: subDays(new Date(), 120),
    lastActive: subMinutes(new Date(), 8),
  },
];

export const CONVERSATIONS: Conversation[] = [
  {
    userId: 'u1',
    user: USERS[0],
    unreadCount: 2,
    lastMessage: {
      id: 'm1',
      senderId: 'u1',
      text: 'Salut !',
      timestamp: subMinutes(new Date(), 2),
      type: 'text',
    },
    messages: [
      {
        id: 'm0',
        senderId: 'u1',
        text: 'Bonjour ! 😍',
        timestamp: subHours(new Date(), 2),
        type: 'text',
      },
      {
        id: 'm01',
        senderId: 'me',
        text: 'Merci beaucoup ! 💕',
        timestamp: subHours(new Date(), 1.9),
        type: 'text',
      },
      {
        id: 'm1',
        senderId: 'u1',
        text: 'Salut !',
        timestamp: subMinutes(new Date(), 2),
        type: 'text',
      },
    ],
  },
  {
    userId: 'u2',
    user: USERS[1],
    unreadCount: 0,
    lastMessage: {
      id: 'm2',
      senderId: 'u2',
      text: 'Coucou',
      timestamp: subMinutes(new Date(), 5),
      type: 'text',
    },
    messages: [
      {
        id: 'm2',
        senderId: 'u2',
        text: 'Coucou',
        timestamp: subMinutes(new Date(), 5),
        type: 'text',
      },
    ],
  },
  {
    userId: 'u3',
    user: USERS[2],
    unreadCount: 0,
    lastMessage: {
      id: 'm3',
      senderId: 'u3',
      text: 'Merci pour la vidéo !',
      timestamp: subMinutes(new Date(), 8),
      type: 'text',
    },
    messages: [],
  },
];

export const REQUESTS: Request[] = [
  {
    id: 'r1',
    userId: 'u1',
    user: USERS[0],
    type: '🔥 Scène hot + jouet',
    description: "J'aimerais une session de 30min ce soir",
    price: 1200,
    status: 'pending',
    timestamp: subMinutes(new Date(), 5),
  },
  {
    id: 'r2',
    userId: 'u2',
    user: USERS[1],
    type: '📞 Appel Privé 15 min',
    description: '(aucun message joint)',
    price: 400,
    status: 'pending',
    timestamp: subMinutes(new Date(), 12),
  },
  {
    id: 'r3',
    userId: 'u3',
    user: USERS[2],
    type: '📸 Photos pieds',
    description: 'Une série de 5 photos',
    price: 500,
    status: 'accepted',
    timestamp: subDays(new Date(), 1),
  },
];

export const GALLERIES: Gallery[] = [
  {
    id: 'g1',
    title: '🔥 Pack Intense',
    description: 'Soirée hot complète...',
    coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    price: 800,
    items: [],
    sales: 12,
    totalRevenue: 9600,
  },
  {
    id: 'g2',
    title: '🎭 Pack Cosplay',
    description: 'Costume de super-héroïne',
    coverUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80',
    price: 500,
    items: [],
    sales: 8,
    totalRevenue: 4000,
  },
  {
    id: 'g3',
    title: '👑 Galerie Abonnés',
    description: 'Accès abonnés Normal',
    coverUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=500&q=80',
    price: 0,
    items: [],
    sales: 0,
    totalRevenue: 0,
  },
];

export const MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'mi1',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
    type: 'image',
    price: 0,
    visibility: 'free',
    uploadDate: new Date(),
  },
  {
    id: 'mi2',
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80',
    type: 'image',
    price: 200,
    visibility: 'paid',
    uploadDate: new Date(),
  },
  {
    id: 'mi3',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80',
    type: 'image',
    price: 0,
    visibility: 'subscribers',
    uploadDate: new Date(),
  },
  {
    id: 'mi4',
    url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=500&q=80',
    type: 'image',
    price: 350,
    visibility: 'paid',
    uploadDate: new Date(),
  },
];

// --- DONNÉES DE LA BIBLIOTHÈQUE PRIVÉE (MESSAGES) ---
export const LIBRARY_FOLDERS: LibraryFolder[] = [
  {
    id: 'lf1',
    title: 'Photos Privées',
    description: 'Dossier de base pour les clients',
    coverUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80',
    items: [],
  },
  {
    id: 'lg2',
    title: 'Vidéos Personnalisées',
    description: 'Dossier vide pour demandes',
    coverUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80',
    items: [],
  },
];

export const LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: 'li1',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
    type: 'image',
    uploadDate: new Date(),
    folderId: 'lf1',
  },
  {
    id: 'li2',
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80',
    type: 'image',
    uploadDate: new Date(),
    folderId: 'lf1',
  },
  {
    id: 'li3',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80',
    type: 'image',
    uploadDate: new Date(),
  },
];
