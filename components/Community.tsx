import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Heart, Eye, Send, X, Search, Upload, Unlock, Award } from 'lucide-react';

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

type ActivityType = 'contribution' | 'unlock' | 'milestone';

interface Activity {
  id: string;
  type: ActivityType;
  clinicId: string | null;
  region: string;
  time: string;
  isYours: boolean;
  detail: string;
}

const ACTIVITY_FEED: Activity[] = [
  { id: 'a1',  type: 'contribution', clinicId: 'c1', region: 'Shoulder',       time: '14 min ago', isYours: true,  detail: 'Sub-acute · dry needling + graded loading · 6-week protocol' },
  { id: 'a2',  type: 'unlock',       clinicId: 'c2', region: 'Lumbar Spine',   time: '31 min ago', isYours: false, detail: '4-episode history · chronic presentation · motor control focus' },
  { id: 'a3',  type: 'contribution', clinicId: 'c3', region: 'Knee',           time: '1h ago',     isYours: false, detail: 'Post-op ACL · return-to-sport milestone at 9 months' },
  { id: 'a4',  type: 'unlock',       clinicId: 'c1', region: 'Shoulder',       time: '2h ago',     isYours: true,  detail: '2-episode history · acute rotator cuff · manual therapy led' },
  { id: 'a5',  type: 'milestone',    clinicId: null,  region: '',              time: '3h ago',     isYours: false, detail: 'The network crossed 400 clinical contributions — a new milestone 🎉' },
  { id: 'a6',  type: 'contribution', clinicId: 'c4', region: 'Ankle/Foot',     time: '4h ago',     isYours: false, detail: 'Grade II lateral sprain · functional bracing · 6-week outcome' },
  { id: 'a7',  type: 'unlock',       clinicId: 'c5', region: 'Cervical Spine', time: '5h ago',     isYours: false, detail: '3-episode history · chronic headache · manipulation + exercise' },
  { id: 'a8',  type: 'contribution', clinicId: 'c2', region: 'Hip',            time: '7h ago',     isYours: false, detail: 'FAI post-op · strength-biased rehab · full RTW at 12 weeks' },
  { id: 'a9',  type: 'contribution', clinicId: 'c1', region: 'Lumbar Spine',   time: '9h ago',     isYours: true,  detail: 'Chronic LBP · strength emphasis · 8-week structured program' },
  { id: 'a10', type: 'unlock',       clinicId: 'c6', region: 'Knee',           time: '12h ago',    isYours: false, detail: '5-episode history · patellofemoral · load management protocol' },
];

export const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'activity'>('feed');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [currentDMClinic, setCurrentDMClinic] = useState<Clinic | null>(null);
  const [dmMessages, setDmMessages] = useState<Record<string, Message[]>>({});
  const [dmInput, setDmInput] = useState('');
  const [clinicSearch, setClinicSearch] = useState('');
  const [showAllClinics, setShowAllClinics] = useState(false);
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Main Content - Feed First */}
      <div className="min-w-0">
        <div className="flex gap-6 mb-5 border-b border-line">
          <button
            className={`pb-2.5 text-[12.5px] transition-colors duration-[120ms] border-b-2 -mb-px ${
              activeTab === 'feed' ? 'text-ink border-accent font-[550]' : 'text-ink-4 border-transparent font-[450] hover:text-ink'
            }`}
            onClick={() => setActiveTab('feed')}
          >
            Insights feed
          </button>
          <button
            className={`pb-2.5 text-[12.5px] transition-colors duration-[120ms] border-b-2 -mb-px ${
              activeTab === 'activity' ? 'text-ink border-accent font-[550]' : 'text-ink-4 border-transparent font-[450] hover:text-ink'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            Network activity
          </button>
        </div>

        {activeTab === 'feed' ? (
          <div className="space-y-4">
            {posts.map(post => {
              const clinic = CLINICS.find(c => c.id === post.clinic)!;
              return (
                <div key={post.id} className="bg-surface-card border border-line rounded-lg px-[18px] py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-brand font-bold ${clinic.color}`}>
                      {clinic.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-semibold text-ink">{clinic.name}</div>
                      <div className="text-[11px] text-ink-5">{clinic.suburb}</div>
                    </div>
                    <div className="text-[11px] text-ink-5">{post.time}</div>
                  </div>
                  <h4 className="text-[13.5px] font-semibold text-ink mb-1.5">{post.title}</h4>
                  <p className="text-[12.5px] text-ink-3 leading-[1.5] mb-3">{post.body}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-px bg-accent-tint text-accent-text text-[10.5px] font-medium rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-line-soft">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <button
                        className={`flex items-center gap-1.5 text-[11.5px] font-medium transition-colors duration-[120ms] ${
                          post.liked ? 'text-rose-500' : 'text-ink-4 hover:text-ink'
                        }`}
                        onClick={() => toggleLike(post.id)}
                      >
                        <Heart className={`w-3.5 h-3.5 ${post.liked ? 'fill-current' : ''}`} strokeWidth={1.8} />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink-4 hover:text-ink transition-colors duration-[120ms]">
                        <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.8} />
                        Reply
                      </button>
                      <div className="flex items-center gap-1.5 text-[11.5px] text-ink-5">
                        <Eye className="w-3.5 h-3.5" strokeWidth={1.8} />
                        {post.views}
                      </div>
                    </div>
                    <button
                      className="text-xs font-medium text-accent-text border border-accent-line bg-accent-tint2 hover:bg-accent-tint rounded-md px-2.5 py-[5px] transition-colors duration-150"
                      onClick={() => openDM(post.clinic)}
                    >
                      Contact clinic
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface-card border border-line rounded-lg">
            {/* Feed header */}
            <div className="flex items-center justify-between px-[18px] py-[13px] border-b border-line-soft">
              <p className="text-[12.5px] font-semibold text-ink">Live across the network</p>
              <span className="flex items-center gap-1.5 text-[11px] text-ink-4">
                <span className="w-1.5 h-1.5 bg-positive rounded-full motion-safe:animate-pulse" />
                Live
              </span>
            </div>

            {ACTIVITY_FEED.map((activity, idx) => {
              const clinic = activity.clinicId ? CLINICS.find(c => c.id === activity.clinicId) : null;
              const actorLabel = activity.isYours ? 'You' : (clinic?.name ?? 'Network');

              const iconConfig = {
                contribution: { bg: 'bg-positive-tint', icon: <Upload className="w-3.5 h-3.5 text-positive-text" strokeWidth={1.8} /> },
                unlock:       { bg: 'bg-accent-tint',   icon: <Unlock className="w-3.5 h-3.5 text-accent" strokeWidth={1.8} /> },
                milestone:    { bg: 'bg-accent-tint',   icon: <Award  className="w-3.5 h-3.5 text-accent" strokeWidth={1.8} /> },
              }[activity.type];

              const actionLabel =
                activity.type === 'contribution' ? 'contributed a record' :
                activity.type === 'unlock'       ? 'accessed a history'   : '';

              const rowBorder = idx < ACTIVITY_FEED.length - 1 ? 'border-b border-line-softer' : '';

              if (activity.type === 'milestone') {
                return (
                  <div key={activity.id} className={`flex items-center gap-3 px-[18px] py-3 ${rowBorder}`}>
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${iconConfig.bg}`}>
                      {iconConfig.icon}
                    </div>
                    <p className="flex-1 text-[12.5px] font-medium text-accent-deep leading-snug">{activity.detail}</p>
                    <span className="text-[11px] text-ink-5 whitespace-nowrap shrink-0">{activity.time}</span>
                  </div>
                );
              }

              return (
                <div
                  key={activity.id}
                  className={`flex items-start gap-3 px-[18px] py-3 ${rowBorder} ${activity.isYours ? 'bg-accent-tint2/60' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${iconConfig.bg}`}>
                    {iconConfig.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[12.5px] font-semibold text-ink truncate">
                        {actorLabel}
                        <span className="font-normal text-ink-4"> · {actionLabel}</span>
                      </span>
                      <span className="text-[11px] text-ink-5 whitespace-nowrap shrink-0">{activity.time}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10.5px] font-medium px-1.5 py-px rounded bg-accent-tint text-accent-text shrink-0">
                        {activity.region}
                      </span>
                      <span className="text-[11.5px] text-ink-4 leading-snug truncate">{activity.detail}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Network growth metrics */}
      <div className="bg-surface-card border border-line rounded-lg px-[18px] py-4">
        <h3 className="text-[12.5px] font-semibold text-ink mb-4">Network growth metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="font-brand font-bold text-2xl tracking-[-0.02em] text-ink">38</div>
            <div className="text-[11.5px] text-ink-5 mt-1">Verified units</div>
          </div>
          <div>
            <div className="font-brand font-bold text-2xl tracking-[-0.02em] text-ink">412</div>
            <div className="text-[11.5px] text-ink-5 mt-1">Contributions</div>
          </div>
          <div>
            <div className="font-brand font-bold text-2xl tracking-[-0.02em] text-ink">91</div>
            <div className="text-[11.5px] text-ink-5 mt-1">Active unlocks</div>
          </div>
          <div>
            <div className="font-brand font-bold text-2xl tracking-[-0.02em] text-positive-text">5.2k</div>
            <div className="text-[11.5px] text-ink-5 mt-1">Global reach</div>
          </div>
        </div>
      </div>

      {/* Clinic Spotlight Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[12.5px] font-semibold text-ink">Clinic spotlight</h3>
            <span className="text-[11px] text-ink-5">Leaderboard reflecting clinical impact score</span>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-5" strokeWidth={1.8} />
            <input
              type="text"
              placeholder="Search by clinic or locality…"
              value={clinicSearch}
              onChange={(e) => setClinicSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-card border border-line rounded-md text-xs focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors duration-150"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedClinics
            .filter(c => c.name.toLowerCase().includes(clinicSearch.toLowerCase()) || c.suburb.toLowerCase().includes(clinicSearch.toLowerCase()))
            .slice(0, showAllClinics ? 6 : 4).map((clinic, i) => {
            const badges = ['Network alpha', 'High impact', 'Top contributor', 'Quality leader'];
            const badge = badges[i % badges.length];

            return (
              <div
                key={clinic.id}
                className="bg-surface-card border border-line rounded-lg px-[18px] py-4 transition-colors duration-150 hover:border-[#D9D9DE] cursor-pointer"
                onClick={() => openDM(clinic.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center text-[11px] font-brand font-bold flex-shrink-0 ${clinic.color}`}>
                    {clinic.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-ink truncate">{clinic.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5 mb-3">
                      <span className="text-[11px] text-ink-5">{clinic.suburb}</span>
                      <span className="text-ink-6">·</span>
                      <span className="text-[10.5px] font-medium px-1.5 py-px rounded bg-accent-tint text-accent-text">
                        {badge}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center py-1.5 bg-surface-sidebar rounded-md border border-line-soft">
                        <div className="text-[13px] font-brand font-bold text-ink">{clinic.contributions}</div>
                        <div className="text-[10.5px] text-ink-5">Deposits</div>
                      </div>
                      <div className="text-center py-1.5 bg-surface-sidebar rounded-md border border-line-soft">
                        <div className="text-[13px] font-brand font-bold text-ink">{clinic.upvotes}</div>
                        <div className="text-[10.5px] text-ink-5">Upvotes</div>
                      </div>
                      <div className="text-center py-1.5 bg-surface-sidebar rounded-md border border-line-soft">
                        <div className="text-[13px] font-brand font-bold text-ink">{(clinic.views / 100).toFixed(1)}k</div>
                        <div className="text-[10.5px] text-ink-5">Impact</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-line-soft">
                      <button
                        className="w-full text-xs font-medium text-accent-text border border-accent-line bg-accent-tint2 hover:bg-accent-tint rounded-md py-[6px] transition-colors duration-150"
                        onClick={() => openDM(clinic.id)}
                      >
                        Contact clinic
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="w-full py-3 text-[11.5px] font-medium text-ink-5 hover:text-ink transition-colors duration-150"
          onClick={() => setShowAllClinics(prev => !prev)}
        >
          {showAllClinics ? 'Show less' : 'Browse full directory'}
        </button>
      </div>

      {/* DM Overlay */}
      {currentDMClinic && (
        <div className="fixed inset-0 bg-ink/40 z-[60] flex items-end justify-end p-6">
          <div className="bg-surface-card border border-line rounded-lg w-full max-w-[360px] h-[500px] flex flex-col shadow-[0_8px_24px_rgba(0,0,0,.12)]">
            <div className="p-4 border-b border-line-soft flex items-center gap-3">
              <div className={`w-9 h-9 rounded-md flex items-center justify-center text-[11px] font-brand font-bold ${currentDMClinic.color}`}>
                {currentDMClinic.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold text-ink truncate">{currentDMClinic.name}</div>
                <div className="text-[11px] text-ink-4 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-positive rounded-full motion-safe:animate-pulse" />
                  Online
                </div>
              </div>
              <button
                className="p-1.5 text-ink-5 hover:text-ink transition-colors duration-150"
                onClick={closeDM}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-page">
              {(dmMessages[currentDMClinic.id] || []).map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.type === 'out' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-3 py-2 rounded-lg text-xs leading-[1.45] ${
                    msg.type === 'out'
                      ? 'bg-accent text-white rounded-tr-none'
                      : 'bg-surface-card text-ink-2 border border-line rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-line-soft bg-surface-card rounded-b-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-surface-sidebar border border-line rounded-md px-3 py-2 text-xs focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors duration-150"
                  placeholder="Type a message…"
                  value={dmInput}
                  onChange={(e) => setDmInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendDM()}
                />
                <button
                  className="p-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors duration-150 disabled:opacity-50"
                  onClick={sendDM}
                  disabled={!dmInput.trim()}
                >
                  <Send className="w-4 h-4" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
