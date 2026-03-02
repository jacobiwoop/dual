import React, { useState } from 'react';
import { MEDIA_ITEMS } from '../lib/mockData';
import { Search, Filter, Eye, Flag, Trash2, MoreHorizontal, Play } from 'lucide-react';
import { clsx } from 'clsx';
import { StatusBadge } from '../components/shared/StatusBadge';

export default function Media() {
  const [filter, setFilter] = useState('Tous');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Médiathèque</h2>
          <p className="text-sm text-gray-500">Gestion des contenus (photos, vidéos)</p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par créateur, titre..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <div className="h-8 w-px bg-gray-200 mx-2 hidden xl:block"></div>
          {['Tous', 'Photos', 'Vidéos', 'Signalés'].map((f) => (
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

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MEDIA_ITEMS.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            <div className="relative aspect-[4/5] bg-gray-100">
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button className="p-3 bg-white/90 rounded-full text-black hover:scale-110 transition-transform shadow-lg">
                  {item.type === 'Vidéo' ? <Play size={24} fill="currentColor" /> : <Eye size={24} />}
                </button>
              </div>
              <div className="absolute top-3 right-3">
                <StatusBadge status={item.status} className="shadow-sm" />
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-medium rounded-lg">
                  {item.type}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-gray-500">par <span className="font-medium text-gray-700">{item.creator}</span></p>
                </div>
                <button className="text-gray-400 hover:text-black">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  <span className="block font-bold text-gray-900 text-sm">{item.revenue}</span>
                  Revenus
                </div>
                <div className="text-xs text-gray-500 text-right">
                  <span className="block font-bold text-gray-900 text-sm">{item.sales}</span>
                  Ventes
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button className="flex items-center justify-center gap-1 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-600 transition-colors">
                  <Flag size={14} /> Signaler
                </button>
                <button className="flex items-center justify-center gap-1 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-medium text-red-600 transition-colors">
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
