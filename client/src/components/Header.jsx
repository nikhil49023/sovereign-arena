import React from 'react';
import { Terminal, ChevronDown, Zap, Award, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Header({ 
  tracks, 
  currentTrack, 
  onSelectTrack, 
  profile, 
  onOpenVault 
}) {
  return (
    <header className="h-11 border-b border-white/[0.08] bg-[#0c0e14] flex items-center justify-between px-4 select-none shrink-0 z-20">
      {/* Brand & Track Navigation */}
      <div className="flex items-center space-x-4">
        {/* Minimalist Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="w-5 h-5 rounded-[5px] bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Terminal size={12} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-xs tracking-wider text-slate-200 font-mono">
            ARENA
          </span>
          <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.2 bg-white/[0.04] rounded border border-white/[0.06]">
            v1.0
          </span>
        </div>

        {/* Track Selector with Chevron */}
        <div className="flex items-center space-x-2 pl-3 border-l border-white/[0.08]">
          <span className="text-[11px] text-slate-500 font-medium">Domain:</span>
          <div className="relative flex items-center">
            <select
              value={currentTrack?.id || ''}
              onChange={(e) => {
                const selected = tracks.find(t => t.id === e.target.value);
                if (selected) onSelectTrack(selected);
              }}
              className="appearance-none bg-[#131722] hover:bg-[#181d2b] border border-white/[0.08] text-slate-200 text-xs font-medium rounded-md pl-2.5 pr-7 py-1 focus:outline-none focus:border-blue-500/60 cursor-pointer transition"
            >
              {tracks.map(t => (
                <option key={t.id} value={t.id} className="bg-[#0c0e14] text-slate-200">
                  {t.title}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Profile Metrics & Actions */}
      <div className="flex items-center space-x-3 text-xs">
        {/* Streak Counter */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-500/[0.08] border border-amber-500/20 text-amber-300 font-mono text-[11px]">
          <Zap size={12} className="text-amber-400 fill-amber-400/20" />
          <span>{profile?.streak || 1}D STREAK</span>
        </div>

        {/* XP Counter */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-500/[0.08] border border-blue-500/20 text-blue-300 font-mono text-[11px]">
          <Award size={12} className="text-blue-400" />
          <span>{profile?.xp || 0} XP</span>
        </div>

        {/* Rank Title */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300 text-[11px] font-mono">
          <ShieldCheck size={12} className="text-purple-400" />
          <span className="uppercase text-[10px] tracking-wider font-semibold">{profile?.rank_title || 'Cadet'}</span>
        </div>

        {/* Obsidian Vault Trigger */}
        <button
          onClick={onOpenVault}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition text-[11px]"
          title="Browse Obsidian Career Vault"
        >
          <BookOpen size={12} className="text-purple-400" />
          <span>Vault Notes</span>
        </button>

        {/* GitHub Source Link */}
        <a
          href="https://github.com/nikhil49023/sovereign-arena"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
          title="View GitHub Repository"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
      </div>
    </header>
  );
}
