import { useState } from 'react';
import { Bell, Shield, CreditCard, MessageSquare, Zap, ChevronRight, ToggleLeft, ToggleRight, Plus, Trash2, Edit2, UserX, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AutoMessageModal } from '@/components/AutoMessageModal';
import { CreateShowModal } from '@/components/CreateShowModal';
import { WithdrawModal } from '@/components/WithdrawModal';

export function Settings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('auto-messages');

  const sections = [
    { id: 'auto-messages', label: 'Messages automatiques', icon: MessageSquare },
    { id: 'special-requests', label: 'Demandes spéciales', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialité', icon: Shield },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'account', label: 'Compte', icon: UserX },
  ];

  const [isAutoMsgModalOpen, setIsAutoMsgModalOpen] = useState(false);
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  return (
    <div className="p-8 max-w-6xl mx-auto pb-24 grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 px-2">Paramètres</h1>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${
              activeSection === section.id
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <section.icon size={18} className={activeSection === section.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
            <span className="font-medium text-sm">{section.label}</span>
            {activeSection === section.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="lg:col-span-3 space-y-6">
        {activeSection === 'auto-messages' && <AutoMessagesSettings onOpenModal={() => setIsAutoMsgModalOpen(true)} />}
        {activeSection === 'special-requests' && <SpecialRequestsSettings onOpenModal={() => setIsShowModalOpen(true)} />}
        {activeSection === 'notifications' && <NotificationsSettings />}
        {activeSection === 'privacy' && <PrivacySettings />}
        {activeSection === 'payments' && <PaymentsSettings onWithdraw={() => setIsWithdrawModalOpen(true)} />}
        {activeSection === 'account' && <AccountSettings />}
      </div>

      {/* Modals */}
      <AutoMessageModal isOpen={isAutoMsgModalOpen} onClose={() => setIsAutoMsgModalOpen(false)} onSave={(m) => console.log('AutoMsg:', m)} />
      <CreateShowModal isOpen={isShowModalOpen} onClose={() => setIsShowModalOpen(false)} onSave={(s) => console.log('Show:', s)} />
      <WithdrawModal 
         isOpen={isWithdrawModalOpen} 
         onClose={() => setIsWithdrawModalOpen(false)} 
         availableCoins={user?.coinBalance || 0}
         onSuccess={() => {
           setIsWithdrawModalOpen(false);
           alert('Demande de retrait confirmée !');
           window.location.reload();
         }}
      />
    </div>
  );
}

function AutoMessagesSettings({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Messages Automatiques</h2>
        <button onClick={onOpenModal} className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors">
          <Plus size={16} /> Nouveau
        </button>
      </div>
      
      <div className="space-y-4">
        {[
          { trigger: 'Nouveau message (hors ligne)', text: "Je suis indispo pour le moment, je reviens vite ! 💕", active: true },
          { trigger: 'Nouveau abonné', text: "Bienvenue ! 🌸 Tu as accès à ma galerie privée...", active: true },
          { trigger: 'Anniversaire 1 mois', text: "Déjà 1 mois ensemble ! Merci pour ton soutien 💜", active: false },
        ].map((msg, i) => (
          <div key={i} className="p-4 border border-gray-100 rounded-2xl hover:border-purple-200 transition-colors group relative">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50 px-2 py-1 rounded-md">{msg.trigger}</span>
              <div className="flex items-center gap-2">
                <button className={`text-2xl ${msg.active ? 'text-emerald-500' : 'text-gray-300'}`}>
                  {msg.active ? <ToggleRight /> : <ToggleLeft />}
                </button>
                <button className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-gray-700 text-sm italic">"{msg.text}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpecialRequestsSettings({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Demandes Spéciales</h2>
        <button onClick={onOpenModal} className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors">
          <Plus size={16} /> Ajouter un type
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: '🔥 Scène hot', price: 1200, active: true },
          { title: '📞 Appel Privé', price: 400, active: true },
          { title: '📸 Photos pieds', price: 500, active: false },
          { title: '🎁 Vidéo dédicacée', price: 300, active: true },
        ].map((req, i) => (
          <div key={i} className="p-4 border border-gray-100 rounded-2xl flex justify-between items-center hover:shadow-md transition-all">
            <div>
              <h3 className="font-bold text-gray-900">{req.title}</h3>
              <p className="text-sm text-gray-500">{req.price} 🪙</p>
            </div>
            <button className={`text-2xl ${req.active ? 'text-emerald-500' : 'text-gray-300'}`}>
              {req.active ? <ToggleRight /> : <ToggleLeft />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsSettings() {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Notifications</h2>
      <div className="space-y-4">
        {['Nouveau message reçu', 'Nouveau abonné', 'Tip reçu', 'Demande spéciale', 'Objectif live atteint'].map((notif, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
            <span className="text-gray-700 font-medium">{notif}</span>
            <button className="text-2xl text-emerald-500">
              <ToggleRight />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivacySettings() {
  const [profileVisible, setProfileVisible] = useState(true);
  const [blacklist, setBlacklist] = useState([
    { id: 'u99', name: 'user_bad', reason: 'Harcèlement', date: '12 Fév 2024' },
  ]);

  const removeFromBlacklist = (id: string) => setBlacklist(bl => bl.filter(u => u.id !== id));

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Confidentialité</h2>

        <div className="space-y-6">
          {/* Toggle profil visible */}
          <div className="flex justify-between items-center py-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900">Profil visible</h3>
              <p className="text-xs text-gray-500 mt-0.5">Désactiver pour mettre votre profil en pause</p>
            </div>
            <button
              onClick={() => setProfileVisible(!profileVisible)}
              className={`relative w-12 h-6 rounded-full transition-colors ${profileVisible ? 'bg-emerald-500' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profileVisible ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Mode vacances */}
          <div className="flex justify-between items-center py-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900">Mode Vacances</h3>
              <p className="text-xs text-gray-500 mt-0.5">Votre profil sera grisé et un message auto sera envoyé.</p>
            </div>
            <button className="relative w-12 h-6 rounded-full bg-gray-200 transition-colors">
              <span className="absolute top-0.5 translate-x-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" />
            </button>
          </div>

          {/* Pays bloqués */}
          <div className="pb-4 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pays bloqués</label>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center gap-1">
                Russie <XIcon />
              </span>
            </div>
            <button className="text-sm text-purple-600 font-medium hover:underline">+ Ajouter un pays</button>
          </div>

          {/* Liste noire */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserX size={14} className="text-gray-400" />
              <h3 className="font-bold text-gray-900 text-sm">Liste noire ({blacklist.length})</h3>
            </div>
            {blacklist.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun utilisateur bloqué.</p>
            ) : (
              <div className="space-y-2">
                {blacklist.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center text-red-600 font-bold text-xs">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">@{u.name}</p>
                        <p className="text-xs text-gray-500">{u.reason} · {u.date}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromBlacklist(u.id)}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold transition-colors"
                    >
                      Débloquer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentsSettings({ onWithdraw }: { onWithdraw: () => void }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [method, setMethod] = useState(user?.preferredPayoutMethod || 'BANK');
  const [iban, setIban] = useState(user?.iban || '');
  const [cryptoAddress, setCryptoAddress] = useState(user?.cryptoAddress || '');
  const [paxfulUsername, setPaxfulUsername] = useState(user?.paxfulUsername || '');
  const [saving, setSaving] = useState(false);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('creator_token');
      await fetch('http://localhost:3001/api/creator/profile/payout-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preferredPayoutMethod: method,
          iban: method === 'BANK' ? iban : undefined,
          cryptoAddress: method === 'CRYPTO' ? cryptoAddress : undefined,
          cryptoNetwork: method === 'CRYPTO' ? 'TRC20' : undefined,
          paxfulUsername: method === 'PAXFUL' ? paxfulUsername : undefined,
        })
      });
      alert('Informations de paiement sauvegardées !');
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      alert('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Paiements</h2>
      
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Solde de Pièces (Coins)</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{(user?.coinBalance || 0).toLocaleString('fr-FR')} 🪙</p>
          </div>
          <button
            onClick={onWithdraw}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
          >
            Retirer
          </button>
        </div>
        
        {!isEditing ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CreditCard size={16} />
            <span>Méthode: {user?.preferredPayoutMethod || 'Non configurée'}</span>
            <button onClick={() => setIsEditing(true)} className="text-purple-600 font-medium ml-2">Modifier</button>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl space-y-4">
            <h4 className="font-bold text-gray-900">Configurer mes retraits</h4>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg outline-none">
              <option value="BANK">Virement Bancaire (IBAN)</option>
              <option value="CRYPTO">Crypto (USDT TRC20)</option>
              <option value="PAXFUL">Paxful</option>
            </select>
            
            {method === 'BANK' && <input type="text" placeholder="IBAN (Ex: FR76...)" value={iban} onChange={e => setIban(e.target.value)} className="w-full p-2 border rounded-lg" />}
            {method === 'CRYPTO' && <input type="text" placeholder="Adresse USDT TRC20" value={cryptoAddress} onChange={e => setCryptoAddress(e.target.value)} className="w-full p-2 border rounded-lg" />}
            {method === 'PAXFUL' && <input type="text" placeholder="Pseudonyme Paxful" value={paxfulUsername} onChange={e => setPaxfulUsername(e.target.value)} className="w-full p-2 border rounded-lg" />}
            
            <div className="flex gap-2">
              <button disabled={saving} onClick={handleSaveConfig} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Enregistrer</button>
              <button onClick={() => setIsEditing(false)} className="text-gray-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">Annuler</button>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-4">Historique des transactions</h3>
        <p className="text-sm text-gray-500 italic mb-3">L'historique complet est en cours d'intégration...</p>
      </div>
    </div>
  );
}

function AccountSettings() {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
      window.location.reload();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 space-y-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Gestion du compte</h2>
        <p className="text-sm text-gray-500">Informations et actions sur votre compte</p>
      </div>

      {/* Informations utilisateur */}
      <div className="border-t pt-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
          <p className="mt-1 text-gray-900 font-medium">{user?.email}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom d'utilisateur</label>
          <p className="mt-1 text-gray-900 font-medium">{user?.username || 'Non défini'}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type de compte</label>
          <p className="mt-1">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              user?.role === 'CREATOR' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {user?.role === 'CREATOR' ? 'Créateur' : 'Client'}
            </span>
          </p>
        </div>
      </div>

      {/* Actions dangereuses */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Actions</h3>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-semibold group"
        >
          <LogOut size={18} className="group-hover:translate-x-[-2px] transition-transform" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

function XIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
}
