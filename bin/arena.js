#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import * as p from '@clack/prompts';
import pc from 'picocolors';

import { getTracks, getLesson, TRACKS } from '../server/curriculum.js';
import { executeVerification } from '../server/runner.js';
import { autoCommitSolution } from '../server/gitDaemon.js';
import { getProfile, recordCompletion } from '../server/db.js';
import { exportLessonToObsidian, getObsidianNotes } from '../server/obsidianBridge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ephemeral Scratch Directory in ~/.arena/scratch/
const arenaDir = path.join(os.homedir(), '.arena');
const scratchDir = path.join(arenaDir, 'scratch');
const stateFile = path.join(arenaDir, 'state.json');

if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

function saveActiveState(trackId, lessonId, language, filePath) {
  fs.writeFileSync(stateFile, JSON.stringify({ trackId, lessonId, language, filePath }, null, 2));
}

function loadActiveState() {
  if (!fs.existsSync(stateFile)) return null;
  try {
    return JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
  } catch {
    return null;
  }
}

const extMap = {
  pytorch: 'py',
  python: 'py',
  qiskit: 'py',
  cpp: 'cpp',
  cuda: 'cu',
  rust: 'rs',
  bash: 'sh'
};

// ----------------------------------------------------------------------------
// COMMAND: LIST
// ----------------------------------------------------------------------------
function commandList() {
  const profile = getProfile();
  const completedIds = new Set(profile.completedLessons.map(c => c.id));

  console.log(pc.bold(pc.cyan('\n  ARENA CURRICULUM SYLLABUS')));
  console.log(pc.dim('  ' + '─'.repeat(54)));

  TRACKS.forEach(track => {
    console.log(`\n  ${pc.bold(pc.white(track.title.toUpperCase()))} ${pc.dim(`(${track.id})`)}`);
    track.lessons.forEach(lesson => {
      const fullId = `${track.id}:${lesson.id}`;
      const isDone = completedIds.has(fullId);
      const mark = isDone ? pc.green('[✓]') : pc.dim('[ ]');
      const diff = lesson.difficulty === 'Easy' ? pc.green(lesson.difficulty) :
                   lesson.difficulty === 'Medium' ? pc.yellow(lesson.difficulty) : pc.red(lesson.difficulty);
      
      console.log(`    ${mark} ${pc.white(lesson.title.padEnd(36))} ${pc.dim(lesson.language.toUpperCase().padEnd(8))} ${diff} ${pc.dim(`+${lesson.xp}XP`)}`);
    });
  });
  console.log('');
}

// ----------------------------------------------------------------------------
// COMMAND: STATS
// ----------------------------------------------------------------------------
function commandStats() {
  const profile = getProfile();
  console.log(pc.bold(pc.cyan('\n  ARENA TELEMETRY & PROFILE')));
  console.log(pc.dim('  ' + '─'.repeat(40)));
  console.log(`  ${pc.dim('Rank Title:')}    ${pc.bold(pc.magenta(profile.rank_title || 'Cadet'))}`);
  console.log(`  ${pc.dim('Total XP:')}      ${pc.bold(pc.yellow(profile.xp + ' XP'))}`);
  console.log(`  ${pc.dim('Daily Streak:')}  ${pc.bold(pc.green(profile.streak + ' Days Active'))}`);
  console.log(`  ${pc.dim('Last Active:')}   ${pc.white(profile.last_active_date || 'Today')}`);
  console.log(`  ${pc.dim('Completed:')}     ${pc.white(profile.completedLessons.length + ' Drills Verified')}`);
  console.log(pc.dim('  ' + '─'.repeat(40)) + '\n');
}

// ----------------------------------------------------------------------------
// COMMAND: RUN / TEST
// ----------------------------------------------------------------------------
async function commandTest() {
  const state = loadActiveState();
  if (!state) {
    console.log(pc.red('  Error: No active drill. Run `arena start` or `arena` to select a drill.'));
    return;
  }

  const lesson = getLesson(state.trackId, state.lessonId);
  if (!lesson) {
    console.log(pc.red('  Error: Lesson metadata not found.'));
    return;
  }

  if (!fs.existsSync(state.filePath)) {
    console.log(pc.red(`  Error: Scratchpad file missing: ${state.filePath}`));
    return;
  }

  const code = fs.readFileSync(state.filePath, 'utf-8');
  process.stdout.write(pc.dim(`  Compiling & executing verification (${state.language})...\r`));

  const start = Date.now();
  const res = await executeVerification(state.language, code, lesson.testCode);
  const elapsed = Date.now() - start;

  if (res.success) {
    console.log(pc.green(`  [PASS] All assertions verified (${elapsed}ms)                `));
    console.log(pc.dim(`  Output: ${res.output}`));

    // Silent Git Daemon Commit
    const gitRes = autoCommitSolution(state.trackId, state.lessonId, state.language, code, res.output);
    if (gitRes.success && gitRes.sha) {
      console.log(pc.cyan(`  [GIT] Auto-committed ${pc.bold(gitRes.sha.substring(0, 7))} -> solutions/${state.trackId}/${state.lessonId}`));
    }

    // Record XP
    const pUpdate = recordCompletion(state.trackId, state.lessonId, state.language, code, gitRes.sha, lesson.xp || 50);
    console.log(pc.yellow(`  [REWARD] +${lesson.xp} XP earned! Total: ${pUpdate.xp} XP | Streak: ${pUpdate.streak}D`));
  } else {
    console.log(pc.red(`  [FAIL] Verification error (${elapsed}ms)                     `));
    console.log(pc.red('  ' + '─'.repeat(50)));
    console.log(pc.white(res.output));
    console.log(pc.red('  ' + '─'.repeat(50)));
  }
}

// ----------------------------------------------------------------------------
// COMMAND: START / WATCH
// ----------------------------------------------------------------------------
async function startDrill(trackId, lessonId) {
  const lesson = getLesson(trackId, lessonId);
  if (!lesson) {
    console.log(pc.red(`  Error: Lesson not found: ${trackId}/${lessonId}`));
    return;
  }

  const ext = extMap[lesson.language.toLowerCase()] || 'txt';
  const scratchFile = path.join(scratchDir, `solution.${ext}`);

  // Write template if file doesn't exist
  if (!fs.existsSync(scratchFile)) {
    fs.writeFileSync(scratchFile, lesson.template, 'utf-8');
  }

  saveActiveState(trackId, lessonId, lesson.language, scratchFile);

  console.clear();
  console.log(pc.bold(pc.cyan(`\n  ARENA DRILL: ${lesson.title.toUpperCase()}`)));
  console.log(pc.dim(`  Track: ${lesson.trackTitle} | Lang: ${lesson.language.toUpperCase()} | Reward: +${lesson.xp}XP`));
  console.log(pc.dim('  ' + '═'.repeat(60)));
  
  // Print Instructions
  console.log(pc.white(lesson.instructions));
  console.log(pc.dim('  ' + '═'.repeat(60)));
  console.log(pc.bold(pc.green(`  Scratchpad: ${scratchFile}`)));
  console.log(pc.dim(`  Open and edit in your favorite editor (nvim, vim, code, micro).`));
  console.log(pc.cyan(`  [WATCHER ACTIVE] Live auto-compiling on file save... Press Ctrl+C to exit.\n`));

  // Spawn editor if EDITOR is set and user wants it, or non-blocking
  const preferredEditor = process.env.EDITOR;

  let isRunning = false;
  let lastMtime = 0;

  // Watch scratch file for modifications
  const watcher = fs.watch(scratchFile, async (eventType) => {
    if (isRunning) return;
    try {
      const stats = fs.statSync(scratchFile);
      if (stats.mtimeMs === lastMtime) return;
      lastMtime = stats.mtimeMs;
    } catch {
      return;
    }

    isRunning = true;
    console.log(pc.dim(`\n  [SAVE DETECTED] Compiling ${lesson.language.toUpperCase()}...`));
    await commandTest();
    console.log(pc.dim(`  Waiting for next save...`));
    isRunning = false;
  });

  process.on('SIGINT', () => {
    watcher.close();
    console.log(pc.dim('\n  Watcher stopped. Progress preserved in scratchpad.\n'));
    process.exit(0);
  });
}

// ----------------------------------------------------------------------------
// INTERACTIVE CLI FLOW
// ----------------------------------------------------------------------------
async function interactiveMenu() {
  p.intro(pc.bold(pc.cyan('ARENA: Systems & AI Interactive Terminal')));

  const trackChoice = await p.select({
    message: 'Select engineering domain:',
    options: TRACKS.map(t => ({
      value: t.id,
      label: t.title,
      hint: `${t.lessons.length} drills (${t.id})`
    }))
  });

  if (p.isCancel(trackChoice)) {
    p.cancel('Session aborted.');
    process.exit(0);
  }

  const selectedTrack = TRACKS.find(t => t.id === trackChoice);
  const profile = getProfile();
  const completedIds = new Set(profile.completedLessons.map(c => c.id));

  const lessonChoice = await p.select({
    message: 'Select drill to solve:',
    options: selectedTrack.lessons.map(l => {
      const fullId = `${selectedTrack.id}:${l.id}`;
      const isDone = completedIds.has(fullId);
      return {
        value: l.id,
        label: `${isDone ? '✓ ' : '  '}${l.title}`,
        hint: `${l.language.toUpperCase()} · ${l.difficulty} · +${l.xp}XP`
      };
    })
  });

  if (p.isCancel(lessonChoice)) {
    p.cancel('Session aborted.');
    process.exit(0);
  }

  p.outro(pc.green('Launching drill...'));
  await startDrill(trackChoice, lessonChoice);
}

// ----------------------------------------------------------------------------
// MAIN ENTRYPOINT
// ----------------------------------------------------------------------------
const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  interactiveMenu();
} else if (command === 'list' || command === 'ls') {
  commandList();
} else if (command === 'stats' || command === 'profile') {
  commandStats();
} else if (command === 'test' || command === 'run' || command === 'verify') {
  commandTest();
} else if (command === 'start' || command === 'play') {
  if (args[1] && args[2]) {
    startDrill(args[1], args[2]);
  } else {
    interactiveMenu();
  }
} else if (command === 'sync' || command === 'obsidian') {
  const state = loadActiveState();
  if (!state) {
    console.log(pc.red('No active drill to sync.'));
    process.exit(1);
  }
  const lesson = getLesson(state.trackId, state.lessonId);
  const code = fs.readFileSync(state.filePath, 'utf-8');
  const res = exportLessonToObsidian(state.trackId, state.lessonId, lesson.title, code, state.language, lesson.instructions);
  console.log(pc.green(`✓ Exported verified note to Career_Roadmap: ${res.path}`));
} else {
  console.log(pc.yellow(`
  Usage: arena [command]

  Commands:
    arena                  Launch interactive drill selector
    arena list             List all tracks and drills
    arena start <track> <id> Jump directly to a drill
    arena test             Run one-shot verification on active scratchpad
    arena stats            Display XP, streak, and rank scorecard
    arena sync             Export active drill note to Obsidian vault
  `));
}
