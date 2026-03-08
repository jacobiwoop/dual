import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, Activity, CreditCard } from 'lucide-react';
import { analyticsService, OverviewStats, RevenueDataPoint, SubscribersDataPoint, TopClient } from '../services/analytics';

export function Dashboard() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [subscribersData, setSubscribersData] = useState<SubscribersDataPoint[]>([]);
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger toutes les données en parallèle
      const [overviewRes, revenueRes, subscribersRes, clientsRes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getRevenueChart(period),
        analyticsService.getSubscribersChart(period),
        analyticsService.getTopClients(5),
      ]);

      setOverview(overviewRes);
      setRevenueData(revenueRes);
      setSubscribersData(subscribersRes);
      setTopClients(clientsRes);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-500">Bienvenue, voici un aperçu de vos performances.</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="7d">Cette semaine</option>
            <option value="30d">Ce mois</option>
            <option value="90d">3 mois</option>
            <option value="1y">Cette année</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Revenus Totaux', 
            value: `${overview?.totalEarned?.toLocaleString('fr-FR') || 0} 🪙`, 
            change: '+', 
            icon: DollarSign, 
            color: 'bg-emerald-500' 
          },
          { 
            label: 'Abonnés (Total)', 
            value: overview?.subscribers?.total?.toLocaleString('fr-FR') || 0, 
            change: `+${overview?.subscribers?.new7Days || 0} (7j)`, 
            icon: Users, 
            color: 'bg-blue-500' 
          },
          { 
            label: 'Revenus (30j)', 
            value: `${overview?.earningsLast30Days?.toLocaleString('fr-FR') || 0} 🪙`, 
            change: '+', 
            icon: CreditCard, 
            color: 'bg-purple-500' 
          },
          { 
            label: 'Messages', 
            value: overview?.messages?.total?.toLocaleString('fr-FR') || 0, 
            change: `${overview?.messages?.unread || 0} non lus`, 
            icon: Activity, 
            color: 'bg-orange-500' 
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.color} bg-opacity-10 text-white`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-900">Revenus & Activité</h3>
            <button className="text-sm text-purple-600 font-medium hover:text-purple-700">Voir détails</button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
              <LineChart data={revenueData.map(d => ({ 
                name: new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                revenus: d.amount 
              }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`${value.toLocaleString('fr-FR')} €`, 'Revenus']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenus" 
                  stroke="#8B5CF6" 
                  strokeWidth={3} 
                  dot={{r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff'}} 
                  activeDot={{r: 6}} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Widget */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Objectifs Mensuels</h3>
          
          <div className="space-y-8 flex-1">
            {[
              { label: 'Nouveaux Abonnés', current: 850, target: 1000, color: 'bg-blue-500' },
              { label: 'Revenus Tips', current: 4500, target: 5000, color: 'bg-purple-500' },
              { label: 'Ventes Privées', current: 1200, target: 2000, color: 'bg-orange-500' },
            ].map((goal, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">{goal.label}</span>
                  <span className="text-gray-500">{Math.round((goal.current / goal.target) * 100)}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${goal.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${(goal.current / goal.target) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-right">{goal.current} / {goal.target}</p>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20">
            Voir tous les objectifs
          </button>
        </div>
      </div>
    </div>
  );
}
