import React, { useState, useEffect } from 'react';
import { BookOpen, Search, X, ExternalLink, FileText, Folder } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-[850px] h-full bg-[#0a0d14] border-l border-[#1e2638] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#1e2638] flex items-center justify-between bg-[#0f1420]">
          <div className="flex items-center space-x-2.5">
            <BookOpen size={18} className="text-purple-400" />
            <h2 className="text-sm font-bold text-slate-100">Obsidian Vault: Career_Roadmap</h2>
            <span className="text-[11px] px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
              {notes.length} Notes Synced
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Note List / Tree */}
          <div className="w-72 border-r border-[#1e2638] flex flex-col bg-[#0d111a]">
            <div className="p-3 border-b border-[#1e2638]">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search vault notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#151b28] border border-[#232d42] rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredNotes.map((note) => (
                <button
                  key={note.path}
                  onClick={() => loadNote(note.path)}
                  className={`w-full text-left p-2 rounded text-xs transition flex flex-col ${
                    selectedNote === note.path
                      ? 'bg-purple-950/60 text-purple-200 border border-purple-800/50'
                      : 'text-slate-400 hover:bg-[#151b28] hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium truncate">
                    <FileText size={13} className="shrink-0 text-slate-500" />
                    <span className="truncate">{note.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Folder size={10} /> {note.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Note Viewer */}
          <div className="flex-1 flex flex-col bg-[#0a0d14] overflow-hidden">
            {selectedNote ? (
              <>
                <div className="px-5 py-3 border-b border-[#1e2638] bg-[#0f1420] flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300">{selectedNote}</span>
                  <a
                    href={`obsidian://open?vault=Career_Roadmap&file=${encodeURIComponent(selectedNote)}`}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 underline"
                  >
                    Open in Obsidian App <ExternalLink size={12} />
                  </a>
                </div>
                <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-text bg-[#0a0d14]">
                  {loading ? 'Loading note from vault...' : noteContent}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                Select a note from the left to read.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
