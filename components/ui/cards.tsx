import React, { useState } from 'react';
import { 
  TrendingUp, Users, Unlock, Award, Clock, CheckCircle, 
  Lock, AlertCircle, Plus, FileText, Eye, Info, ChevronRight,
  Activity, Database, Shield
} from 'lucide-react';

// ============================================================================
// BASE CARD COMPONENT - Reusable Foundation
// ============================================================================
interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<BaseCardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  onClick 
}) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-xl border border-slate-200 ${
      hover ? 'hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer' : 'shadow-sm'
    } ${className}`}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ 
  children, 
  className = '',
  onClick
}) => (
  <div className={`p-6 ${className}`} onClick={onClick}>
    {children}
  </div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`px-6 py-4 bg-slate-50 border-t border-slate-100 ${className}`}>
    {children}
  </div>
);

// ============================================================================
// STAT CARD - For Dashboard Metrics
// ============================================================================
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'bg-blue-100 text-blue-600',
  trend,
  onClick
}) => (
  <Card hover={!!onClick} onClick={onClick}>
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm font-medium ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${!trend.isPositive && 'rotate-180'}`} />
              {trend.value}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
      </div>
    </CardHeader>
  </Card>
);

// ============================================================================
// PATIENT CARD - For Patient List/Search Results
// ============================================================================
interface PatientCardProps {
  id: string;
  name: string;
  dob: string;
  lastVisit: string;
  historyAvailable: boolean;
  snapshotAvailable?: boolean;
  isUnlocked?: boolean;
  onViewHistory?: () => void;
  onViewSnapshot?: () => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  id,
  name,
  dob,
  lastVisit,
  historyAvailable,
  snapshotAvailable,
  isUnlocked,
  onViewHistory,
  onViewSnapshot
}) => (
  <Card hover>
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">{name}</h3>
          <p className="text-sm text-slate-500 font-mono mt-1">{id}</p>
        </div>
        <div className="flex gap-2">
          {historyAvailable && (
            <div className="w-2 h-2 bg-emerald-500 rounded-full" title="History Available"></div>
          )}
          {snapshotAvailable && (
            <div className="w-2 h-2 bg-blue-500 rounded-full" title="Snapshot Available"></div>
          )}
        </div>
      </div>
    </CardHeader>
    
    <CardBody className="py-3">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-500">DOB:</span>
          <p className="font-medium text-slate-900">{dob}</p>
        </div>
        <div>
          <span className="text-slate-500">Last Visit:</span>
          <p className="font-medium text-slate-900">{lastVisit}</p>
        </div>
      </div>
    </CardBody>

    {(historyAvailable || snapshotAvailable) && (
      <CardFooter>
        <div className="flex gap-2">
          {historyAvailable && onViewHistory && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewHistory(); }}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              History
            </button>
          )}
          {snapshotAvailable && onViewSnapshot && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewSnapshot(); }}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                isUnlocked 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              {isUnlocked ? (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Unlock
                </>
              )}
            </button>
          )}
        </div>
      </CardFooter>
    )}
  </Card>
);

// ============================================================================
// HISTORY ENTRY CARD - For Treatment History Display
// ============================================================================
interface HistoryEntryCardProps {
  condition: string;
  timelineStart: string;
  timelineEnd?: string;
  status: 'Resolved' | 'Ongoing' | 'Plateaued' | string;
  successfulTreatments: string;
  unsuccessfulTreatments: string;
  sourceClinic?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const HistoryEntryCard: React.FC<HistoryEntryCardProps> = ({
  condition,
  timelineStart,
  timelineEnd,
  status,
  successfulTreatments,
  unsuccessfulTreatments,
  sourceClinic,
  isExpanded = false,
  onToggle
}) => {
  const statusColors: Record<string, string> = {
    'Resolved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Ongoing': 'bg-blue-100 text-blue-700 border-blue-200',
    'Plateaued': 'bg-amber-100 text-amber-700 border-amber-200'
  };

  const badgeColor = statusColors[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <Card>
      <CardHeader className="cursor-pointer py-4" onClick={onToggle}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-slate-900">{condition}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badgeColor}`}>
                {status}
              </span>
            </div>
            <div className="flex items-center text-sm text-slate-500">
              <Clock className="w-4 h-4 mr-1" />
              {timelineStart} {timelineEnd && `→ ${timelineEnd}`}
            </div>
          </div>
          {onToggle && (
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded && 'rotate-90'}`} />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardBody className="pb-6">
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <div className="flex items-center mb-2 mt-4">
                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                <h4 className="text-sm font-semibold text-slate-700">Successful Treatments</h4>
              </div>
              <p className="text-sm text-slate-600 pl-6">{successfulTreatments || "None listed"}</p>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <AlertCircle className="w-4 h-4 text-rose-500 mr-2" />
                <h4 className="text-sm font-semibold text-slate-700">Unsuccessful Treatments</h4>
              </div>
              <p className="text-sm text-slate-600 pl-6">{unsuccessfulTreatments || "None listed"}</p>
            </div>

            {sourceClinic && (
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                Source: {sourceClinic}
              </div>
            )}
          </div>
        </CardBody>
      )}
    </Card>
  );
};

// ============================================================================
// ACTION CARD - For CTAs and Quick Actions
// ============================================================================
interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor?: string;
  buttonText: string;
  buttonColor?: string;
  badge?: string;
  onClick: () => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  iconColor = 'bg-blue-100 text-blue-600',
  buttonText,
  buttonColor = 'bg-slate-900 hover:bg-slate-800',
  badge,
  onClick
}) => (
  <Card hover onClick={onClick}>
    <CardHeader>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        {badge && (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
            {badge}
          </span>
        )}
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-4">{description}</p>
      
      <button className={`w-full flex items-center justify-center px-4 py-3 ${buttonColor} text-white rounded-lg font-semibold transition-colors`}>
        {buttonText}
        <ChevronRight className="w-4 h-4 ml-2" />
      </button>
    </CardHeader>
  </Card>
);

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
    <div className={`${style.bg} border ${style.border} rounded-xl p-4 flex items-start mb-4`}>
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {style.icon}
      </div>
      <div className="flex-1">
        <h4 className={`font-semibold ${style.text} mb-1 text-sm`}>{title}</h4>
        <p className={`text-sm ${style.text} opacity-80`}>{message}</p>
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