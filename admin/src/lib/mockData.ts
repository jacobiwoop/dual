import { subDays, format } from 'date-fns';

// Helpers
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Mock Dashboard Data
export const DASHBOARD_STATS = [
  { title: 'Revenus jour', value: '12,450 €', change: '+8%', trend: 'up' as const, type: 'currency' as const },
  { title: 'Inscrits jour', value: '+14', change: '+3', trend: 'up' as const, type: 'number' as const },
  { title: 'Transactions', value: '247 actives', change: 'Live', trend: 'neutral' as const, type: 'text' as const },
  { title: 'Signalements', value: '7 ouverts', change: '2 critiques', trend: 'down' as const, type: 'alert' as const },
];

export const REVENUE_DATA = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), 'dd/MM'),
  revenue: getRandomInt(5000, 15000),
  commission: getRandomInt(1000, 3000),
}));

export const REVENUE_DISTRIBUTION = [
  { name: 'Abonnements', value: 45000, color: '#8b5cf6' }, // Violet
  { name: 'Tips', value: 15000, color: '#10b981' }, // Emerald
  { name: 'Médias', value: 25000, color: '#3b82f6' }, // Blue
  { name: 'Shows', value: 10000, color: '#f97316' }, // Orange
];

export const INSCRIPTIONS_DATA = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), 'dd/MM'),
  creators: getRandomInt(0, 5),
  clients: getRandomInt(5, 20),
}));

export const RECENT_TRANSACTIONS = [
  { id: 'TX-9821', creator: 'Luna Star', client: 'David Astee', amount: '15.00 €', type: 'Abonnement', time: '2 min ago', status: 'completed' },
  { id: 'TX-9822', creator: 'Jade X', client: 'Maria Hulama', amount: '50.00 €', type: 'Tip', time: '5 min ago', status: 'completed' },
  { id: 'TX-9823', creator: 'Max Vip', client: 'Arnold Swarz', amount: '10.00 €', type: 'Média', time: '12 min ago', status: 'completed' },
  { id: 'TX-9824', creator: 'Sophie Rain', client: 'Jessica Alba', amount: '100.00 €', type: 'Show privé', time: '15 min ago', status: 'pending' },
  { id: 'TX-9825', creator: 'Luna Star', client: 'John Doe', amount: '5.00 €', type: 'Média', time: '22 min ago', status: 'failed' },
];

export const TOP_CREATORS_MONTH = [
  { rank: 1, name: 'Luna Star', username: '@luna_star', revenue: '12,500 €', commission: '2,500 €', avatar: 'https://i.pravatar.cc/150?u=8' },
  { rank: 2, name: 'Jade X', username: '@jade_x', revenue: '8,200 €', commission: '1,640 €', avatar: 'https://i.pravatar.cc/150?u=9' },
  { rank: 3, name: 'Sophie Rain', username: '@rain_sophie', revenue: '6,900 €', commission: '1,380 €', avatar: 'https://i.pravatar.cc/150?u=11' },
  { rank: 4, name: 'Max Vip', username: '@max_vip', revenue: '4,200 €', commission: '840 €', avatar: 'https://i.pravatar.cc/150?u=10' },
  { rank: 5, name: 'Alex Doe', username: '@alex_d', revenue: '3,100 €', commission: '620 €', avatar: 'https://i.pravatar.cc/150?u=12' },
];

// Mock Creators Data
export const CREATORS = [
  { id: 1, name: 'Luna Star', username: '@luna_star', status: 'En vérification', revenue: '12,500 €', subscribers: 1240, joined: '12/02/2025', avatar: 'https://i.pravatar.cc/150?u=8', email: 'luna@example.com', kycStatus: 'pending' },
  { id: 2, name: 'Jade X', username: '@jade_x', status: 'Actif', revenue: '45,200 €', subscribers: 5400, joined: '10/01/2025', avatar: 'https://i.pravatar.cc/150?u=9', email: 'jade@example.com', kycStatus: 'verified' },
  { id: 3, name: 'Max Vip', username: '@max_vip', status: 'Suspendu', revenue: '1,200 €', subscribers: 120, joined: '01/03/2025', avatar: 'https://i.pravatar.cc/150?u=10', email: 'max@example.com', kycStatus: 'verified' },
  { id: 4, name: 'Sophie Rain', username: '@rain_sophie', status: 'Actif', revenue: '8,900 €', subscribers: 890, joined: '15/02/2025', avatar: 'https://i.pravatar.cc/150?u=11', email: 'sophie@example.com', kycStatus: 'verified' },
  { id: 5, name: 'Alex Doe', username: '@alex_d', status: 'En vérification', revenue: '0 €', subscribers: 0, joined: 'Today', avatar: 'https://i.pravatar.cc/150?u=12', email: 'alex@example.com', kycStatus: 'pending' },
];

// Mock Withdrawals
export const WITHDRAWALS = [
  { id: 'W-102', creator: 'Luna Star', amount: '5,000 €', commission: '1,000 €', net: '4,000 €', iban: 'FR76***9821', date: '01/03/2025', status: 'En attente', creatorAvatar: 'https://i.pravatar.cc/150?u=8' },
  { id: 'W-103', creator: 'Jade X', amount: '1,200 €', commission: '240 €', net: '960 €', iban: 'FR76***4421', date: '01/03/2025', status: 'En attente', creatorAvatar: 'https://i.pravatar.cc/150?u=9' },
  { id: 'W-101', creator: 'Max Vip', amount: '500 €', commission: '100 €', net: '400 €', iban: 'FR76***1122', date: '28/02/2025', status: 'Validé', creatorAvatar: 'https://i.pravatar.cc/150?u=10' },
];

// Mock Clients
export const CLIENTS = [
  { id: 1, name: 'Jean Dupont', email: 'jean.d@gmail.com', spent: '1,240 €', subscriptions: 3, status: 'Actif', lastActive: '2h ago', avatar: 'https://i.pravatar.cc/150?u=20', joined: '10/01/2025' },
  { id: 2, name: 'Alice Smith', email: 'alice.s@yahoo.com', spent: '450 €', subscriptions: 1, status: 'Suspendu', lastActive: '2 days ago', avatar: 'https://i.pravatar.cc/150?u=21', joined: '15/01/2025' },
  { id: 3, name: 'Bob Martin', email: 'bob.m@outlook.com', spent: '8,900 €', subscriptions: 12, status: 'Actif', lastActive: '10min ago', avatar: 'https://i.pravatar.cc/150?u=22', joined: '20/01/2025' },
];

// Mock Moderation Queue
export const MODERATION_QUEUE = [
  { id: 4821, type: 'Vidéo', priority: 'Urgent', reporterCount: 3, creator: '@luna_star', date: '12min ago', status: 'Ouvert', thumbnail: 'https://picsum.photos/seed/mod1/200/200?blur=10', reasons: ['Contenu illégal (x2)', 'Mineur (x1)'] },
  { id: 4822, type: 'Photo', priority: 'Moyen', reporterCount: 1, creator: '@jade_x', date: '2h ago', status: 'Ouvert', thumbnail: 'https://picsum.photos/seed/mod2/200/200?blur=5', reasons: ['Contenu non consenti'] },
  { id: 4823, type: 'Profil', priority: 'Faible', reporterCount: 1, creator: '@max_vip', date: '1j ago', status: 'Ouvert', thumbnail: 'https://i.pravatar.cc/150?u=10', reasons: ['Spam'] },
];

// Mock Media
export const MEDIA_ITEMS = [
  { id: 1, type: 'Photo', title: 'Summer Vibes', thumbnail: 'https://picsum.photos/seed/media1/300/400', creator: '@luna_star', sales: 124, revenue: '1,240 €', status: 'Visible', date: '12/02/2025', reported: false },
  { id: 2, type: 'Vidéo', title: 'Workout Routine', thumbnail: 'https://picsum.photos/seed/media2/300/400', creator: '@jade_x', sales: 45, revenue: '450 €', status: 'Signalé', date: '10/02/2025', reported: true },
  { id: 3, type: 'Photo', title: 'Exclusive Shoot', thumbnail: 'https://picsum.photos/seed/media3/300/400', creator: '@sophie_rain', sales: 890, revenue: '8,900 €', status: 'Visible', date: '08/02/2025', reported: false },
  { id: 4, type: 'Vidéo', title: 'Behind the Scenes', thumbnail: 'https://picsum.photos/seed/media4/300/400', creator: '@luna_star', sales: 12, revenue: '120 €', status: 'Masqué', date: '01/02/2025', reported: false },
];

// Mock Transactions (Extended)
export const TRANSACTIONS = [
  { id: 'TX-1001', date: '01/03/2025 14:30', client: 'Jean Dupont', creator: '@luna_star', type: 'Abonnement', amount: '15.00 €', commission: '3.00 €', status: 'Complétée', clientAvatar: 'https://i.pravatar.cc/150?u=20', creatorAvatar: 'https://i.pravatar.cc/150?u=8' },
  { id: 'TX-1002', date: '01/03/2025 14:15', client: 'Bob Martin', creator: '@jade_x', type: 'Tip', amount: '50.00 €', commission: '10.00 €', status: 'Complétée', clientAvatar: 'https://i.pravatar.cc/150?u=22', creatorAvatar: 'https://i.pravatar.cc/150?u=9' },
  { id: 'TX-1003', date: '01/03/2025 13:45', client: 'Alice Smith', creator: '@max_vip', type: 'Média', amount: '10.00 €', commission: '2.00 €', status: 'Échouée', clientAvatar: 'https://i.pravatar.cc/150?u=21', creatorAvatar: 'https://i.pravatar.cc/150?u=10' },
  { id: 'TX-1004', date: '28/02/2025 18:20', client: 'Jean Dupont', creator: '@luna_star', type: 'Show privé', amount: '100.00 €', commission: '20.00 €', status: 'Remboursée', clientAvatar: 'https://i.pravatar.cc/150?u=20', creatorAvatar: 'https://i.pravatar.cc/150?u=8' },
];

// Mock Logs
export const ACTIVITY_LOGS = [
  { id: 1, time: '14:32:01', admin: 'sophie@bi.com', action: 'Bannir créateur', target: '@luna_star', details: 'Contenu illégal répété', type: 'critical' },
  { id: 2, time: '11:20:05', admin: 'marc@bi.com', action: 'Valider retrait', target: '#4821', details: '4,000€ → FR76***9821', type: 'success' },
  { id: 3, time: '10:15:33', admin: 'sophie@bi.com', action: 'Traiter signalement', target: '#304', details: 'Contenu retiré', type: 'warning' },
  { id: 4, time: '09:00:00', admin: 'Système', action: 'Backup', target: 'Database', details: 'Automatique', type: 'system' },
];
