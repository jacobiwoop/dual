import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  type?: 'currency' | 'number' | 'text' | 'alert';
  onClick?: () => void;
}

export function StatCard({ title, value, change, trend, type = 'text', onClick }: StatCardProps) {
  const isAlert = type === 'alert' && (change.includes('critique') || change.includes('urgent'));

  return (
    <div 
      onClick={onClick}
      className={clsx(
        "p-6 rounded-[2rem] shadow-sm flex flex-col justify-between h-40 transition-all duration-200 border border-transparent",
        isAlert ? "bg-red-50 border-red-100 cursor-pointer hover:shadow-md" : "bg-white hover:shadow-md cursor-pointer"
      )}
    >
      <div className="flex justify-between items-start">
        <p className={clsx("text-sm font-medium mb-1", isAlert ? "text-red-800" : "text-gray-600")}>{title}</p>
        <span className={clsx("text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1", 
          trend === 'up' ? 'bg-green-100 text-green-700' : 
          trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
        )}>
          {trend === 'up' && <ArrowUpRight size={12} />}
          {trend === 'down' && <ArrowDownRight size={12} />}
          {change}
        </span>
      </div>
      <div>
        <h3 className={clsx("text-3xl font-bold", isAlert ? "text-red-900" : "text-gray-900")}>{value}</h3>
      </div>
    </div>
  );
}
