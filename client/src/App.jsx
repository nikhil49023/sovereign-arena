import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LessonPane from './components/LessonPane';
import EditorPane from './components/EditorPane';
import TerminalTab from './components/TerminalTab';
import ObsidianDrawer from './components/ObsidianDrawer';
import { Terminal, Bot, Activity, Plus } from 'lucide-react';

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [exportResult, setExportResult] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  // Terminal Tabs state
  const [terminalTabs, setTerminalTabs] = useState([
    { id: 'bash', title: 'Learner Shell', mode: 'bash', icon: Terminal },
    { id: 'agy', title: 'Antigravity CLI', mode: 'antigravity', icon: Bot },
    { id: 'monitor', title: 'System / GPU', mode: 'bash', icon: Activity }
  ]);
  const [activeTabId, setActiveTabId] = useState('bash');

  // Load Tracks and Profile on mount
  useEffect(() => {
    fetch('http://localhost:3001/api/tracks')
      .then(res => res.json())
      .then(data => {
        setTracks(data);
        if (data.length > 0) {
          loadLesson(data[0].id, '01_tensor_strides');
          setCurrentTrack(data[0]);
        }
      })
      .catch(err => console.error('Error fetching tracks:', err));

    fetchProfile();
  }, []);

  const fetchProfile = () => {
    fetch('http://localhost:3001/api/profile')
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error('Error fetching profile:', err));
  };

  const loadLesson = (trackId, lessonId) => {
    fetch(`http://localhost:3001/api/tracks/${trackId}/${lessonId}`)
      .then(res => res.json())
      .then(lesson => {
        setCurrentLesson(lesson);
        setCode(lesson.template);
        setTestResult(null);
        setExportResult(null);
      })
      .catch(err => console.error('Error fetching lesson:', err));
  };

  const handleSelectTrack = (track) => {
    setCurrentTrack(track);
    const firstLessonMap = {
      pytorch: '01_tensor_strides',
      cpp: '01_monotonic_stack',
      cuda: '01_vector_add_kernel',
      rust: '01_borrow_checker_pointers',
      qiskit: '01_bell_state'
    };
    const firstLessonId = firstLessonMap[track.id] || '01_tensor_strides';
    loadLesson(track.id, firstLessonId);
  };

  const handleVerify = () => {
    if (!currentLesson || isVerifying) return;
    setIsVerifying(true);
    setTestResult(null);

    fetch('http://localhost:3001/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trackId: currentTrack.id,
        lessonId: currentLesson.id,
        language: currentLesson.language,
        code
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsVerifying(false);
        setTestResult(data);
        if (data.success) {
          fetchProfile(); // Refresh XP and streak immediately
        }
      })
      .catch(err => {
        setIsVerifying(false);
        setTestResult({ success: false, output: 'API Error: ' + err.message });
      });
  };

  const handleExportObsidian = () => {
    if (!currentLesson) return;

    fetch('http://localhost:3001/api/obsidian/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trackId: currentTrack.id,
        lessonId: currentLesson.id,
        title: currentLesson.title,
        code,
        language: currentLesson.language,
        notes: currentLesson.instructions
      })
    })
      .then(res => res.json())
      .then(data => setExportResult(data))
      .catch(err => console.error('Error exporting to Obsidian:', err));
  };

  // Keyboard shortcut Ctrl+Enter to verify
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleVerify();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, currentLesson, code, isVerifying]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#0a0d14] text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        tracks={tracks}
        currentTrack={currentTrack}
        onSelectTrack={handleSelectTrack}
        profile={profile}
        onOpenVault={() => setIsVaultOpen(true)}
      />

      {/* Main 3-Column / Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Lesson Instructions & Verification (30% width) */}
        <div className="w-[380px] shrink-0 h-full">
          <LessonPane
            lesson={currentLesson}
            onVerify={handleVerify}
            isVerifying={isVerifying}
            testResult={testResult}
            onExportObsidian={handleExportObsidian}
            exportResult={exportResult}
          />
        </div>

        {/* Column 2 & 3: Editor on Top, Multi-tab Terminal on Bottom */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Half: Monaco Editor */}
          <div className="h-[52%] w-full">
            <EditorPane
              code={code}
              onChange={setCode}
              language={currentLesson?.language || 'python'}
            />
          </div>

          {/* Bottom Half: Multi-Tab Native Terminal */}
          <div className="flex-1 flex flex-col bg-[#0d1117] border-t border-[#1e2638] overflow-hidden">
            {/* Terminal Tab Bar */}
            <div className="h-8 bg-[#111520] border-b border-[#1e2638] flex items-center justify-between px-3 shrink-0">
              <div className="flex items-center space-x-1">
                {terminalTabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs transition ${
                        activeTabId === tab.id
                          ? 'bg-[#1e2638] text-slate-100 font-semibold border-b-2 border-blue-500'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#151b28]'
                      }`}
                    >
                      <Icon size={12} className={activeTabId === tab.id ? 'text-blue-400' : 'text-slate-500'} />
                      <span>{tab.title}</span>
                    </button>
                  );
                })}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Shell: Native Linux PTY | GPU: RTX 3050 Active
              </div>
            </div>

            {/* Terminal Tab Containers */}
            <div className="flex-1 relative w-full h-full">
              {terminalTabs.map(tab => (
                <TerminalTab
                  key={tab.id}
                  mode={tab.mode}
                  active={activeTabId === tab.id}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Obsidian Vault Drawer */}
      <ObsidianDrawer
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
      />
    </div>
  );
}
