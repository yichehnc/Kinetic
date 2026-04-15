import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Heart, MessageCircle, Eye, Clock, Send, X, TrendingUp, Users, Search } from 'lucide-react';

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

interface Recommendation {
  clinic: string;
  title: string;
  body: string;
  match: number;
  views: number;
  upvotes: number;
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

const RECOMMENDATIONS: Recommendation[] = [
  { clinic: 'c2', title: 'Shoulder - Sub-acute - Dry Needling', body: 'High match to your recent contribution pattern. Southbank Physio has 12 similar cases.', match: 94, views: 220, upvotes: 18 },
  { clinic: 'c3', title: 'Lumbar Spine - Chronic - Exercise Rehab', body: 'Northcote Clinic has 8 relevant chronic LBP cases with strong outcome data.', match: 87, views: 175, upvotes: 15 },
  { clinic: 'c5', title: 'Knee - Post-Operative - Return to Sport', body: 'Fitzroy Physio contributed 5 ACL post-op cases this month, all with RTS outcomes.', match: 79, views: 140, upvotes: 11 },
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
    <div className="max-w-4xl mx-auto px-4 md:px-0 space-y-8 pb-12">
      {/* Main Content - Feed First */}
      <div className="min-w-0">
        <div className="flex gap-1 mb-6 border-b border-slate-200">
          <button 
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'feed' ? 'text-emerald-600 border-emerald-600' : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('feed')}
          >
            Community Feed
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'recs' ? 'text-emerald-600 border-emerald-600' : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('recs')}
          >
            Recommendations
          </button>
        </div>

        {activeTab === 'feed' ? (
          <div className="space-y-4">
            {posts.map(post => {
              const clinic = CLINICS.find(c => c.id === post.clinic)!;
              return (
                <div key={post.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${clinic.color}`}>
                      {clinic.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900">{clinic.name}</div>
                      <div className="text-xs text-slate-500">{clinic.suburb}</div>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.time}
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{post.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{post.body}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-6">
                      <button 
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                          post.liked ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'
                        }`}
                        onClick={() => toggleLike(post.id)}
                      >
                        <Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900">
                        <MessageCircle className="w-4 h-4" />
                        Reply
                      </button>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Eye className="w-4 h-4" />
                        {post.views} views
                      </div>
                    </div>
                    <button 
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-white hover:border-slate-300 transition-all"
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
            <div className="text-sm text-slate-500 mb-4">
              Based on your contribution history — cases similar to your recent submissions.
            </div>
            {RECOMMENDATIONS.map((rec, i) => {
              const clinic = CLINICS.find(c => c.id === rec.clinic)!;
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${clinic.color}`}>
                      {clinic.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900">{clinic.name}</div>
                    </div>
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                      {rec.match}% match
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{rec.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{rec.body}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-6 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        {rec.views} views
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" />
                        {rec.upvotes} upvotes
                      </div>
                    </div>
                    <button 
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-white hover:border-slate-300 transition-all"
                      onClick={() => openDM(rec.clinic)}
                    >
                      Contact Clinic
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Section - Below Feed */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-6">Network Performance Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
            <div className="text-2xl font-bold text-slate-900">38</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Active Clinics</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
            <div className="text-2xl font-bold text-slate-900">412</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Contributions</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
            <div className="text-2xl font-bold text-slate-900">91</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Unlocks (7d)</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
            <div className="text-2xl font-bold text-slate-900">5.2k</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Total Reach</div>
          </div>
        </div>
      </div>

      {/* Top Clinics Section - Nuanced Representation */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Clinic Spotlight</h3>
            <span className="text-[10px] text-slate-400 italic">Updated daily based on network impact</span>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search clinics..."
              value={clinicSearch}
              onChange={(e) => setClinicSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedClinics
            .filter(c => c.name.toLowerCase().includes(clinicSearch.toLowerCase()) || c.suburb.toLowerCase().includes(clinicSearch.toLowerCase()))
            .slice(0, 4).map((clinic, i) => {
            const badges = [
              { label: 'Data Pioneer', color: 'bg-amber-50 text-amber-700 border-amber-100' },
              { label: 'High Impact', color: 'bg-blue-50 text-blue-700 border-blue-100' },
              { label: 'Top Contributor', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
              { label: 'Quality Leader', color: 'bg-purple-50 text-purple-700 border-purple-100' },
            ];
            const badge = badges[i % badges.length];

            return (
              <div 
                key={clinic.id} 
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-emerald-300 transition-all cursor-pointer group"
                onClick={() => openDM(clinic.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${clinic.color}`}>
                    {clinic.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{clinic.name}</div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mb-3">{clinic.suburb}</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-1.5 bg-slate-50 rounded-lg">
                        <div className="text-xs font-bold text-slate-700">{clinic.contributions}</div>
                        <div className="text-[8px] text-slate-400 uppercase">Contribs</div>
                      </div>
                      <div className="text-center p-1.5 bg-slate-50 rounded-lg">
                        <div className="text-xs font-bold text-slate-700">{clinic.upvotes}</div>
                        <div className="text-[8px] text-slate-400 uppercase">Upvotes</div>
                      </div>
                      <div className="text-center p-1.5 bg-slate-50 rounded-lg">
                        <div className="text-xs font-bold text-slate-700">{(clinic.views / 100).toFixed(1)}k</div>
                        <div className="text-[8px] text-slate-400 uppercase">Reach</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <button className="w-full py-3 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
          View All Clinics
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
