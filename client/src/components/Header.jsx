import React from 'react';
import { Flame, Trophy, BookOpen, Terminal as TerminalIcon } from 'lucide-react';

export default function Header({ 
  tracks, 
  currentTrack, 
  onSelectTrack, 
  profile, 
  onOpenVault 
}) {
  return (
    <header className="h-12 border-b border-[#1e2638] bg-[#0d111a] flex items-center justify-between px-4 select-none shrink-0">
      {/* Brand & Track Selector */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-500/20">
            ⚔️
          </div>
          <span className="font-bold text-xs tracking-wider uppercase text-slate-100">
            SOVEREIGN ARENA
          </span>
        </div>

        {/* Track Dropdown */}
        <div className="flex items-center space-x-1 pl-3 border-l border-[#1e2638]">
          <span className="text-[11px] text-slate-400 font-medium">Track:</span>
          <select
            value={currentTrack?.id || ''}
            onChange={(e) => {
              const selected = tracks.find(t => t.id === e.target.value);
              if (selected) onSelectTrack(selected);
            }}
            className="bg-[#151b28] border border-[#232d42] text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {tracks.map(t => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Profile & Controls */}
      <div className="flex items-center space-x-4">
        {/* Streak Counter */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs font-semibold" title="Daily Active Streak">
          <Flame size={14} className="text-amber-400 animate-bounce" />
          <span>{profile?.streak || 1} Days</span>
        </div>

        {/* XP Counter */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-blue-950/40 border border-blue-800/40 text-blue-300 text-xs font-semibold" title="Total Accumulated XP">
          <Trophy size={14} className="text-blue-400" />
          <span>{profile?.xp || 0} XP</span>
        </div>

        {/* Rank Title */}
        <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
          {profile?.rank_title || 'Cadet'}
        </span>

        {/* Obsidian Vault Trigger */}
        <button
          onClick={onOpenVault}
          className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs text-slate-300 bg-[#161d2b] hover:bg-[#20293d] border border-[#252f44] transition"
          title="Open Obsidian Vault Browser"
        >
          <BookOpen size={13} className="text-purple-400" />
          <span>Vault</span>
        </button>

        {/* GitHub Link */}
        <a
          href="https://github.com/nikhil49023/sovereign-arena"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1a2130] transition"
          title="View GitHub Repository"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
      </div>
    </header>
  );
}
