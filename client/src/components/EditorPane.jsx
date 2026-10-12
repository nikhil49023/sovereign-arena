import React from 'react';
import Editor from '@monaco-editor/react';

export default function EditorPane({ code, onChange, language = 'python' }) {
  const monacoLangMap = {
    pytorch: 'python',
    qiskit: 'python',
    cpp: 'cpp',
    cuda: 'cpp', // Monaco parses CUDA cleanly using C++ grammar
    rust: 'rust',
    bash: 'shell',
    python: 'python'
  };

  const currentLang = monacoLangMap[language.toLowerCase()] || 'python';

  return (
    <div className="w-full h-full flex flex-col bg-[#0f141c] border-r border-[#1e2638]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e2638] bg-[#111520] text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="font-mono font-medium text-slate-200">scratchpad.{language === 'rust' ? 'rs' : language === 'cpp' ? 'cpp' : language === 'cuda' ? 'cu' : 'py'}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1e2638] text-slate-300 uppercase">{currentLang}</span>
        </div>
        <div className="text-[11px] text-slate-500">
          Auto-saves to ephemeral buffer | Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Ctrl+Enter</kbd> to Verify
        </div>
      </div>
      <div className="flex-1 w-full h-full relative">
        <Editor
          height="100%"
          language={currentLang}
          value={code}
          onChange={onChange}
          theme="vs-dark"
          options={{
            fontFamily: "'Fira Code', 'JetBrains Mono', Menlo, monospace",
            fontSize: 13.5,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
            folding: true,
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
            cursorBlinking: 'smooth',
            smoothScrolling: true
          }}
        />
      </div>
    </div>
  );
}
