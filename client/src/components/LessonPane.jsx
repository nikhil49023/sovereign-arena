import React from 'react';
import { Play, CheckCircle2, AlertTriangle, BookOpen, ExternalLink, Sparkles, GitCommit } from 'lucide-react';

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
      <div className="w-full h-full flex items-center justify-center text-slate-500 p-6 text-sm">
        Select a track and drill to begin.
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0d14] border-r border-[#1e2638] overflow-y-auto">
      {/* Lesson Header */}
      <div className="p-5 border-b border-[#1e2638] bg-[#0d111a]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono tracking-wider uppercase text-blue-400 font-semibold">
            {lesson.trackTitle}
          </span>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
              lesson.difficulty === 'Easy' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' :
              lesson.difficulty === 'Medium' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40' :
              'bg-rose-950/60 text-rose-400 border border-rose-800/40'
            }`}>
              {lesson.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-950/60 text-blue-300 border border-blue-800/40 flex items-center gap-1">
              <Sparkles size={11} /> +{lesson.xp} XP
            </span>
          </div>
        </div>
        <h2 className="text-lg font-bold text-slate-100">{lesson.title}</h2>
      </div>

      {/* Instructions / Mental Model */}
      <div className="flex-1 p-5 space-y-4 text-sm text-slate-300 leading-relaxed overflow-y-auto font-sans">
        <div className="prose prose-invert max-w-none text-slate-300 text-sm">
          {lesson.instructions.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('###')) {
              return (
                <h3 key={i} className="text-base font-semibold text-slate-100 mt-4 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-500 rounded"></span>
                  {paragraph.replace('###', '').trim()}
                </h3>
              );
            }
            return <p key={i} className="mb-3 text-slate-300">{paragraph}</p>;
          })}
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div className={`mt-4 p-4 rounded-lg border text-xs font-mono transition-all duration-200 ${
            testResult.success 
              ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300' 
              : 'bg-rose-950/40 border-rose-700/50 text-rose-300'
          }`}>
            <div className="flex items-center justify-between font-semibold mb-2">
              <span className="flex items-center gap-2">
                {testResult.success ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-rose-400" />}
                {testResult.success ? 'VERIFICATION PASSED!' : 'ASSERTION / COMPILER FAILURE'}
              </span>
              {testResult.gitCommit && (
                <span className="flex items-center gap-1 text-[11px] text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/50">
                  <GitCommit size={12} /> Commit {testResult.gitCommit}
                </span>
              )}
            </div>
            <pre className="whitespace-pre-wrap overflow-x-auto text-[11px] max-h-40 bg-black/40 p-2.5 rounded border border-white/5">
              {testResult.output}
            </pre>
          </div>
        )}

        {/* Obsidian Export Confirmation */}
        {exportResult && exportResult.success && (
          <div className="p-3 bg-indigo-950/40 border border-indigo-700/50 rounded-lg text-xs text-indigo-300 flex items-center justify-between">
            <span>✓ Note exported to Obsidian Vault</span>
            <a 
              href={exportResult.obsidianUri} 
              className="flex items-center gap-1 text-indigo-400 underline hover:text-indigo-200"
            >
              Open in Obsidian <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-[#1e2638] bg-[#0d111a] flex items-center justify-between space-x-3">
        <button
          onClick={onExportObsidian}
          className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#1a2130] hover:bg-[#252f44] border border-[#2a364f] rounded-md transition flex items-center gap-1.5"
          title="Save verified note into Career_Roadmap vault"
        >
          <BookOpen size={14} /> Export to Obsidian
        </button>

        <button
          onClick={onVerify}
          disabled={isVerifying}
          className={`flex-1 py-2 px-4 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition ${
            isVerifying 
              ? 'bg-blue-600/50 text-white cursor-wait' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95'
          }`}
        >
          <Play size={14} className={isVerifying ? 'animate-spin' : ''} />
          {isVerifying ? 'Running Tests...' : 'Verify & Auto-Commit 🚀'}
        </button>
      </div>
    </div>
  );
}
