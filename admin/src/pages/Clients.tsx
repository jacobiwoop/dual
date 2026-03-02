import React, { useState } from 'react';
import { CLIENTS } from '../lib/mockData';
import { Search, Filter, MoreHorizontal, Mail, Ban, ArrowUpDown } from 'lucide-react';
import { StatusBadge } from '../components/shared/StatusBadge';
import { clsx } from 'clsx';

export default function Clients() {
  const [filter, setFilter] = useState('Tous');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Gestion des clients</h2>
          <p className="text-sm text-gray-500">Vue d'ensemble des utilisateurs payants</p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher un client..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <div className="h-8 w-px bg-gray-200 mx-2 hidden xl:block"></div>
          {['Tous', 'Actif', 'Inactif', 'Suspendu'].map((f) => (
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
            <Filter size={16} /> Filtres avancés
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-black">
                  <div className="flex items-center gap-1">Client <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-black">
                  <div className="flex items-center gap-1">Dépensé <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Abonnements</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dernière activité</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscription</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {CLIENTS.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">{client.spent}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{client.subscriptions} actifs</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{client.lastActive}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{client.joined}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition-colors" title="Contacter">
                        <Mail size={18} />
                      </button>
                      <button className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-500 transition-colors" title="Suspendre">
                        <Ban size={18} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Mock */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <span>Affichage de 1 à 5 sur 1,240 clients</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Précédent</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
}
