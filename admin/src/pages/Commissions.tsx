import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COMMISSION_DATA = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
];

const PIE_DATA = [
  { name: 'Abonnements', value: 400, color: '#18181b' },
  { name: 'Tips', value: 300, color: '#F8E5B8' },
  { name: 'Médias', value: 300, color: '#D1E7DD' },
  { name: 'Shows', value: 200, color: '#DCD6F7' },
];

export default function Commissions() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Commissions Mensuelles</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COMMISSION_DATA}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" fill="#18181b" radius={[8, 8, 8, 8]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Répartition</h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {PIE_DATA.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-xs text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
