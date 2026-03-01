import { useState } from 'react';
import { X, CreditCard, Euro, AlertCircle, CheckCircle } from 'lucide-react';

const COMMISSION_RATE = 0.2; // 20%
const AVAILABLE = 56874;

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');

  const numAmount = Math.min(Number(amount) || 0, AVAILABLE);
  const commission = numAmount * COMMISSION_RATE;
  const received = numAmount - commission;

  if (!isOpen) return null;

  const handleRequest = () => {
    if (numAmount < 50) return;
    setStep('confirm');
  };

  const handleConfirm = () => {
    setStep('success');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={step !== 'success' ? onClose : undefined} />

      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                <Euro size={16} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900">Demande de retrait</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <X size={18} />
            </button>
          </div>

          {step === 'form' && (
            <div className="p-6 space-y-5">
              {/* Solde */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide mb-1">Solde disponible</p>
                <p className="text-3xl font-bold text-emerald-700">{AVAILABLE.toLocaleString('fr-FR')} €</p>
              </div>

              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant à retirer (min 50 €)</label>
                <div className="relative">
                  <Euro size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    min={50}
                    max={AVAILABLE}
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                {/* Quick amounts */}
                <div className="flex gap-2 mt-2">
                  {[500, 1000, 5000, AVAILABLE].map(v => (
                    <button
                      key={v}
                      onClick={() => setAmount(String(v))}
                      className="flex-1 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                    >
                      {v === AVAILABLE ? 'Tout' : `${v}€`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Récap commission */}
              {numAmount >= 50 && (
                <div className="space-y-2 border border-gray-100 rounded-2xl p-4 bg-gray-50">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Montant demandé</span>
                    <span className="font-medium">{numAmount.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Commission ({COMMISSION_RATE * 100}%)</span>
                    <span className="text-red-500 font-medium">- {commission.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                    <span>Tu recevras</span>
                    <span className="text-emerald-600">{received.toFixed(2)} €</span>
                  </div>
                </div>
              )}

              {/* IBAN */}
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl">
                <CreditCard size={14} />
                <span>IBAN : FR76 **** **** **** 9821</span>
              </div>

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button
                  onClick={handleRequest}
                  disabled={numAmount < 50}
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
                  <p className="text-xs text-amber-700 mt-1">Le virement sera traité sous 2-5 jours ouvrés.</p>
                </div>
              </div>
              <div className="space-y-2 border border-gray-100 rounded-2xl p-4">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Montant</span><span className="font-bold">{numAmount.toLocaleString('fr-FR')} €</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Tu recevras</span><span className="font-bold text-emerald-600">{received.toFixed(2)} €</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Vers</span><span>FR76 **** 9821</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('form')} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">← Retour</button>
                <button onClick={handleConfirm} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">Confirmer</button>
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
                <p className="text-gray-500 text-sm mt-1">Tu recevras <span className="font-bold text-emerald-600">{received.toFixed(2)} €</span> sous 2-5 jours ouvrés.</p>
              </div>
              <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors mt-2">Fermer</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
