import { useState } from 'react';
import { X, Euro, AlertCircle, CheckCircle, Loader2, Coins } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCoins: number;
  onSuccess: () => void;
}

export function WithdrawModal({ isOpen, onClose, availableCoins, onSuccess }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const numAmount = Math.min(Number(amount) || 0, availableCoins);
  const receivedEur = numAmount * 0.01; // 1 pièce = 0.01€, 0% commission fixée par l'API pour l'instant

  if (!isOpen) return null;

  const handleRequest = () => {
    if (numAmount < 5000) return;
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('creator_token');
      const res = await fetch('http://localhost:3001/api/creator/payouts/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amountCoins: numAmount })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la demande');

      setStep('success');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={step !== 'success' && !loading ? onClose : undefined} />

      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                <Coins size={16} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900">Demande de retrait</h3>
            </div>
            {!loading && (
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                <X size={18} />
              </button>
            )}
          </div>

          {step === 'form' && (
            <div className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Solde */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide mb-1">Solde disponible</p>
                <p className="text-3xl font-bold text-emerald-700">{availableCoins.toLocaleString('fr-FR')} 🪙</p>
              </div>

              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant à retirer (min 5000 🪙)</label>
                <div className="relative">
                  <Coins size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    min={5000}
                    max={availableCoins}
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                {/* Quick amounts */}
                <div className="flex gap-2 mt-2">
                  {[5000, 10000, 50000, availableCoins].map(v => (
                    <button
                      key={v}
                      onClick={() => setAmount(String(v))}
                      className="flex-1 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                    >
                      {v === availableCoins ? 'Tout' : `${v}🪙`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Récap conversion */}
              {numAmount >= 5000 && (
                <div className="space-y-2 border border-gray-100 rounded-2xl p-4 bg-gray-50">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Montant converti</span>
                    <span className="font-medium">{receivedEur.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                    <span>Tu recevras au minimum</span>
                    <span className="text-emerald-600">~{receivedEur.toFixed(2)} €</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button
                  onClick={handleRequest}
                  disabled={numAmount < 5000}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Confirmes-tu ce retrait ?</p>
                  <p className="text-xs text-amber-700 mt-1">Le paiement sera effectué selon ta méthode de retrait configurée sous 2-5 jours.</p>
                </div>
              </div>
              <div className="space-y-2 border border-gray-100 rounded-2xl p-4">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Pièces retirées</span><span className="font-bold">{numAmount.toLocaleString('fr-FR')} 🪙</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Valeur estimée</span><span className="font-bold text-emerald-600">{receivedEur.toFixed(2)} €</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('form')} disabled={loading} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">← Retour</button>
                <button onClick={handleConfirm} disabled={loading} className="flex-1 flex justify-center py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Confirmer'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Demande envoyée !</h4>
                <p className="text-gray-500 text-sm mt-1">La somme de <span className="font-bold text-emerald-600">{receivedEur.toFixed(2)} €</span> sera traitée sous 2-5 jours ouvrés.</p>
              </div>
              <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors mt-2">Fermer</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
