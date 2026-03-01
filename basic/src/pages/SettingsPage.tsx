import { useState } from 'react';
import { User, Bell, Lock, CreditCard, LogOut, ChevronRight } from 'lucide-react';

const TABS = [
  { id: 'account',       label: 'Mon Compte',       icon: <User size={18} /> },
  { id: 'notifications', label: 'Notifications',    icon: <Bell size={18} /> },
  { id: 'privacy',       label: 'Confidentialité',  icon: <Lock size={18} /> },
  { id: 'billing',       label: 'Facturation',      icon: <CreditCard size={18} /> },
];

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs]   = useState(true);

  return (
    <div className="-mx-8 min-h-screen bg-gray-100 p-8 pt-6">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Paramètres</h1>
          <p className="text-gray-500 text-sm">Gérez votre profil, vos préférences et votre facturation.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Menu Latéral (Settings) */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <nav className="flex flex-col">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-5 py-4 text-sm font-medium transition-colors border-l-2 ${
                      activeTab === tab.id
                        ? 'border-gray-900 bg-gray-50 text-gray-900'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className={activeTab === tab.id ? 'text-gray-900' : 'text-gray-400'}>{tab.icon}</span>
                    {tab.label}
                    <ChevronRight size={16} className="ml-auto text-gray-300" />
                  </button>
                ))}
              </nav>
              
              <div className="p-4 border-t border-gray-100 bg-red-50/50">
                <button className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-semibold w-full px-2 py-2 rounded-lg hover:bg-red-50 transition-colors">
                  <LogOut size={16} />
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>

          {/* Contenu Principal */}
          <div className="flex-1 min-w-0">
            
            {activeTab === 'account' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Informations Personnelles</h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Nom d'utilisateur</label>
                    <input 
                      type="text" 
                      defaultValue="user_1234"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 block p-3 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Adresse Email</label>
                    <input 
                      type="email" 
                      defaultValue="hello@example.com"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 block p-3 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Mot de passe</label>
                    <button className="text-sm font-semibold text-gray-600 hover:text-gray-900 underline underline-offset-2">
                      Changer le mot de passe
                    </button>
                  </div>

                  <div className="pt-4 border-t border-gray-100 mt-6 flex justify-end">
                    <button className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-colors shadow-sm">
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Préférences de Notifications</h2>
                
                <div className="space-y-6">
                  {/* Switch 1 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Notifications Email</p>
                      <p className="text-xs text-gray-500 mt-0.5">Recevoir un résumé par email de l'activité.</p>
                    </div>
                    <button 
                      onClick={() => setEmailNotifs(!emailNotifs)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotifs ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifs ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Switch 2 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Notifications Push</p>
                      <p className="text-xs text-gray-500 mt-0.5">Être alerté instantanément sur votre appareil.</p>
                    </div>
                    <button 
                      onClick={() => setPushNotifs(!pushNotifs)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pushNotifs ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pushNotifs ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'privacy' || activeTab === 'billing') && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'privacy' ? <Lock className="text-gray-400" /> : <CreditCard className="text-gray-400" />}
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  {activeTab === 'privacy' ? 'Confidentialité' : 'Facturation'}
                </h2>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Cette section est en cours de construction. Vous pourrez bientôt y gérer vos paramètres avancés.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
