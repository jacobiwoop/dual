import { useState } from 'react';
import { Check, X, Clock, DollarSign, MessageSquare } from 'lucide-react';
import { REQUESTS } from '@/data/mockData';
import { Modal } from '@/components/ui/Modal';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Requests() {
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'refused'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);

  const filteredRequests = REQUESTS.filter(req => req.status === activeTab);

  const handleAccept = (req: any) => {
    setSelectedRequest(req);
    setIsAcceptModalOpen(true);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Demandes Spéciales</h1>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200 shadow-sm">
            {REQUESTS.filter(r => r.status === 'pending').length} en attente
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 bg-gray-100 p-1 rounded-2xl w-fit shadow-inner">
        {[
          { id: 'pending', label: '⏳ En attente' },
          { id: 'accepted', label: '✅ Acceptées' },
          { id: 'refused', label: '❌ Refusées' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-gray-400">Aucune demande dans cette catégorie.</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
              {/* Status Stripe */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                req.status === 'pending' ? 'bg-yellow-400' : 
                req.status === 'accepted' ? 'bg-green-500' : 'bg-red-500'
              }`} />

              <div className="flex flex-col md:flex-row gap-6 pl-4">
                {/* User Info */}
                <div className="flex items-start gap-4 min-w-[200px]">
                  <img src={req.user.avatar} alt={req.user.username} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div>
                    <h3 className="font-bold text-gray-900">{req.user.displayName}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${req.user.subscriptionTier === 'Plus' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                      {req.user.subscriptionTier}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      il y a {formatDistanceToNow(req.timestamp, { locale: fr })}
                    </p>
                  </div>
                </div>

                {/* Request Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100">
                      {req.type}
                    </span>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1">
                      {req.price} 🪙
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm text-gray-700 italic relative">
                    <MessageSquare size={16} className="absolute -top-2 -left-2 text-gray-300 bg-white rounded-full p-0.5" />
                    "{req.description}"
                  </div>
                </div>

                {/* Actions */}
                {req.status === 'pending' && (
                  <div className="flex flex-col gap-2 justify-center min-w-[140px]">
                    <button 
                      onClick={() => handleAccept(req)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      <Check size={16} />
                      Accepter
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                      <X size={16} />
                      Refuser
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Accept Modal */}
      {selectedRequest && (
        <Modal isOpen={isAcceptModalOpen} onClose={() => setIsAcceptModalOpen(false)} title="Accepter la demande">
          <div className="space-y-6">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                <Check size={20} />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900">Tu acceptes la demande de {selectedRequest.user.displayName}</h4>
                <p className="text-sm text-emerald-700 mt-1">Le montant de {selectedRequest.price} 🪙 sera débité immédiatement.</p>
              </div>
            </div>

            <div className="space-y-4 border-t border-b border-gray-100 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-gray-900">{selectedRequest.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Prix</span>
                <span className="font-bold text-gray-900">{selectedRequest.price} 🪙</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Message client</span>
                <span className="font-medium text-gray-900 italic truncate max-w-[200px]">"{selectedRequest.description}"</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Un message automatique sera envoyé à {selectedRequest.user.displayName} pour confirmer.
            </p>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsAcceptModalOpen(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  alert(`Demande acceptée ! +${selectedRequest.price}🪙`);
                  setIsAcceptModalOpen(false);
                }}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
              >
                Confirmer & Encaisser
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
