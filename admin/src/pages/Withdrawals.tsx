import React, { useState, useEffect } from 'react';
import { Check, X, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { StatusBadge } from '../components/shared/StatusBadge';

interface Withdrawal {
  id: string;
  creatorId: string;
  amountCoins: number;
  amountEur: number;
  commissionEur: number;
  netEur: number;
  payoutMethod: string;
  payoutDetails: string;
  status: string;
  requestedAt: string;
  creator: {
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
}

export default function Withdrawals() {
  const [activeTab, setActiveTab] = useState('pending');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, [activeTab]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      // Status filter translation (pending => pending, etc.)
      // In the API, we can just fetch all or filter on frontend
      const res = await fetch(`http://localhost:3001/api/admin/withdrawals?status=${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (!confirm(`Confirmez-vous le ${action === 'approve' ? 'paiement' : 'refus'} de cette demande ?`)) return;
    
    setActionLoading(id);
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`http://localhost:3001/api/admin/withdrawals/${id}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      await fetchWithdrawals();
    } catch (error) {
      alert('Erreur: ' + error);
    } finally {
      setActionLoading(null);
    }
  };

  const TABS = [
    { id: 'pending', label: 'En attente' },
    { id: 'approved', label: 'Complétés' },
    { id: 'rejected', label: 'Refusés' },
  ];

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Withdrawals Queue */}
      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Créateur</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Pièces / Brut</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Commission</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Net à virer</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Infos de Paiement</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin inline-block mr-2" /> Chargement...
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">Aucune demande de retrait dans cette catégorie.</td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className={clsx(
                    "hover:bg-gray-50/50 transition-colors",
                    w.status === 'pending' && "bg-yellow-50/20"
                  )}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {w.creator.avatarUrl ? (
                          <img src={w.creator.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover bg-gray-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                            {(w.creator.displayName || w.creator.username || '?')[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{w.creator.displayName || w.creator.username}</p>
                          <p className="text-xs text-gray-500">@{w.creator.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-gray-400" />
                        {new Date(w.requestedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-900 font-bold text-sm">{w.amountCoins.toLocaleString()} 🪙</div>
                      <div className="text-xs text-gray-500">{w.amountEur.toFixed(2)} €</div>
                    </td>
                    <td className="py-4 px-6 text-red-500 text-xs font-medium">-{w.commissionEur.toFixed(2)} €</td>
                    <td className="py-4 px-6 font-bold text-green-600 text-lg">{w.netEur.toFixed(2)} €</td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-bold text-gray-700 mb-1">{w.payoutMethod}</div>
                      <div className="font-mono text-xs text-gray-600 bg-gray-100 rounded px-2 py-1 w-fit border border-gray-200 select-all">
                        {w.payoutDetails}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {w.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleAction(w.id, 'approve')}
                            disabled={actionLoading === w.id}
                            className="flex items-center justify-center min-w-[32px] gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
                          >
                            {actionLoading === w.id ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Valider</>}
                          </button>
                          <button 
                            onClick={() => handleAction(w.id, 'reject')}
                            disabled={actionLoading === w.id}
                            className="flex items-center justify-center min-w-[32px] gap-1 px-3 py-1.5 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading === w.id ? <Loader2 size={14} className="animate-spin" /> : <><X size={14} /> Refuser</>}
                          </button>
                        </div>
                      ) : (
                        <StatusBadge status={w.status === 'approved' ? 'Validé' : 'Refusé'} />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
