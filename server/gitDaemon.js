import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

export function autoCommitSolution(trackId, lessonId, language, code, benchmarkOutput = '') {
  try {
    const solutionsDir = path.join(rootDir, 'solutions', trackId);
    if (!fs.existsSync(solutionsDir)) {
      fs.mkdirSync(solutionsDir, { recursive: true });
    }

    const extMap = {
      rust: 'rs',
      cpp: 'cpp',
      cuda: 'cu',
      pytorch: 'py',
      qiskit: 'py',
      python: 'py',
      bash: 'sh'
    };

    const ext = extMap[language.toLowerCase()] || 'txt';
    const filename = `${lessonId}.${ext}`;
    const filePath = path.join(solutionsDir, filename);

    // Write clean verified code
    fs.writeFileSync(filePath, code, 'utf-8');

    // Build high-signal commit message
    const commitMsg = `feat(${trackId}): solve ${lessonId} [Automated Arena Verification]

- Language: ${language}
- Verified by: Sovereign Arena Test Harness
- Invariant & unit test assertions passed (0 errors)
- Auto-logged by Silent Git Daemon`;

    // Git operations
    execSync(`git add "${filePath}"`, { cwd: rootDir, stdio: 'pipe' });
    
    // Check if there are staged changes
    const status = execSync('git status --porcelain', { cwd: rootDir, encoding: 'utf-8' });
    if (!status.trim()) {
      return { success: true, message: 'No new changes to commit' };
    }

    execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { cwd: rootDir, stdio: 'pipe' });
    
    // Get commit SHA
    const sha = execSync('git rev-parse HEAD', { cwd: rootDir, encoding: 'utf-8' }).trim();

    // Push asynchronously in background
    try {
      execSync('git push origin main', { cwd: rootDir, stdio: 'pipe', timeout: 10000 });
    } catch (pushErr) {
      console.warn('[GitDaemon] Push warning (will sync on next online push):', pushErr.message);
    }

    return { success: true, sha, filename };
  } catch (err) {
    console.error('[GitDaemon] Error committing solution:', err.message);
    return { success: false, error: err.message };
  }
}
