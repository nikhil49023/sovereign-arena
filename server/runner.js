import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Detect CUDA compiler
function getCudaCompiler() {
  if (fs.existsSync('/usr/local/cuda-13.1/bin/nvcc')) return '/usr/local/cuda-13.1/bin/nvcc';
  if (fs.existsSync('/usr/local/cuda/bin/nvcc')) return '/usr/local/cuda/bin/nvcc';
  try {
    return execSync('which nvcc', { encoding: 'utf-8' }).trim();
  } catch {
    return 'nvcc';
  }
}

export function executeVerification(language, code, customTestCode = '', timeoutMs = 15000) {
  return new Promise((resolve) => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arena-run-'));
    const lang = language.toLowerCase();

    let cmd = '';
    let srcFile = '';

    try {
      if (lang === 'rust') {
        srcFile = path.join(tmpDir, 'solution.rs');
        const fullContent = customTestCode 
          ? `${code}\n\n#[cfg(test)]\nmod tests {\n  use super::*;\n  ${customTestCode}\n}`
          : code;
        fs.writeFileSync(srcFile, fullContent, 'utf-8');
        cmd = `rustc --test "${srcFile}" -o "${path.join(tmpDir, 'test_bin')}" && "${path.join(tmpDir, 'test_bin')}"`;
      } 
      else if (lang === 'cpp' || lang === 'c++') {
        srcFile = path.join(tmpDir, 'solution.cpp');
        const fullContent = customTestCode ? `${code}\n\n${customTestCode}` : code;
        fs.writeFileSync(srcFile, fullContent, 'utf-8');
        cmd = `g++ -std=c++20 -O2 "${srcFile}" -o "${path.join(tmpDir, 'prog')}" && "${path.join(tmpDir, 'prog')}"`;
      } 
      else if (lang === 'cuda') {
        srcFile = path.join(tmpDir, 'solution.cu');
        const nvcc = getCudaCompiler();
        const fullContent = customTestCode ? `${code}\n\n${customTestCode}` : code;
        fs.writeFileSync(srcFile, fullContent, 'utf-8');
        cmd = `"${nvcc}" -O3 "${srcFile}" -o "${path.join(tmpDir, 'cuda_prog')}" && "${path.join(tmpDir, 'cuda_prog')}"`;
      } 
      else if (lang === 'pytorch' || lang === 'qiskit' || lang === 'python') {
        srcFile = path.join(tmpDir, 'solution.py');
        const fullContent = customTestCode ? `${code}\n\n${customTestCode}` : code;
        fs.writeFileSync(srcFile, fullContent, 'utf-8');
        cmd = `python3 "${srcFile}"`;
      } 
      else if (lang === 'bash' || lang === 'sh') {
        srcFile = path.join(tmpDir, 'verify.sh');
        fs.writeFileSync(srcFile, customTestCode || code, 'utf-8');
        cmd = `bash "${srcFile}"`;
      } 
      else {
        resolve({
          success: false,
          output: `Unsupported language runtime: ${language}`
        });
        return;
      }

      exec(cmd, { cwd: tmpDir, timeout: timeoutMs, env: process.env }, (error, stdout, stderr) => {
        // Clean up temp dir
        try {
          fs.rmSync(tmpDir, { recursive: true, force: true });
        } catch {}

        if (error) {
          resolve({
            success: false,
            exitCode: error.code || 1,
            output: stderr.trim() || stdout.trim() || error.message
          });
        } else {
          resolve({
            success: true,
            exitCode: 0,
            output: stdout.trim() || 'All assertions passed successfully! (exit 0)'
          });
        }
      });
    } catch (err) {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}
      resolve({
        success: false,
        output: `Execution setup error: ${err.message}`
      });
    }
  });
}
