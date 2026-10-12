import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import pty from 'node-pty';
import cors from 'cors';
import { getTracks, getLesson } from './curriculum.js';
import { executeVerification } from './runner.js';
import { autoCommitSolution } from './gitDaemon.js';
import { getProfile, recordCompletion } from './db.js';
import { getObsidianNotes, readObsidianNote, exportLessonToObsidian } from './obsidianBridge.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/terminal' });

app.use(cors());
app.use(express.json());

// ----------------------------------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------------------------------

app.get('/api/tracks', (req, res) => {
  res.json(getTracks());
});

app.get('/api/tracks/:trackId/:lessonId', (req, res) => {
  const lesson = getLesson(req.params.trackId, req.params.lessonId);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }
  res.json(lesson);
});

app.get('/api/profile', (req, res) => {
  res.json(getProfile());
});

app.post('/api/verify', async (req, res) => {
  const { trackId, lessonId, language, code } = req.body;
  const lesson = getLesson(trackId, lessonId);
  
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson definition not found' });
  }

  // Run automated test suite
  const result = await executeVerification(language || lesson.language, code, lesson.testCode);

  if (result.success) {
    // 1. Silent Git Daemon Auto-Commit
    const gitRes = autoCommitSolution(trackId, lessonId, language || lesson.language, code, result.output);

    // 2. Record completion in SQLite DB
    const profileUpdate = recordCompletion(
      trackId, 
      lessonId, 
      language || lesson.language, 
      code, 
      gitRes.sha, 
      lesson.xp || 50
    );

    return res.json({
      success: true,
      output: result.output,
      xpEarned: profileUpdate.earned,
      totalXp: profileUpdate.xp,
      streak: profileUpdate.streak,
      rank: profileUpdate.rank,
      gitCommit: gitRes.sha ? gitRes.sha.substring(0, 7) : null
    });
  } else {
    return res.json({
      success: false,
      output: result.output
    });
  }
});

// Obsidian Endpoints
app.get('/api/obsidian/notes', (req, res) => {
  res.json(getObsidianNotes());
});

app.get('/api/obsidian/note', (req, res) => {
  try {
    const content = readObsidianNote(req.query.path);
    res.json({ content });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.post('/api/obsidian/export', (req, res) => {
  const { trackId, lessonId, title, code, language, notes } = req.body;
  const result = exportLessonToObsidian(trackId, lessonId, title, code, language, notes);
  res.json(result);
});

// ----------------------------------------------------------------------------
// WEBSOCKET NATIVE PTY TERMINAL MULTIPLEXER
// ----------------------------------------------------------------------------

const defaultShell = process.env.SHELL || (process.platform === 'darwin' ? '/bin/zsh' : '/bin/bash');

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const mode = url.searchParams.get('mode') || 'bash';

  // Spawn real PTY session
  const ptyProcess = pty.spawn(defaultShell, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME || '/home/nikhil',
    env: {
      ...process.env,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor'
    }
  });

  // If Antigravity mode requested, automatically launch `agy`
  if (mode === 'antigravity') {
    setTimeout(() => {
      ptyProcess.write('agy\r');
    }, 300);
  }

  ptyProcess.onData((data) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'output', data }));
    }
  });

  ws.on('message', (msg) => {
    try {
      const parsed = JSON.parse(msg);
      if (parsed.type === 'input') {
        ptyProcess.write(parsed.data);
      } else if (parsed.type === 'resize') {
        ptyProcess.resize(parsed.cols || 80, parsed.rows || 24);
      }
    } catch {
      ptyProcess.write(msg.toString());
    }
  });

  ws.on('close', () => {
    ptyProcess.kill();
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`⚔️ Sovereign Arena Backend listening on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket Terminal connected on ws://localhost:${PORT}/ws/terminal`);
});
