import React, { useState } from 'react';
import { X, Upload, CreditCard } from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  pack: {
    coins: number;
    priceNum: number;
    priceStr: string;
    bonus: string | null;
  } | null;
  onSuccess: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, pack, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !pack) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) {
      setError('Veuillez choisir une méthode de paiement');
      return;
    }
    if (!transactionId && !proofFile) {
      setError('Veuillez fournir un ID de transaction ou une preuve visuelle');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Étape 1: Créer le FormData si fichier
      const formData = new FormData();
      formData.append('coinsRequested', pack.coins.toString());
      formData.append('amountPaidRaw', pack.priceNum.toString());
      formData.append('currency', 'EUR');
      formData.append('paymentMethod', paymentMethod);
      if (transactionId) formData.append('transactionId', transactionId);
      if (proofFile) formData.append('proofImage', proofFile);

      // Étape 2: Appel API
      const token = localStorage.getItem('basic_token');
      const response = await fetch('http://localhost:3001/api/client/payments/buy-coins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la demande d\'achat');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-amber-50 px-6 py-5 border-b border-amber-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard size={20} className="text-amber-500" />
              Achat de Pièces
            </h3>
            <p className="text-amber-700 text-sm font-medium mt-1">
              Pack de {pack.coins.toLocaleString()} 🪙 pour {pack.priceStr}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Méthode de paiement effectuée</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">-- Sélectionnez --</option>
              <option value="BANK_TRANSFER">Virement Bancaire</option>
              <option value="CRYPTO_USDT">Crypto (USDT TRC20)</option>
              <option value="PAXFUL">Paxful</option>
            </select>
            {paymentMethod === 'BANK_TRANSFER' && <p className="text-xs text-gray-500 mt-2">Virement à effectuer sur le compte FR76 XXXX XXXX.</p>}
            {paymentMethod === 'CRYPTO_USDT' && <p className="text-xs text-gray-500 mt-2">Envoyer USDT TRC20 à : TQkxxxxxxxxxxxxxxx.</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">ID de Transaction</label>
            <input
              type="text"
              placeholder="Ex: TRON Hash ou Référence virement"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Preuve de paiement (Optionnel)</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload size={24} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 font-medium">
                  {proofFile ? proofFile.name : 'Cliquez pour uploader une capture'}
                </p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          {/* Boutons */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Envoi...' : 'Demander les pièces'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
