import React from 'react';
import { Award, TrendingUp, Users, Plus, Search, ArrowRight, LogOut, LogIn } from 'lucide-react';

interface DashboardProps {
  credits: number;
  contributionCount: number;
  unlockedCount: number;
  onNavigate: (tab: string) => void;
  isOptedIn: boolean;
  onOptIn: () => void;
  onOptOut: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  credits,
  contributionCount,
  unlockedCount,
  onNavigate,
  isOptedIn,
  onOptIn,
  onOptOut
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Dashboard</h2>
        <p className="text-slate-500">Welcome to the Kinetic Network</p>
      </div>

      {/* Opt-in/Opt-out Banner */}
      {!isOptedIn && (
        <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-amber-900 mb-1 flex items-center">
                <LogOut className="w-5 h-5 mr-2" />
                Network Opted Out
              </h3>
              <p className="text-sm text-amber-700">
                You are currently opted out of the Kinetic Network. Opt back in to access patient histories and earn credits.
              </p>
            </div>
            <button
              onClick={onOptIn}
              className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Opt In to Network
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid - BUG FIX #5: Responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Credits Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-emerald-700 mb-1">Available Credits</p>
              <p className="text-4xl font-bold text-emerald-900">{credits}</p>
              <p className="text-xs text-emerald-600 mt-2">
                {isOptedIn ? 'Earn more by contributing' : 'Opt in to earn credits'}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center text-sm text-emerald-700">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+1 per contribution</span>
          </div>
        </div>

        {/* Contributions Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Contributions</p>
              <p className="text-4xl font-bold text-slate-900">{contributionCount}</p>
              <p className="text-xs text-slate-500 mt-2">Histories shared with network</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <button 
            onClick={() => onNavigate('contribute')}
            disabled={!isOptedIn}
            className={`text-sm font-medium flex items-center ${
              isOptedIn ? 'text-blue-600 hover:text-blue-700' : 'text-slate-400 cursor-not-allowed'
            }`}
          >
            Contribute now <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Unlocked Records Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Unlocked Records</p>
              <p className="text-4xl font-bold text-slate-900">{unlockedCount}</p>
              <p className="text-xs text-slate-500 mt-2">Patient histories accessed</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <button 
            onClick={() => onNavigate('intake')}
            disabled={!isOptedIn}
            className={`text-sm font-medium flex items-center ${
              isOptedIn ? 'text-purple-600 hover:text-purple-700' : 'text-slate-400 cursor-not-allowed'
            }`}
          >
            Search patients <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Quick Actions - BUG FIX #5: Responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Patient Intake Card */}
        <div 
          onClick={() => isOptedIn && onNavigate('intake')}
          className={`bg-white rounded-xl p-6 border border-slate-200 shadow-sm transition-all ${
            isOptedIn 
              ? 'hover:shadow-lg hover:border-slate-300 cursor-pointer group' 
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center ${
              isOptedIn && 'group-hover:scale-110'
            } transition-transform`}>
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            {isOptedIn && (
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Patient Intake</h3>
          <p className="text-sm text-slate-500 mb-4">
            Search for patient history and clinical snapshots across the network
          </p>
          {isOptedIn ? (
            <div className="inline-flex items-center text-sm font-medium text-blue-600">
              Search patients <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          ) : (
            <div className="text-sm text-amber-600 font-medium">
              Opt in to access
            </div>
          )}
        </div>

        {/* Contribute Data Card */}
        <div 
          onClick={() => isOptedIn && onNavigate('contribute')}
          className={`rounded-xl p-6 border shadow-sm transition-all ${
            isOptedIn
              ? 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-600 hover:shadow-lg cursor-pointer group text-white'
              : 'bg-slate-200 border-slate-300 opacity-50 cursor-not-allowed text-slate-500'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isOptedIn 
                ? 'bg-white/20 group-hover:scale-110' 
                : 'bg-slate-300'
            } transition-transform`}>
              <Plus className={`w-6 h-6 ${isOptedIn ? 'text-white' : 'text-slate-400'}`} />
            </div>
            {isOptedIn && (
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                +1 Credit
              </div>
            )}
          </div>
          <h3 className="text-lg font-bold mb-2">Contribute Data</h3>
          <p className={`text-sm mb-4 ${isOptedIn ? 'text-emerald-50' : 'text-slate-400'}`}>
            Share treatment outcomes and earn credits for network access
          </p>
          {isOptedIn ? (
            <div className="inline-flex items-center text-sm font-medium">
              Contribute now <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          ) : (
            <div className="text-sm font-medium text-amber-600">
              Opt in to contribute
            </div>
          )}
        </div>
      </div>

      {/* Network Info */}
      <div className={`rounded-xl p-6 border ${
        isOptedIn 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-slate-100 border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className={`font-semibold mb-1 ${isOptedIn ? 'text-blue-900' : 'text-slate-700'}`}>
              Network Status
            </h3>
            <p className={`text-sm ${isOptedIn ? 'text-blue-700' : 'text-slate-500'}`}>
              {isOptedIn 
                ? 'You are connected to the Kinetic Network. Your data is encrypted and anonymized.'
                : 'You are currently opted out. Your data is not being shared with the network.'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isOptedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}></div>
            <span className={`text-sm font-medium ${isOptedIn ? 'text-blue-900' : 'text-slate-600'}`}>
              {isOptedIn ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        
        {isOptedIn && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <button
              onClick={onOptOut}
              className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Opt Out of Network (will remove all credits)
            </button>
          </div>
        )}
      </div>

      {/* Getting Started Guide - Responsive */}
      <div className="mt-8 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Getting Started</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col sm:flex-row md:flex-col items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-600 font-bold">1</span>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Contribute Patient Data</h4>
              <p className="text-sm text-slate-500">
                Share structured treatment outcomes to earn credits
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Search Network History</h4>
              <p className="text-sm text-slate-500">
                Look up patients to access their treatment history
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 font-bold">3</span>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Unlock with Credits</h4>
              <p className="text-sm text-slate-500">
                Use credits to unlock patient histories for continuity of care
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};