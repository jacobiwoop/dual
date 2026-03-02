import React, { useState } from 'react';
import { MODERATION_QUEUE } from '../lib/mockData';
import { AlertTriangle, Eye, CheckCircle, Trash2, Ban, Filter } from 'lucide-react';
import { clsx } from 'clsx';

export default function Moderation() {
  const [activeTab, setActiveTab] = useState('En attente');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {['En attente (7)', 'En cours (2)', 'Traités', 'Ignorés'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          <Filter size={14} /> Type
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          <AlertTriangle size={14} /> Priorité
        </button>
      </div>

      {/* Queue */}
      <div className="space-y-4">
        {MODERATION_QUEUE.map((item) => (
          <div key={item.id} className={clsx(
            "bg-white rounded-2xl p-6 shadow-sm border-l-4 flex flex-col md:flex-row gap-6",
            item.priority === 'Urgent' ? "border-red-500 bg-red-50/30" :
            item.priority === 'Moyen' ? "border-orange-400 bg-orange-50/30" :
            "border-yellow-400"
          )}>
            {/* Thumbnail */}
            <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0 group cursor-pointer">
              <img src={item.thumbnail} alt="Content" className="w-full h-full object-cover blur-md group-hover:blur-none transition-all duration-300" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-colors">
                <div className="bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye size={20} />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className={clsx(
                    "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide",
                    item.priority === 'Urgent' ? "bg-red-100 text-red-700" :
                    item.priority === 'Moyen' ? "bg-orange-100 text-orange-700" :
                    "bg-yellow-100 text-yellow-700"
                  )}>
                    {item.priority}
                  </span>
                  <span className="text-sm font-mono text-gray-400">#{item.id}</span>
                  <span className="text-xs text-gray-400">• {item.date}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {item.type} signalé par {item.reporterCount} utilisateurs
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Créateur : <span className="font-medium text-black">{item.creator}</span>
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {item.reasons?.map((reason, idx) => (
                  <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md border border-red-200">
                    {reason}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 justify-center min-w-[140px]">
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors">
                <CheckCircle size={16} /> Conforme
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-sm font-medium transition-colors">
                <Trash2 size={16} /> Retirer
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-medium transition-colors">
                <Ban size={16} /> Bannir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
