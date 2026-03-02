import React, { useState } from 'react';
import { TRANSACTIONS } from '../lib/mockData';
import { Search, Filter, Download, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import { StatusBadge } from '../components/shared/StatusBadge';

export default function Transactions() {
  const [filter, setFilter] = useState('Toutes');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Historique des transactions</h2>
          <p className="text-sm text-gray-500">Suivi des paiements et commissions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <Download size={16} /> Exporter CSV
        </button>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par ID, client, créateur..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <div className="h-8 w-px bg-gray-200 mx-2 hidden xl:block"></div>
          {['Toutes', 'Abonnements', 'Tips', 'Médias'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
                filter === f ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 whitespace-nowrap">
            <Filter size={16} /> Filtres
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Créateur</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Com. (20%)</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-xs font-mono text-gray-500">{tx.id}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{tx.date}</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">{tx.client}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <img src={tx.creatorAvatar} alt={tx.creator} className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-sm text-gray-600">{tx.creator}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={clsx(
                      "px-2.5 py-0.5 rounded-lg text-xs font-medium border",
                      tx.type === 'Abonnement' ? "bg-violet-50 text-violet-700 border-violet-100" :
                      tx.type === 'Tip' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      "bg-blue-50 text-blue-700 border-blue-100"
                    )}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">{tx.amount}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{tx.commission}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={tx.status} className="scale-90 origin-left" />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Mock */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <span>Affichage de 1 à 10 sur 4,521 transactions</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Précédent</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
}
