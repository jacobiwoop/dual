import React from 'react';
import { CURRENT_USER } from '../lib/constants';
import { User, Mail, Shield, Key, LogOut, Camera } from 'lucide-react';

export default function Account() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Mon Compte</h2>
        <p className="text-sm text-gray-500">Gérez vos informations personnelles et votre sécurité</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col items-center text-center h-fit">
          <div className="relative mb-4 group cursor-pointer">
            <img 
              src={CURRENT_USER.avatar} 
              alt={CURRENT_USER.name} 
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 group-hover:opacity-90 transition-opacity" 
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/50 p-2 rounded-full text-white">
                <Camera size={20} />
              </div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{CURRENT_USER.name}</h3>
          <p className="text-sm text-gray-500 mb-4">{CURRENT_USER.email}</p>
          <span className="px-3 py-1 bg-black text-white text-xs font-bold uppercase rounded-full tracking-wide">
            {CURRENT_USER.role}
          </span>
          
          <div className="w-full mt-8 pt-8 border-t border-gray-100">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
              <LogOut size={16} /> Déconnexion
            </button>
          </div>
        </div>

        {/* Details Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User size={20} /> Informations personnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                <input 
                  type="text" 
                  defaultValue={CURRENT_USER.name}
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black/5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="email" 
                    defaultValue={CURRENT_USER.email}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield size={20} /> Sécurité
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Key size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Mot de passe</p>
                    <p className="text-xs text-gray-500">Dernière modification il y a 3 mois</p>
                  </div>
                </div>
                <button className="text-sm font-medium text-black hover:underline">Modifier</button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Shield size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Double authentification (2FA)</p>
                    <p className="text-xs text-gray-500">Sécurisez votre compte avec une seconde étape</p>
                  </div>
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
