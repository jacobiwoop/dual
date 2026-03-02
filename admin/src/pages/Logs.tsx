import React from 'react';
import { ACTIVITY_LOGS } from '../lib/mockData';
import { Clock, Shield, User, Settings, AlertTriangle, FileText, DollarSign } from 'lucide-react';
import { clsx } from 'clsx';

export default function Logs() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield size={16} />;
      case 'user': return <User size={16} />;
      case 'system': return <Settings size={16} />;
      case 'moderation': return <AlertTriangle size={16} />;
      case 'finance': return <DollarSign size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'security': return 'bg-red-100 text-red-700';
      case 'user': return 'bg-blue-100 text-blue-700';
      case 'system': return 'bg-gray-100 text-gray-700';
      case 'moderation': return 'bg-orange-100 text-orange-700';
      case 'finance': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Journal d'activité</h2>
          <p className="text-sm text-gray-500">Historique des actions administrateurs et système</p>
        </div>
      </div>

      {/* Logs Feed */}
      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden p-6">
        <div className="relative border-l border-gray-200 ml-4 space-y-8">
          {ACTIVITY_LOGS.map((log, idx) => (
            <div key={log.id} className="relative pl-8 group">
              {/* Timeline Dot */}
              <div className={clsx(
                "absolute -left-[21px] top-1 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center transition-transform group-hover:scale-110",
                getColor(log.type)
              )}>
                {getIcon(log.type)}
              </div>

              {/* Content */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    <span className="font-bold">{log.admin}</span> {log.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-lg w-fit">
                  <Clock size={12} />
                  {log.time}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <button className="text-sm text-gray-500 hover:text-black font-medium transition-colors">
            Charger plus d'activités
          </button>
        </div>
      </div>
    </div>
  );
}
