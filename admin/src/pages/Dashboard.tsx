import React from 'react';
import { DASHBOARD_STATS, REVENUE_DATA, REVENUE_DISTRIBUTION, INSCRIPTIONS_DATA, RECENT_TRANSACTIONS, TOP_CREATORS_MONTH } from '../lib/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Server } from 'lucide-react';
import { StatCard } from '../components/shared/StatCard';
import { AlertBanner } from '../components/shared/AlertBanner';
import { StatusBadge } from '../components/shared/StatusBadge';
import { clsx } from 'clsx';

export default function Dashboard() {
  const alerts = [
    { type: 'critical' as const, message: '2 signalements urgents (mineur suspecté)', link: '/moderation' },
    { type: 'warning' as const, message: '3 retraits en attente depuis > 48h', link: '/withdrawals' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Alert Banner */}
      <AlertBanner alerts={alerts} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DASHBOARD_STATS.map((stat, idx) => (
          <StatCard 
            key={idx}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend as 'up' | 'down' | 'neutral'}
            type={stat.type as 'currency' | 'number' | 'text' | 'alert'}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Revenus 30 jours</h3>
              <p className="text-sm text-gray-500">Brut vs Commissions</p>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['7j', '30j', '90j'].map((period) => (
                <button 
                  key={period}
                  className={clsx(
                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                    period === '30j' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value) => `${value/1000}k€`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value} €`, '']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenus Bruts" />
                <Area type="monotone" dataKey="commission" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Commissions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Distribution */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Répartition</h3>
          <div className="h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={REVENUE_DISTRIBUTION}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {REVENUE_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-xl font-bold text-gray-900">95k€</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            {REVENUE_DISTRIBUTION.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value.toLocaleString()} €</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inscriptions Chart */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Inscriptions (30 jours)</h3>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={INSCRIPTIONS_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} minTickGap={30} />
              <Tooltip 
                cursor={{ fill: '#F3F4F6', radius: 4 }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="creators" name="Créateurs" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={8} />
              <Bar dataKey="clients" name="Clients" fill="#e5e7eb" radius={[4, 4, 0, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Creators */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Top Créateurs</h3>
            <button className="text-xs font-medium text-gray-500 hover:text-black">Voir tout</button>
          </div>
          <div className="space-y-4">
            {TOP_CREATORS_MONTH.map((creator) => (
              <div key={creator.rank} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">#{creator.rank}</span>
                  <img src={creator.avatar} alt={creator.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{creator.name}</p>
                    <p className="text-xs text-gray-500">{creator.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{creator.revenue}</p>
                  <p className="text-[10px] text-green-600">Com. {creator.commission}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Feed */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Dernières transactions</h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
          <div className="space-y-4">
            {RECENT_TRANSACTIONS.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    tx.type === 'Abonnement' ? "bg-violet-100 text-violet-700" :
                    tx.type === 'Tip' ? "bg-emerald-100 text-emerald-700" :
                    tx.type === 'Média' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                  )}>
                    {tx.type[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.amount}</p>
                    <p className="text-xs text-gray-500">{tx.creator} • {tx.time}</p>
                  </div>
                </div>
                <StatusBadge status={tx.status === 'completed' ? 'Complétée' : tx.status === 'pending' ? 'En attente' : 'Échouée'} className="scale-75 origin-right" />
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gray-900 p-6 rounded-[2rem] shadow-sm text-white flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Server size={20} /> État du système
            </h3>
            <div className="space-y-4">
              {[
                { name: 'API Gateway', status: 'operational' },
                { name: 'Paiements (Stripe)', status: 'operational' },
                { name: 'CDN (R2)', status: 'operational' },
                { name: 'Base de données', status: 'operational' },
                { name: 'Redis Cache', status: 'degraded' },
              ].map((service) => (
                <div key={service.name} className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      "w-2 h-2 rounded-full",
                      service.status === 'operational' ? "bg-green-500" : 
                      service.status === 'degraded' ? "bg-orange-500" : "bg-red-500"
                    )}></span>
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      {service.status === 'operational' ? 'OK' : service.status === 'degraded' ? 'Lent' : 'Panne'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-gray-500">Dernière mise à jour: il y a 30s</p>
          </div>
        </div>
      </div>
    </div>
  );
}
