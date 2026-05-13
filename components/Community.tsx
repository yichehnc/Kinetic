import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Heart, Eye, Clock, Send, X, TrendingUp, Search, ArrowRight, Zap } from 'lucide-react';

interface Clinic {
  id: string;
  initials: string;
  color: string;
  name: string;
  suburb: string;
  contributions: number;
  views: number;
  upvotes: number;
}

interface Post {
  id: string;
  clinic: string;
  time: string;
  title: string;
  body: string;
  tags: string[];
  views: number;
  likes: number;
  liked: boolean;
}

interface Message {
  type: 'in' | 'out';
  text: string;
}

const CLINICS: Clinic[] = [
  { id: 'c1', initials: 'CP', color: 'bg-[#E1F5EE] text-[#0F6E56]', name: 'Cremorne Physio', suburb: 'Richmond', contributions: 47, views: 1240, upvotes: 89 },
  { id: 'c2', initials: 'SP', color: 'bg-[#E6F1FB] text-[#185FA5]', name: 'Southbank Physio', suburb: 'Southbank', contributions: 38, views: 980, upvotes: 71 },
  { id: 'c3', initials: 'NC', color: 'bg-[#EEEDFE] text-[#534AB7]', name: 'Northcote Clinic', suburb: 'Northcote', contributions: 31, views: 820, upvotes: 62 },
  { id: 'c4', initials: 'BH', color: 'bg-[#FAEEDA] text-[#854F0B]', name: 'Brighton Health', suburb: 'Brighton', contributions: 24, views: 610, upvotes: 48 },
  { id: 'c5', initials: 'FP', color: 'bg-[#FAECE7] text-[#993C1D]', name: 'Fitzroy Physio', suburb: 'Fitzroy', contributions: 18, views: 430, upvotes: 34 },
  { id: 'c6', initials: 'EW', color: 'bg-[#E1F5EE] text-[#0F6E56]', name: 'Elwood Wellness', suburb: 'Elwood', contributions: 14, views: 310, upvotes: 27 },
];

const INITIAL_POSTS: Post[] = [
  { id: 'p1', clinic: 'c1', time: '2h ago', title: "Rotator cuff — what's actually working in 2026", body: "After 47 contributions, the clearest pattern we're seeing: dry needling + graded loading outperforms manual-only in sub-acute presentations. Interested in comparing notes.", tags: ['Shoulder', 'Sub-acute', 'Dry needling'], views: 312, likes: 28, liked: false },
  { id: 'p2', clinic: 'c3', time: '5h ago', title: 'Chronic LBP: motor control vs strength emphasis', body: 'Noticing a split in our outcomes data — motor control protocols showing stronger results for younger cohort (<40), strength-biased for older. Anyone seeing similar?', tags: ['Lumbar spine', 'Chronic', 'Exercise rehab'], views: 198, likes: 19, liked: false },
  { id: 'p3', clinic: 'c2', time: '1d ago', title: 'Post-op ACL: return-to-sport timeline variance', body: "We've been contributing post-op cases for 6 months. The variance in RTS timelines is striking — graft type seems to matter far more than rehab stage classification.", tags: ['Knee', 'Post-operative', 'Return to sport'], views: 441, likes: 36, liked: false },
  { id: 'p4', clinic: 'c4', time: '2d ago', title: 'Ankle sprains: taping vs bracing for grade II', body: 'Quick observation from recent grade II lateral ankle cases — functional bracing showing better compliance and comparable outcomes to taping at 6 weeks.', tags: ['Ankle/Foot', 'Acute'], views: 167, likes: 14, liked: false },
];

interface Recommendation {
  clinic: string;
  region: string;
  stage: string;
  protocol: string;
  matchReasons: string[];
  cases: number;
  resolutionRate: number;
  match: number;
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    clinic: 'c2',
    region: 'Shoulder',
    stage: 'Sub-acute',
    protocol: 'Dry Needling',
    matchReasons: ['Same body region', 'Same rehab stage', 'Overlapping protocol'],
    cases: 12,
    resolutionRate: 82,
    match: 94,
  },
  {
    clinic: 'c3',
    region: 'Lumbar Spine',
    stage: 'Chronic',
    protocol: 'Exercise Rehab',
    matchReasons: ['Same condition profile', 'Matching complaint type', 'Similar patient cohort'],
    cases: 8,
    resolutionRate: 76,
    match: 87,
  },
  {
    clinic: 'c5',
    region: 'Knee',
    stage: 'Post-operative',
    protocol: 'Return to Sport',
    matchReasons: ['Same body region', 'Post-op overlap', 'RTS outcome data'],
    cases: 5,
    resolutionRate: 71,
    match: 79,
  },
];

export const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'recs'>('feed');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [currentDMClinic, setCurrentDMClinic] = useState<Clinic | null>(null);
  const [dmMessages, setDmMessages] = useState<Record<string, Message[]>>({});
  const [dmInput, setDmInput] = useState('');
  const [clinicSearch, setClinicSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [dmMessages, currentDMClinic]);

  const toggleLike = (pid: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === pid) {
        return {
          ...p,
          liked: !p.liked,
          likes: p.liked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  const openDM = (clinicId: string) => {
    const clinic = CLINICS.find(c => c.id === clinicId);
    if (clinic) {
      setCurrentDMClinic(clinic);
      if (!dmMessages[clinicId]) {
        setDmMessages(prev => ({
          ...prev,
          [clinicId]: [{ type: 'in', text: `Hi! Thanks for reaching out via Kinetic Network.` }]
        }));
      }
    }
  };

  const closeDM = () => {
    setCurrentDMClinic(null);
  };

  const sendDM = () => {
    if (!dmInput.trim() || !currentDMClinic) return;
    
    const clinicId = currentDMClinic.id;
    const newMessage: Message = { type: 'out', text: dmInput.trim() };
    
    setDmMessages(prev => ({
      ...prev,
      [clinicId]: [...(prev[clinicId] || []), newMessage]
    }));
    setDmInput('');

    setTimeout(() => {
      setDmMessages(prev => ({
        ...prev,
        [clinicId]: [...(prev[clinicId] || []), { type: 'in', text: "Thanks for the message — we'll get back to you shortly." }]
      }));
    }, 900);
  };

  const sortedClinics = [...CLINICS].sort((a, b) => b.contributions - a.contributions);

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Main Content - Feed First */}
      <div className="min-w-0">
        <div className="flex gap-4 sm:gap-8 mb-8 border-b border-slate-200">
          <button 
            className={`pb-4 text-sm font-brand font-bold transition-all border-b-2 -mb-px tracking-tight ${
              activeTab === 'feed' ? 'text-slate-900 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
            onClick={() => setActiveTab('feed')}
          >
            Insights Feed
          </button>
          <button 
            className={`pb-4 text-sm font-brand font-bold transition-all border-b-2 -mb-px tracking-tight ${
              activeTab === 'recs' ? 'text-slate-900 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
            onClick={() => setActiveTab('recs')}
          >
            Clinical Match
          </button>
        </div>

        {activeTab === 'feed' ? (
          <div className="space-y-6">
            {posts.map(post => {
              const clinic = CLINICS.find(c => c.id === post.clinic)!;
              return (
                <div key={post.id} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:scale-[1.015] hover:bg-white/85 hover:border-white transition-all duration-500 group">
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-brand font-bold shadow-sm transition-transform group-hover:scale-110 duration-500 ${clinic.color}`}>
                      {clinic.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-brand font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">{clinic.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{clinic.suburb}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-md border border-white/50">
                      <Clock className="w-3 h-3" />
                      {post.time}
                    </div>
                  </div>
                  <h4 className="text-xl font-brand font-extrabold text-slate-900 mb-3 tracking-tight relative z-10">{post.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium relative z-10">{post.body}</p>
                  <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/40 text-slate-600 text-[10px] font-bold rounded-lg border border-white/60 uppercase tracking-wider backdrop-blur-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-900/5 relative z-10">
            <div className="flex flex-wrap items-center gap-4 sm:gap-8">
              <button 
                className={`flex items-center gap-2 text-xs font-bold transition-colors ${
                  post.liked ? 'text-rose-500' : 'text-slate-400 hover:text-slate-900'
                }`}
                onClick={() => toggleLike(post.id)}
              >
                <Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
                {post.likes}
              </button>
              <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900">
                <MessageSquare className="w-4 h-4" />
                Reply
              </button>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Eye className="w-4 h-4" />
                {post.views}
              </div>
            </div>
            <button 
              className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-brand font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 mt-4 sm:mt-0"
              onClick={() => openDM(post.clinic)}
            >
              Contact Clinic
            </button>
          </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header bar */}
            <div className="flex items-center gap-2 mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-xs font-bold text-emerald-700">
                {RECOMMENDATIONS.length} high-confidence matches based on your recent contributions
              </p>
            </div>

            {RECOMMENDATIONS.map((rec, i) => {
              const clinic = CLINICS.find(c => c.id === rec.clinic)!;
              const matchColor =
                rec.match >= 90 ? 'bg-emerald-500' :
                rec.match >= 80 ? 'bg-blue-500' : 'bg-amber-400';
              const matchTextColor =
                rec.match >= 90 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                rec.match >= 80 ? 'text-blue-700 bg-blue-50 border-blue-200' :
                                  'text-amber-700 bg-amber-50 border-amber-200';

              return (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200">
                  {/* Match score bar — top edge */}
                  <div className="h-1 w-full bg-slate-100">
                    <div className={`h-full ${matchColor} transition-all duration-700`} style={{ width: `${rec.match}%` }} />
                  </div>

                  <div className="p-5">
                    {/* Top row: clinic + score */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-brand font-bold shrink-0 ${clinic.color}`}>
                          {clinic.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{clinic.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{clinic.suburb}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border shrink-0 ${matchTextColor}`}>
                        {rec.match}% match
                      </span>
                    </div>

                    {/* Case summary */}
                    <div className="flex items-center gap-4 mb-4 p-3 bg-slate-50 rounded-xl">
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-900">{rec.cases}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cases</p>
                      </div>
                      <div className="w-px h-8 bg-slate-200 shrink-0" />
                      <div className="text-center">
                        <p className="text-lg font-bold text-emerald-600">{rec.resolutionRate}%</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Resolution</p>
                      </div>
                      <div className="w-px h-8 bg-slate-200 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{rec.region} · {rec.stage}</p>
                        <p className="text-[10px] text-slate-500 truncate">{rec.protocol}</p>
                      </div>
                    </div>

                    {/* Why it matched */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {rec.matchReasons.map(reason => (
                        <span key={reason} className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                          {reason}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => openDM(rec.clinic)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
                      >
                        Request data exchange <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => openDM(rec.clinic)}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50 transition-colors"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Section - Refined Glass Dark */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden group hover:scale-[1.005] transition-all duration-700">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
          <TrendingUp className="w-32 h-32 text-white" />
        </div>
        <div className="relative z-10">
          <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-10">Network Growth Metrics</h3>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 sm:gap-8">
            <div className="text-left border-l border-white/10 pl-4 sm:pl-6">
              <div className="text-2xl sm:text-3xl font-brand font-extrabold text-white">38</div>
              <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-2">Verified Units</div>
            </div>
            <div className="text-left border-l border-white/10 pl-4 sm:pl-6">
              <div className="text-2xl sm:text-3xl font-brand font-extrabold text-white">412</div>
              <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-2">Safe Deposits</div>
            </div>
            <div className="text-left border-l border-white/10 pl-4 sm:pl-6">
              <div className="text-2xl sm:text-3xl font-brand font-extrabold text-white">91</div>
              <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-2">Active Unlocks</div>
            </div>
            <div className="text-left border-l border-white/10 pl-4 sm:pl-6">
              <div className="text-2xl sm:text-3xl font-brand font-extrabold text-emerald-400">5.2k</div>
              <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-2">Global Reach</div>
            </div>
          </div>
        </div>
      </div>

      {/* Clinic Spotlight Section */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Clinic Spotlight</h3>
            <span className="text-[10px] text-slate-400 italic">Leaderboard reflecting clinical impact score</span>
          </div>
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <input 
              type="text"
              placeholder="Search by clinic or locality..."
              value={clinicSearch}
              onChange={(e) => setClinicSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all shadow-sm"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedClinics
            .filter(c => c.name.toLowerCase().includes(clinicSearch.toLowerCase()) || c.suburb.toLowerCase().includes(clinicSearch.toLowerCase()))
            .slice(0, 4).map((clinic, i) => {
            const badges = [
              { label: 'Network Alpha', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
              { label: 'High Impact', color: 'bg-blue-50 text-blue-700 border-blue-100' },
              { label: 'Top Contributor', color: 'bg-slate-900 text-white border-slate-800' },
              { label: 'Quality Leader', color: 'bg-purple-50 text-purple-700 border-purple-100' },
            ];
            const badge = badges[i % badges.length];

            return (
              <div 
                key={clinic.id} 
                className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 cursor-pointer group hover:shadow-2xl hover:scale-[1.015] hover:bg-white/85 hover:border-white"
                onClick={() => openDM(clinic.id)}
              >
                <div className="flex items-start gap-5 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-brand font-bold flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 ${clinic.color}`}>
                    {clinic.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-base font-brand font-extrabold text-slate-900 truncate group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{clinic.name}</div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{clinic.suburb}</span>
                      <span className="text-slate-200">•</span>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-widest transition-colors ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center py-2 bg-white/40 rounded-xl border border-white/50 backdrop-blur-sm group-hover:bg-white/60 transition-colors">
                        <div className="text-sm font-brand font-bold text-slate-900">{clinic.contributions}</div>
                        <div className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">Deposits</div>
                      </div>
                      <div className="text-center py-2 bg-white/40 rounded-xl border border-white/50 backdrop-blur-sm group-hover:bg-white/60 transition-colors">
                        <div className="text-sm font-brand font-bold text-slate-900">{clinic.upvotes}</div>
                        <div className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">Upvotes</div>
                      </div>
                      <div className="text-center py-2 bg-white/40 rounded-xl border border-white/50 backdrop-blur-sm group-hover:bg-white/60 transition-colors">
                        <div className="text-sm font-brand font-bold text-slate-900">{(clinic.views / 100).toFixed(1)}k</div>
                        <div className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">Impact</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-900/5">
                      <button 
                        className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg active:scale-95"
                        onClick={() => openDM(clinic.id)}
                      >
                        Contact Clinic
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <button className="w-full py-6 text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.3em] font-brand">
          Browse Full Directory
        </button>
      </div>

      {/* DM Overlay */}
      {currentDMClinic && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-end justify-end p-6">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-[360px] h-[500px] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${currentDMClinic.color}`}>
                {currentDMClinic.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">{currentDMClinic.name}</div>
                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Online
                </div>
              </div>
              <button 
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={closeDM}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {(dmMessages[currentDMClinic.id] || []).map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.type === 'out' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    msg.type === 'out' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Type a message..."
                  value={dmInput}
                  onChange={(e) => setDmInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendDM()}
                />
                <button 
                  className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  onClick={sendDM}
                  disabled={!dmInput.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
