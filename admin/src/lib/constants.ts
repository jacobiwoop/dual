import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  Image as ImageIcon, 
  CreditCard, 
  Wallet, 
  Percent, 
  Settings, 
  Activity, 
  LogOut,
  Bell,
  Search,
  Menu,
  User,
  Coins
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'VUE GLOBALE', items: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' }
  ]},
  { label: 'UTILISATEURS', items: [
    { icon: Users, label: 'Créateurs', path: '/creators', badge: 3 },
    { icon: Users, label: 'Clients', path: '/clients' }
  ]},
  { label: 'CONTENU', items: [
    { icon: ShieldAlert, label: 'Modération', path: '/moderation', badge: 7 },
    { icon: ImageIcon, label: 'Médias', path: '/media' }
  ]},
  { label: 'FINANCES', items: [
    { icon: Coins, label: 'Paiements', path: '/coin-requests', badge: 1 },
    { icon: CreditCard, label: 'Transactions', path: '/transactions' },
    { icon: Wallet, label: 'Retraits', path: '/withdrawals', badge: 2 },
    { icon: Percent, label: 'Commissions', path: '/commissions' }
  ]},
  { label: 'SYSTÈME', items: [
    { icon: Settings, label: 'Paramètres', path: '/settings' },
    { icon: Activity, label: 'Logs & Activité', path: '/logs' },
    { icon: User, label: 'Mon compte', path: '/account' }
  ]}
];

export const CURRENT_USER = {
  name: 'Sophie Martin',
  role: 'Super Admin',
  email: 'sophie@basic-instinct.com',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
};
