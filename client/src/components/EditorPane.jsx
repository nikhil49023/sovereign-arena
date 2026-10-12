import React from 'react';
import Editor from '@monaco-editor/react';
import { Code2, Terminal } from 'lucide-react';

export default function EditorPane({ code, onChange, language = 'python' }) {
  const monacoLangMap = {
    pytorch: 'python',
    qiskit: 'python',
    cpp: 'cpp',
    cuda: 'cpp',
    rust: 'rust',
    bash: 'shell',
    python: 'python'
  };

  const currentLang = monacoLangMap[language.toLowerCase()] || 'python';
  const fileExt = language === 'rust' ? 'rs' : language === 'cpp' ? 'cpp' : language === 'cuda' ? 'cu' : 'py';

  return (
    <div className="w-full h-full flex flex-col bg-[#090a0f] border-r border-white/[0.08]">
      {/* Editor Top Bar */}
      <div className="h-8 flex items-center justify-between px-3 border-b border-white/[0.08] bg-[#0c0e14]/70 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-slate-300 font-mono text-[11px]">
            <Code2 size={11} className="text-blue-400" />
            <span>buffer.{fileExt}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase px-1.5 py-0.5 rounded bg-black/30 border border-white/[0.04]">
            {language}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
          <span className="hidden sm:inline">UTF-8</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Ready</span>
        </div>
      </div>

      {/* Monaco Container */}
      <div className="flex-1 w-full h-full relative">
        <Editor
          height="100%"
          language={currentLang}
          value={code}
          onChange={onChange}
          theme="vs-dark"
          options={{
            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
            fontSize: 13,
            lineHeight: 21,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            padding: { top: 10, bottom: 10 },
            folding: true,
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            renderLineHighlight: 'all',
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true
          }}
        />
      </div>
    </div>
  );
}
