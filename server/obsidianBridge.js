import fs from 'fs';
import path from 'path';

const defaultVaultPath = '/home/nikhil/Desktop/Career_Roadmap/learnings';

export function getObsidianNotes(vaultDir = defaultVaultPath) {
  if (!fs.existsSync(vaultDir)) return [];

  const results = [];

  function traverse(dir, baseDir = '') {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.startsWith('.')) continue;
      const fullPath = path.join(dir, file);
      const relPath = path.join(baseDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath, relPath);
      } else if (file.endsWith('.md')) {
        results.push({
          title: file.replace('.md', ''),
          path: relPath,
          fullPath,
          category: baseDir || 'Root',
          updatedAt: stat.mtime
        });
      }
    }
  }

  try {
    traverse(vaultDir);
  } catch (err) {
    console.warn('[ObsidianBridge] Error reading vault:', err.message);
  }

  return results.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function readObsidianNote(relPath, vaultDir = defaultVaultPath) {
  const fullPath = path.join(vaultDir, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Note not found: ${relPath}`);
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

export function exportLessonToObsidian(trackId, lessonId, title, code, language, notes = '', vaultDir = defaultVaultPath) {
  if (!fs.existsSync(vaultDir)) {
    fs.mkdirSync(vaultDir, { recursive: true });
  }

  const categoryDir = path.join(vaultDir, `Arena_${trackId.toUpperCase()}`);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  const filename = `${lessonId}.md`;
  const targetPath = path.join(categoryDir, filename);

  const today = new Date().toISOString().split('T')[0];
  const content = `---
title: "${title}"
track: "${trackId}"
lesson: "${lessonId}"
language: "${language}"
verified_date: "${today}"
tags: [arena, first-principles, verified, ${trackId}]
---

# ⚔️ ${title}

> [!NOTE] Invariant & Mental Model
> ${notes || 'Verified through Sovereign Arena automated test harness.'}

## 💻 Verified Implementation (${language.toUpperCase()})

\`\`\`${language}
${code}
\`\`\`

---
*Auto-exported by Sovereign Arena at ${new Date().toLocaleTimeString()}*
`;

  fs.writeFileSync(targetPath, content, 'utf-8');
  return {
    success: true,
    path: targetPath,
    obsidianUri: `obsidian://open?vault=Career_Roadmap&file=${encodeURIComponent(`learnings/Arena_${trackId.toUpperCase()}/${filename}`)}`
  };
}
