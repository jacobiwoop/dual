import React, { useState } from 'react';
import { WITHDRAWALS } from '../lib/mockData';
import { Check, X, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { StatusBadge } from '../components/shared/StatusBadge';

export default function Withdrawals() {
  const [activeTab, setActiveTab] = useState('En attente');

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {['En attente (2)', 'En cours', 'Complétés', 'Refusés'].map((tab) => (
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

      {/* Withdrawals Queue */}
      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Créateur</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Demandé le</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Montant Brut</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Commission</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Net à virer</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">IBAN</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {WITHDRAWALS.map((w) => (
                <tr key={w.id} className={clsx(
                  "hover:bg-gray-50/50 transition-colors",
                  w.status === 'En attente' && "bg-yellow-50/20"
                )}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img src={w.creatorAvatar} alt={w.creator} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-medium text-gray-900">{w.creator}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-400" />
                      {w.date}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 font-medium">{w.amount}</td>
                  <td className="py-4 px-6 text-red-500 text-xs font-medium">-{w.commission}</td>
                  <td className="py-4 px-6 font-bold text-green-600 text-lg">{w.net}</td>
                  <td className="py-4 px-6">
                    <div className="font-mono text-xs text-gray-600 bg-gray-100 rounded px-2 py-1 w-fit border border-gray-200">
                      {w.iban}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {w.status === 'En attente' ? (
                      <div className="flex justify-end gap-2">
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm">
                          <Check size={14} /> Valider
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 rounded-lg text-xs font-medium transition-colors">
                          <X size={14} /> Refuser
                        </button>
                      </div>
                    ) : (
                      <StatusBadge status={w.status} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settings Teaser */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-gray-900">Paramètres de retrait</h4>
          <p className="text-sm text-gray-500 mt-1">
            Seuil minimum : <span className="font-medium text-black">50 €</span> • Commission : <span className="font-medium text-black">20%</span> • Délai : <span className="font-medium text-black">2-5 jours</span>
          </p>
        </div>
        <button className="text-sm font-medium text-black hover:underline flex items-center gap-1">
          Modifier les paramètres <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
