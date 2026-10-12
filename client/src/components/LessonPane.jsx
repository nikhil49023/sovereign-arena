import React from 'react';
import { Play, Check, AlertCircle, BookOpen, ExternalLink, GitCommit, Sparkles, Layers } from 'lucide-react';

export default function LessonPane({ 
  lesson, 
  onVerify, 
  isVerifying, 
  testResult, 
  onExportObsidian,
  exportResult
}) {
  if (!lesson) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 p-6 text-xs font-mono">
        Select a track to initialize syllabus.
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#090a0f] border-r border-white/[0.08] overflow-hidden">
      {/* Lesson Header */}
      <div className="p-4 border-b border-white/[0.08] bg-[#0c0e14]/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Layers size={11} className="text-blue-400" />
            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-semibold">
              {lesson.trackTitle}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
              lesson.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              lesson.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {lesson.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1">
              <Sparkles size={10} /> +{lesson.xp} XP
            </span>
          </div>
        </div>
        <h2 className="text-sm font-semibold text-slate-100 tracking-tight">{lesson.title}</h2>
      </div>

      {/* Instructions & Mental Model */}
      <div className="flex-1 p-4 space-y-4 text-xs text-slate-300 leading-relaxed overflow-y-auto font-sans">
        <div className="space-y-3">
          {lesson.instructions.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('###')) {
              return (
                <div key={i} className="pt-2 pb-1 border-b border-white/[0.06]">
                  <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
                    <span className="w-1 h-3 bg-blue-500 rounded-sm"></span>
                    {paragraph.replace('###', '').trim()}
                  </h3>
                </div>
              );
            }
            return <p key={i} className="text-slate-300 leading-normal">{paragraph}</p>;
          })}
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div className={`mt-4 p-3.5 rounded-md border text-xs font-mono transition-all duration-150 ${
            testResult.success 
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center justify-between font-semibold mb-2">
              <span className="flex items-center gap-1.5 text-[11px]">
                {testResult.success ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={14} className="text-rose-400" />
                )}
                {testResult.success ? 'VERIFICATION PASSED' : 'VERIFICATION FAILED'}
              </span>
              {testResult.gitCommit && (
                <span className="flex items-center gap-1 text-[10px] text-slate-300 bg-white/[0.06] px-2 py-0.5 rounded border border-white/[0.1] font-mono">
                  <GitCommit size={11} className="text-blue-400" /> {testResult.gitCommit}
                </span>
              )}
            </div>
            <pre className="whitespace-pre-wrap overflow-x-auto text-[11px] max-h-36 bg-black/40 p-2.5 rounded border border-white/[0.04] text-slate-300 leading-relaxed font-mono">
              {testResult.output}
            </pre>
          </div>
        )}

        {/* Obsidian Export Confirmation */}
        {exportResult && exportResult.success && (
          <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-md text-xs text-purple-200 flex items-center justify-between font-mono">
            <span>Note synced to Career_Roadmap</span>
            <a 
              href={exportResult.obsidianUri} 
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 underline text-[11px]"
            >
              Open in Obsidian <ExternalLink size={11} />
            </a>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3 border-t border-white/[0.08] bg-[#0c0e14]/80 flex items-center space-x-2.5">
        <button
          onClick={onExportObsidian}
          className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-md transition flex items-center gap-1.5 active:scale-[0.98]"
          title="Save verified note into Career_Roadmap vault"
        >
          <BookOpen size={13} className="text-slate-400" />
          <span>Sync Note</span>
        </button>

        <button
          onClick={onVerify}
          disabled={isVerifying}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition active:scale-[0.98] ${
            isVerifying 
              ? 'bg-blue-600/50 text-white cursor-wait' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
          }`}
        >
          <Play size={12} className={isVerifying ? 'animate-spin' : 'fill-current'} />
          <span>{isVerifying ? 'Running Test Suite...' : 'Run Verification'}</span>
          <kbd className="text-[10px] bg-black/30 text-blue-200 px-1 py-0.2 rounded font-mono ml-1 border border-white/10">
            Ctrl ↵
          </kbd>
        </button>
      </div>
    </div>
  );
}
