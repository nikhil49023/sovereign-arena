import React, { useState, useEffect } from 'react';
import { BookOpen, Search, X, ExternalLink, FileText, Folder, CornerDownRight } from 'lucide-react';

export default function ObsidianDrawer({ isOpen, onClose }) {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:3001/api/obsidian/notes')
        .then(res => res.json())
        .then(data => {
          setNotes(data);
          if (data.length > 0 && !selectedNote) {
            loadNote(data[0].path);
          }
        })
        .catch(err => console.error('Error fetching vault notes:', err));
    }
  }, [isOpen]);

  const loadNote = (path) => {
    setLoading(true);
    setSelectedNote(path);
    fetch(`http://localhost:3001/api/obsidian/note?path=${encodeURIComponent(path)}`)
      .then(res => res.json())
      .then(data => {
        setNoteContent(data.content);
        setLoading(false);
      })
      .catch(err => {
        setNoteContent('Error loading note: ' + err.message);
        setLoading(false);
      });
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.category.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-[820px] h-full bg-[#0a0d14] border-l border-white/[0.08] flex flex-col shadow-2xl animate-in slide-in-from-right duration-150">
        {/* Header */}
        <div className="h-11 px-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0c0e14]">
          <div className="flex items-center space-x-2.5">
            <BookOpen size={14} className="text-purple-400" />
            <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">Career Roadmap Vault</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
              {notes.length} Notes Indexed
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Note List / Tree */}
          <div className="w-64 border-r border-white/[0.08] flex flex-col bg-[#0b0d13]">
            <div className="p-2.5 border-b border-white/[0.08]">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter vault..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-[#131722] border border-white/[0.08] rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 font-mono"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
              {filteredNotes.map((note) => (
                <button
                  key={note.path}
                  onClick={() => loadNote(note.path)}
                  className={`w-full text-left p-2 rounded text-xs transition flex flex-col ${
                    selectedNote === note.path
                      ? 'bg-purple-500/10 text-purple-200 border border-purple-500/30 font-medium'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <FileText size={12} className="shrink-0 text-slate-500" />
                    <span className="truncate text-[11px]">{note.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                    <Folder size={10} /> {note.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Note Viewer */}
          <div className="flex-1 flex flex-col bg-[#090a0f] overflow-hidden">
            {selectedNote ? (
              <>
                <div className="h-10 px-4 border-b border-white/[0.08] bg-[#0c0e14]/70 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-300 truncate max-w-md">{selectedNote}</span>
                  <a
                    href={`obsidian://open?vault=Career_Roadmap&file=${encodeURIComponent(selectedNote)}`}
                    className="flex items-center gap-1.5 text-[11px] text-purple-400 hover:text-purple-300 transition underline font-mono"
                  >
                    <span>Open in Obsidian</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
                <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-text bg-[#090a0f]">
                  {loading ? 'Reading note from vault...' : noteContent}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500 font-mono">
                Select an entry from the ledger to inspect.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
