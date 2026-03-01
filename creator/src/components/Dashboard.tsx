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

const data = [
  { name: 'Lun', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Mar', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Mer', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Jeu', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Ven', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Sam', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Dim', uv: 3490, pv: 4300, amt: 2100 },
];

export function Dashboard() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-500">Bienvenue, voici un aperçu de vos performances.</p>
        </div>
        <div className="flex gap-4">
          <select className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20">
            <option>Cette semaine</option>
            <option>Ce mois</option>
            <option>Cette année</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Revenus Totaux', value: '56,874 €', change: '+12%', icon: DollarSign, color: 'bg-emerald-500' },
          { label: 'Nouveaux Abonnés', value: '1,234', change: '+5%', icon: Users, color: 'bg-blue-500' },
          { label: 'Ventes Médias', value: '24,575 €', change: '+18%', icon: CreditCard, color: 'bg-purple-500' },
          { label: 'Taux d\'Engagement', value: '8.4%', change: '-2%', icon: Activity, color: 'bg-orange-500' },
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="pv" stroke="#8B5CF6" strokeWidth={3} dot={{r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="uv" stroke="#10B981" strokeWidth={3} dot={{r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff'}} />
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
