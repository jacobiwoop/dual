import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Loader2, Coins } from 'lucide-react';
import { clsx } from 'clsx';
import { StatusBadge } from '../components/shared/StatusBadge';

interface PurchaseRequest {
  id: string;
  clientId: string;
  coinsRequested: number;
  amountPaidRaw: number;
  currency: string;
  paymentMethod: string;
  transactionId: string | null;
  proofImageUrl: string | null;
  status: string;
  createdAt: string;
  client: {
    displayName: string | null;
    username: string | null;
  };
}

export default function CoinRequests() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('http://localhost:3001/api/admin/payments/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (!confirm(`T'es sûr de vouloir ${action}r cet achat ?`)) return;
    
    setActionLoading(id);
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`http://localhost:3001/api/admin/payments/requests/${id}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: action === 'reject' ? 'Rejeté par admin' : undefined })
      });
      await fetchRequests(); // Rafraîchir la liste
    } catch (err) {
      alert('Erreur: ' + err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Coins className="text-amber-500" /> Validation des Pièces
          </h2>
          <p className="text-sm text-gray-500 mt-1">Gérez les achats de pièces de vos clients en attente de vérification.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Montant Acheté</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Méthode / Preuve</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">Aucune demande d'achat trouvée.</td>
                </tr>
              ) : requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="text-sm font-bold text-gray-900">{req.client?.displayName || req.client?.username || 'Client'}</div>
                    <div className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-bold text-amber-600">+{req.coinsRequested.toLocaleString()} 🪙</div>
                    <div className="text-xs text-gray-500 font-medium">Prix: {req.amountPaidRaw}{req.currency}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md mr-2">
                      {req.paymentMethod}
                    </span>
                    <span className="text-xs font-mono text-gray-500 break-all">{req.transactionId || 'Aucun ID'}</span>
                    {req.proofImageUrl && (
                      <a href={req.proofImageUrl} target="_blank" rel="noreferrer" className="block mt-1 text-xs text-blue-500 hover:underline flex items-center gap-1">
                        <Eye size={12} /> Voir la capture
                      </a>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <StatusBadge status={req.status} className="scale-90" />
                  </td>
                  <td className="py-4 px-6 text-right">
                    {req.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleAction(req.id, 'approve')}
                          disabled={actionLoading === req.id}
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                          title="Valider et donner les pièces"
                        >
                          {actionLoading === req.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'reject')}
                          disabled={actionLoading === req.id}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Refuser"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
