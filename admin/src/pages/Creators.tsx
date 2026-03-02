import React, { useState } from 'react';
import { CREATORS } from '../lib/mockData';
import { Search, Filter, MoreHorizontal, CheckCircle, XCircle, Eye, Mail, UserPlus, ArrowUpDown } from 'lucide-react';
import { StatusBadge } from '../components/shared/StatusBadge';
import { clsx } from 'clsx';

export default function Creators() {
  const [filter, setFilter] = useState('Tous');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Gestion des créateurs</h2>
          <p className="text-sm text-gray-500">3 en attente de vérification KYC <span className="inline-block w-2 h-2 rounded-full bg-red-500 ml-1"></span></p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
          <UserPlus size={16} /> Inviter un créateur
        </button>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, username, email..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <div className="h-8 w-px bg-gray-200 mx-2 hidden xl:block"></div>
          {['Tous', 'Actif', 'En vérification', 'Suspendu', 'Banni'].map((f) => (
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
            <Filter size={16} /> Plus de filtres
          </button>
        </div>
      </div>

      {/* Creators Table */}
      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-black">
                  <div className="flex items-center gap-1">Créateur <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-black">
                  <div className="flex items-center gap-1">Inscription <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-black">
                  <div className="flex items-center gap-1">Revenus <ArrowUpDown size={12} /></div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission BI</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Abonnés</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {CREATORS.map((creator) => (
                <tr key={creator.id} className={clsx(
                  "hover:bg-gray-50/50 transition-colors",
                  creator.status === 'En vérification' && "bg-yellow-50/30",
                  (creator.status === 'Suspendu' || creator.status === 'Banni') && "bg-red-50/30"
                )}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img src={creator.avatar} alt={creator.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{creator.name}</p>
                        <p className="text-xs text-gray-500">{creator.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={creator.status} />
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">{creator.joined}</td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">{creator.revenue}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{(parseInt(creator.revenue.replace(/\D/g, '')) * 0.2).toLocaleString()} €</td>
                  <td className="py-4 px-6 text-sm text-gray-600 font-medium">{creator.subscribers}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition-colors" title="Voir profil">
                        <Eye size={18} />
                      </button>
                      {creator.status === 'En vérification' ? (
                        <button className="p-2 bg-green-50 hover:bg-green-100 rounded-lg text-green-600 transition-colors" title="Valider KYC">
                          <CheckCircle size={18} />
                        </button>
                      ) : (
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition-colors" title="Envoyer email">
                          <Mail size={18} />
                        </button>
                      )}
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
          <span>Affichage de 1 à 5 sur 145 créateurs</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Précédent</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
}
