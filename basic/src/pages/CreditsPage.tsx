import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet } from 'lucide-react';
import { PurchaseModal } from '../components/PurchaseModal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PACKS = [
  { id: 1, coins: 100,   priceNum: 1,  priceStr: '1€',   bonus: null,     popular: false },
  { id: 2, coins: 500,   priceNum: 5,  priceStr: '5€',   bonus: null,     popular: false },
  { id: 3, coins: 1000,  priceNum: 10, priceStr: '10€',  bonus: '+50🪙',  popular: true  },
  { id: 4, coins: 2500,  priceNum: 25, priceStr: '25€',  bonus: '+200🪙', popular: false },
  { id: 5, coins: 5000,  priceNum: 50, priceStr: '50€',  bonus: '+500🪙', popular: false },
  { id: 6, coins: 10000, price: 90,    priceStr: '90€',  bonus: '+1500🪙', popular: false },
];

export const CreditsPage = () => {
  const navigate = useNavigate();
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const { updateUser } = useAuth();

  const fetchBalance = async () => {
    try {
      const response = await api.get('/api/client/credits/balance');
      setBalance(response.data.balanceCredits);
      updateUser({ coinBalance: response.data.balanceCredits });
    } catch (error) {
      console.error('Erreur lors du chargement du solde:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleOpenModal = (pack: any) => {
    setSelectedPack(pack);
    setIsModalOpen(true);
  };

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors"
      >
        <ArrowLeft size={18} /> Retour
      </button>

      <div className="flex items-center gap-3 mb-2">
        <Wallet size={28} className="text-amber-500" />
        <h1 className="text-3xl font-bold">Acheter des 🪙 crédits</h1>
      </div>
      <p className="text-gray-500 mb-10">
        Les crédits vous permettent d'envoyer des messages, débloquer du contenu et accéder aux offres privées.
      </p>

      {/* Solde actuel */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-10 flex items-center justify-between">
        <div>
          <p className="text-sm text-amber-700 font-medium">Votre solde actuel</p>
          <p className="text-3xl font-bold text-amber-600">
            {balance !== null ? balance.toLocaleString() : '...'} 🪙
          </p>
        </div>
        <div className="text-4xl">👛</div>
      </div>

      {/* Packs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {PACKS.map((pack) => (
          <div
            key={pack.id}
            className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md ${
              pack.popular ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            {pack.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                ⭐ Populaire
              </span>
            )}
            <div className="text-3xl font-bold text-amber-600 mb-1">{pack.coins.toLocaleString()}🪙</div>
            {pack.bonus && <div className="text-sm text-green-600 font-semibold mb-3">+ Bonus {pack.bonus}</div>}
            <div className="text-2xl font-bold text-gray-900 mb-4">{pack.priceStr}</div>
            <button 
              onClick={() => handleOpenModal(pack)}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
              pack.popular ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-gray-100 hover:bg-amber-500 hover:text-white text-gray-800'
            }`}>
              Acheter
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center mt-8">
        Les crédits n'expirent pas · Paiement sécurisé · Aucun remboursement
      </p>

      {/* MODAL */}
      <PurchaseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pack={selectedPack}
        onSuccess={() => {
          alert("Achat réussi ! Vos pièces ont été ajoutées à votre compte.");
          fetchBalance(); 
        }}
      />
    </div>
  );
};
