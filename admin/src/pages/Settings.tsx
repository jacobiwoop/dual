import React from 'react';
import { Save, Shield, Globe, DollarSign } from 'lucide-react';
import { clsx } from 'clsx';

export default function Settings() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Paramètres système</h2>
          <p className="text-sm text-gray-500">Configuration globale de la plateforme</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
          <Save size={16} /> Enregistrer les modifications
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Navigation */}
        <div className="space-y-2">
          {['Général', 'Finances & Commissions', 'Sécurité & Accès', 'Notifications', 'Maintenance'].map((item, idx) => (
            <button 
              key={item}
              className={clsx(
                "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between group",
                idx === 0 ? "bg-white text-black shadow-sm" : "text-gray-500 hover:bg-white/50 hover:text-black"
              )}
            >
              {item}
              {idx === 0 && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
            </button>
          ))}
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Platform Status */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe size={20} /> État de la plateforme
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">Mode Maintenance</p>
                  <p className="text-xs text-gray-500">Rend le site inaccessible aux utilisateurs (sauf admins)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">Inscriptions Créateurs</p>
                  <p className="text-xs text-gray-500">Autoriser les nouvelles demandes d'inscription</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign size={20} /> Finances & Commissions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commission par défaut (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    defaultValue={20}
                    className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black/5 font-mono"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Appliqué à tous les nouveaux créateurs</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Taux de change (USD/EUR)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    defaultValue={0.92}
                    step="0.01"
                    className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black/5 font-mono"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Dernière mise à jour automatique : Hier</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seuil minimum de retrait (€)</label>
                <input 
                  type="number" 
                  defaultValue={50}
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black/5 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Délai de paiement (jours)</label>
                <input 
                  type="number" 
                  defaultValue={7}
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black/5 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={20} /> Sécurité
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">Double authentification (2FA) Admin</p>
                  <p className="text-xs text-gray-500">Obligatoire pour tous les administrateurs</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
