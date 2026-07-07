import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

// ============================================================================
// INFO CARD - For Notifications and Alerts
// ============================================================================
interface InfoCardProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  onDismiss?: () => void;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  type,
  title,
  message,
  onDismiss
}) => {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600" />
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      icon: <AlertCircle className="w-5 h-5 text-amber-600" />
    },
    error: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600" />
    }
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4 flex items-start mb-4`}>
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {style.icon}
      </div>
      <div className="flex-1">
        <h4 className={`font-semibold ${style.text} mb-1 text-[13px]`}>{title}</h4>
        <p className={`text-xs ${style.text} opacity-80`}>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 ml-3 ${style.text} opacity-60 hover:opacity-100 transition-opacity`}
        >
          ×
        </button>
      )}
    </div>
  );
};