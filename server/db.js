import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'arena.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 1,
    last_active_date TEXT,
    rank_title TEXT DEFAULT 'Cadet'
  );

  CREATE TABLE IF NOT EXISTS completed_lessons (
    id TEXT PRIMARY KEY,
    track_id TEXT,
    lesson_id TEXT,
    language TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    solution_code TEXT,
    commit_sha TEXT
  );

  CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id TEXT,
    success INTEGER,
    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    output TEXT
  );
`);

// Seed default profile if empty
const profile = db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
if (!profile) {
  const today = new Date().toISOString().split('T')[0];
  db.prepare(`
    INSERT INTO user_profile (id, xp, streak, last_active_date, rank_title)
    VALUES (1, 0, 1, ?, 'Cadet')
  `).run(today);
}

export function getProfile() {
  const prof = db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
  const completed = db.prepare('SELECT * FROM completed_lessons ORDER BY completed_at DESC').all();
  return { ...prof, completedLessons: completed };
}

export function recordCompletion(trackId, lessonId, language, code, commitSha, xpReward = 50) {
  const fullId = `${trackId}:${lessonId}`;
  const today = new Date().toISOString().split('T')[0];

  const currentProf = db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
  let newStreak = currentProf.streak || 1;
  
  if (currentProf.last_active_date) {
    const lastDate = new Date(currentProf.last_active_date);
    const currDate = new Date(today);
    const diffDays = Math.floor((currDate - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  const newXp = (currentProf.xp || 0) + xpReward;

  // Compute Rank Title
  let rank = 'Cadet';
  if (newXp >= 2000) rank = 'Sovereign Architect';
  else if (newXp >= 1000) rank = 'Systems Engineer';
  else if (newXp >= 500) rank = 'Junior Vanguard';

  db.prepare(`
    UPDATE user_profile 
    SET xp = ?, streak = ?, last_active_date = ?, rank_title = ?
    WHERE id = 1
  `).run(newXp, newStreak, today, rank);

  db.prepare(`
    INSERT OR REPLACE INTO completed_lessons (id, track_id, lesson_id, language, solution_code, commit_sha)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(fullId, trackId, lessonId, language, code, commitSha || '');

  return { xp: newXp, streak: newStreak, rank, earned: xpReward };
}

export default db;
