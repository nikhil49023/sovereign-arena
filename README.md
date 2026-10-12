# ⚔️ Sovereign Arena

> High-Velocity Interactive Systems & AI Learning Cockpit

Sovereign Arena is a personal interactive learning cockpit engineered to eliminate friction between mathematical theory and hands-on systems code. It blends the bite-sized guided challenge format of platforms like DataCamp with a **native Linux pseudo-terminal (PTY)**, **Monaco Code Editor**, **automated multi-language compiler verification**, and **Obsidian vault synchronization**.

---

## 🌟 Key Capabilities

### 1. Multi-Language & Multi-Hardware Engine
Supports hands-on practice across core deep-tech and systems stacks:
* **PyTorch & CUDA:** Run custom autograd functions and GPU kernels directly on physical NVIDIA hardware (`nvcc`, CUDA 13, PyTorch C++/Python).
* **Modern C++20:** Invariant derivation, memory budgets, `std::span`, cache-conscious data structures without heap churn.
* **Rust:** In-place partitioning, borrow-checker proofs, lock-free atomics, and concurrency primitives.
* **Quantum Computing (Qiskit):** Entangled Bell states, superposition, phase estimation circuits.
* **DevOps & CLI:** Interactive Git rebasing and Docker container forensics in a real shell.

### 2. Multi-Tab Native PTY Terminal
* **Learner Shell:** Direct unhindered access to `/bin/bash` (or `/bin/zsh` on macOS) to test code, inspect GPU memory (`nvidia-smi`), or run build commands.
* **Antigravity AI CLI:** Interactive AI agent running side-by-side in real-time to offer Socratic hints and traceback autopsy.
* **System / GPU Monitor:** Watch compilation logs and hardware metrics in a dedicated tab.

### 3. The Silent Git Daemon (Zero-Friction GitHub Logging)
* Eliminates the cognitive fatigue of creating 50 numbered `.py` files and manual folder management.
* When a challenge passes verification (`exit 0`), the backend automatically formats the clean solution into `solutions/<track>/`, writes a conventional commit, and syncs to GitHub under the hood.
* Your GitHub contribution graph and verified solutions stay 100% active with zero administrative drag.

### 4. Obsidian Vault Integration
* **Live Vault Browser:** Browse, search, and preview markdown notes from your local Obsidian vault (`Career_Roadmap`).
* **Deep-Link Protocol:** 1-click **"Open in Obsidian"** buttons (`obsidian://open?vault=...`).
* **1-Click Export:** Save clean, verified solutions directly into your Obsidian vault notes.

---

## 🚀 Quickstart

### Prerequisites
* **Node.js:** v18+ (tested on Node v22)
* **Compilers:** `g++` (C++20), `rustc`/`cargo`, `python3` (with `torch`/`qiskit`), `nvcc` (for CUDA)

### Launching the Cockpit

```bash
git clone https://github.com/nikhil49023/sovereign-arena.git
cd sovereign-arena

# Install dependencies (first time only)
npm install
(cd client && npm install)

# Launch both server and client with 1 command
./start.sh
```

Open your browser at `http://localhost:5173` (or port specified by Vite).

---

## 🏛️ Architecture Overview

```text
sovereign-arena/
├── server/
│   ├── server.js          # Express + WebSocket PTY multiplexer
│   ├── runner.js          # Multi-language compiler & test execution engine
│   ├── gitDaemon.js       # Silent Git Daemon for automated GitHub commits
│   ├── obsidianBridge.js  # Bi-directional Obsidian vault reader & exporter
│   ├── curriculum.js      # Curated tracks (PyTorch, C++, CUDA, Rust, Qiskit)
│   └── db.js              # SQLite engine for XP, streaks, and progress
├── client/                # Vite + React + Tailwind + Monaco Editor + xterm.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx         # Track switcher, XP and streak indicators
│   │   │   ├── LessonPane.jsx     # DataCamp-style problem statement & test runner
│   │   │   ├── EditorPane.jsx     # Monaco Editor (Python, C++, CUDA, Rust)
│   │   │   ├── TerminalTab.jsx    # xterm.js WebGL-accelerated terminal tabs
│   │   │   └── ObsidianDrawer.jsx # Vault note browser with deep-link triggers
└── solutions/             # Clean verified solutions committed under the hood
```

---

## 👥 Authorship & Collaboration

Maintained and developed by the **Core Engineering Team**.
Available under the MIT License.
