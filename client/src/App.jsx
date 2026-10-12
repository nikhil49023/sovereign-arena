import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LessonPane from './components/LessonPane';
import EditorPane from './components/EditorPane';
import TerminalTab from './components/TerminalTab';
import ObsidianDrawer from './components/ObsidianDrawer';
import { Terminal, Bot, Activity } from 'lucide-react';

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

  // Terminal Tabs configuration
  const [terminalTabs] = useState([
    { id: 'bash', title: 'Learner Shell', mode: 'bash', icon: Terminal },
    { id: 'agy', title: 'Antigravity AI', mode: 'antigravity', icon: Bot },
    { id: 'monitor', title: 'Hardware Telemetry', mode: 'bash', icon: Activity }
  ]);
  const [activeTabId, setActiveTabId] = useState('bash');

  // Fetch initial tracks and profile
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
          fetchProfile();
        }
      })
      .catch(err => {
        setIsVerifying(false);
        setTestResult({ success: false, output: 'API Network Error: ' + err.message });
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

  // Keyboard shortcut Ctrl+Enter to trigger test execution
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
    <div className="w-screen h-screen flex flex-col bg-[#090a0f] text-slate-100 overflow-hidden font-sans">
      {/* Precision Header */}
      <Header
        tracks={tracks}
        currentTrack={currentTrack}
        onSelectTrack={handleSelectTrack}
        profile={profile}
        onOpenVault={() => setIsVaultOpen(true)}
      />

      {/* Main Cockpit Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Syllabus & Verification Panel (360px) */}
        <div className="w-[360px] shrink-0 h-full border-r border-white/[0.08]">
          <LessonPane
            lesson={currentLesson}
            onVerify={handleVerify}
            isVerifying={isVerifying}
            testResult={testResult}
            onExportObsidian={handleExportObsidian}
            exportResult={exportResult}
          />
        </div>

        {/* Right: Monaco Top + Terminal Bottom */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Half: Code Editor */}
          <div className="h-[52%] w-full">
            <EditorPane
              code={code}
              onChange={setCode}
              language={currentLesson?.language || 'python'}
            />
          </div>

          {/* Bottom Half: Native Terminal */}
          <div className="flex-1 flex flex-col bg-[#090a0f] border-t border-white/[0.08] overflow-hidden">
            {/* Terminal Tab Bar */}
            <div className="h-8 bg-[#0c0e14]/70 border-b border-white/[0.08] flex items-center justify-between px-3 shrink-0">
              <div className="flex items-center space-x-1">
                {terminalTabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTabId === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono transition ${
                        isActive
                          ? 'bg-white/[0.08] text-slate-100 font-medium border border-white/[0.1]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon size={12} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
                      <span className="text-[11px]">{tab.title}</span>
                    </button>
                  );
                })}
              </div>
              <div className="text-[10px] text-slate-500 font-mono tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Linux PTY · RTX 3050 Online</span>
              </div>
            </div>

            {/* Terminal Viewport */}
            <div className="flex-1 relative w-full h-full bg-[#090a0f]">
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
