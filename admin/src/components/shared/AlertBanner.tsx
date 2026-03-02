import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface AlertBannerProps {
  alerts: {
    type: 'critical' | 'warning';
    message: string;
    link: string;
  }[];
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || alerts.length === 0) return null;

  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  const warningAlerts = alerts.filter(a => a.type === 'warning');
  
  const primaryAlert = criticalAlerts.length > 0 ? criticalAlerts[0] : warningAlerts[0];
  const count = alerts.length;

  return (
    <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 rounded-full text-red-600">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-red-900">
            {count > 1 ? `${count} alertes nécessitent votre attention` : 'Action requise'}
          </h4>
          <p className="text-sm text-red-700 mt-0.5">
            {primaryAlert.message}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link 
          to={primaryAlert.link}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Traiter <ArrowRight size={16} />
        </Link>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
