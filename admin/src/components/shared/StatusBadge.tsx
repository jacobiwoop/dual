import { clsx } from 'clsx';

type StatusType = 'Actif' | 'En attente' | 'En vérification' | 'Suspendu' | 'Banni' | 'Vérifié' | 'Rejeté' | 'Complétée' | 'Échouée' | 'Remboursée' | 'Validé' | 'Ouvert' | 'Visible' | 'Masqué' | 'Signalé';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStyles = (s: string) => {
    switch (s) {
      case 'Actif':
      case 'Vérifié':
      case 'Complétée':
      case 'Validé':
      case 'Visible':
        return 'bg-green-100 text-green-700';
      case 'En attente':
      case 'En vérification':
      case 'Ouvert':
        return 'bg-yellow-100 text-yellow-700';
      case 'Suspendu':
      case 'Masqué':
        return 'bg-orange-100 text-orange-700';
      case 'Banni':
      case 'Rejeté':
      case 'Échouée':
      case 'Signalé':
        return 'bg-red-100 text-red-700';
      case 'Remboursée':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <span className={clsx(
      "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
      getStyles(status),
      className
    )}>
      {status === 'Vérifié' ? 'Vérifié ✓' : status === 'Rejeté' ? 'Rejeté ✗' : status}
    </span>
  );
}
