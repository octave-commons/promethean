(ns styles)

(def kanban-styles
  (str ":root {
  --color-scheme: light dark;
  --font-family: Inter, 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  /* Enhanced typography scale */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  
  /* Improved spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  
  /* Enhanced color palette */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-light: #dbeafe;
  --color-secondary: #64748b;
  --color-secondary-light: #f1f5f9;
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-danger: #dc2626;
  --color-background: #f8fafc;
  --color-surface: #ffffff;
  --color-border: #e2e8f0;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #64748b;
  
  /* Enhanced shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  
  /* Enhanced border radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
}

/* Dark mode variables - Monokai Theme */
:root[data-theme="dark"] {
  /* Monokai color palette */
  --color-primary: #66d9ef; /* Cyan */
  --color-primary-hover: #4ec9dc;
  --color-primary-light: #1a3a4a;
  --color-secondary: #75715e; /* Brown/gray */
  --color-secondary-light: #3e3d32; /* Dark background */
  --color-success: #a6e22e; /* Green */
  --color-warning: #fd971f; /* Orange */
  --color-danger: #f92672; /* Pink/red */
  --color-background: #272822; /* Monokai background */
  --color-surface: #3e3d32; /* Slightly lighter background */
  --color-border: #49483e; /* Border color */
  --color-text-primary: #f8f8f2; /* Main text */
  --color-text-secondary: #e6db74; /* Yellow */
  --color-text-muted: #75715e; /* Comment color */
  
  /* Monokai syntax highlighting colors */
  --monokai-yellow: #e6db74;
  --monokai-orange: #fd971f;
  --monokai-red: #f92672;
  --monokai-magenta: #fd97ff;
  --monokai-blue: #66d9ef;
  --monokai-cyan: #a1efe4;
  --monokai-green: #a6e22e;
  --monokai-purple: #ae81ff;
  --monokai-brown: #75715e;
  --monokai-pink: #f92672;
  --monokai-light-gray: #f8f8f2;
  --monokai-gray: #75715e;
  --monokai-dark-gray: #3e3d32;
  --monokai-darker: #272822;
}

body {
  margin: 0;
  background: var(--color-background);
  min-height: 100vh;
  color: var(--color-text-primary);
  line-height: 1.6;
  font-size: var(--font-size-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background 0.3s ease, color 0.3s ease;
}

/* Dark mode specific body styling */
:root[data-theme="dark"] body {
  background: var(--color-background);
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(102, 217, 239, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(166, 226, 46, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(249, 38, 114, 0.05) 0%, transparent 50%);
}

.kanban-app {
  width: 100%;
  margin: 0;
  padding: var(--space-10) var(--space-6) var(--space-12);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 100vw;
  overflow-x: hidden;
}

.kanban-main {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr);
  gap: var(--space-6);
  align-items: start;
  min-height: 0;
}

.kanban-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  position: sticky;
  top: var(--space-6);
  max-height: calc(100vh - var(--space-12));
  overflow-y: auto;
}

.kanban-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-6);
  flex-wrap: wrap;
  margin-bottom: var(--space-2);
}

.kanban-header h1 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-4xl);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  background: linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.muted {
  color: var(--color-text-secondary);
  margin: var(--space-1) 0;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

code {
  font-family: 'JetBrains Mono', 'Fira Mono', 'SFMono-Regular', ui-monospace, monospace;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  background: var(--color-secondary-light);
  color: var(--color-text-primary);
  font-size: 0.875em;
  font-weight: 600;
  border: 1px solid var(--color-border);
}

:root[data-theme="dark"] code {
  background: var(--monokai-dark-gray);
  color: var(--monokai-light-gray);
  border: 1px solid var(--monokai-border);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
}

.kanban-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dark-mode-toggle {
  appearance: none;
  border: none;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: var(--font-size-sm);
  background: linear-gradient(135deg, var(--color-secondary), var(--color-text-secondary));
  color: white;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

:root[data-theme="dark"] .dark-mode-toggle {
  background: linear-gradient(135deg, var(--monokai-purple), var(--monokai-blue));
  box-shadow: 0 8px 25px rgba(174, 129, 255, 0.3), 0 4px 10px rgba(102, 217, 239, 0.2);
}

.dark-mode-toggle::before {
  content: '🌙';
  font-size: var(--font-size-base);
  transition: opacity 0.3s ease;
}

.dark-mode-toggle[data-theme=\"dark\"]::before {
  content: '☀️';
}

.dark-mode-toggle:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--shadow-xl);
  background: linear-gradient(135deg, var(--color-text-secondary), var(--color-secondary));
}

.dark-mode-toggle:active {
  transform: translateY(0) scale(0.98);
  box-shadow: var(--shadow-md);
  transition: all 0.1s ease;
}

button[data-action='refresh'] {
  appearance: none;
  border: none;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: var(--font-size-sm);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: white;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

button[data-action='refresh']:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--shadow-xl);
  background: linear-gradient(135deg, var(--color-primary-hover), var(--color-primary));
}

button[data-action='refresh']:active {
  transform: translateY(0) scale(0.98);
  box-shadow: var(--shadow-md);
  transition: all 0.1s ease;
}

.status {
  font-size: 0.9rem;
  font-weight: 600;
}

.status[data-state='loading'] {
  color: #0369a1;
}

.status[data-state='idle'] {
  color: #0f172a;
}

.status[data-state='error'] {
  color: #dc2626;
}

.board-container {
  background: rgba(15, 23, 42, 0.02);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid var(--color-border);
  backdrop-filter: blur(10px);
}

:root[data-theme="dark"] .board-container {
  background: rgba(62, 61, 50, 0.3);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(102, 217, 239, 0.1);
  border: 1px solid var(--monokai-border);
}

.panel {
  background: rgba(255, 255, 255, 0.98);
  border-radius: var(--radius-2xl);
  padding: var(--space-5) var(--space-6);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
}

:root[data-theme="dark"] .panel {
  background: rgba(62, 61, 50, 0.95);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4), 0 4px 10px rgba(102, 217, 239, 0.1);
  border: 1px solid var(--monokai-border);
}

.panel:hover {
  box-shadow: var(--shadow-xl);
  border-color: var(--color-primary-light);
}

.panel h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e3a8a;
}

.kanban-columns {
  display: flex;
  gap: var(--space-6);
  align-items: flex-start;
  overflow-x: auto;
  padding-bottom: var(--space-2);
  scroll-behavior: smooth;
}

.kanban-columns::-webkit-scrollbar {
  height: 12px;
}

.kanban-columns::-webkit-scrollbar-track {
  background: var(--color-secondary-light);
  border-radius: var(--radius-full);
}

.kanban-columns::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-hover));
  border-radius: var(--radius-full);
  border: 2px solid var(--color-secondary-light);
}

.kanban-column {
  flex: 0 0 280px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95));
  border-radius: var(--radius-2xl);
  padding: var(--space-5);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  border: 1px solid var(--color-border);
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

:root[data-theme="dark"] .kanban-column {
  background: linear-gradient(180deg, rgba(62, 61, 50, 0.95), rgba(46, 45, 36, 0.9));
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 4px 10px rgba(102, 217, 239, 0.05);
  border: 1px solid var(--monokai-border);
}

.kanban-column:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
  border-color: var(--color-primary-light);
}

.kanban-column::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-hover));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.kanban-column:hover::before {
  opacity: 1;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.column-header h2 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.3;
}

.column-count {
  font-weight: 700;
  color: var(--color-text-secondary);
  background: var(--color-secondary-light);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  border: 1px solid var(--color-border);
}

.task-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.task-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

:root[data-theme="dark"] .task-card {
  background: rgba(46, 45, 36, 0.8);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(102, 217, 239, 0.05);
  border: 1px solid var(--monokai-border);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-light);
}

.task-card.is-selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15), var(--shadow-lg);
  background: linear-gradient(135deg, var(--color-surface), var(--color-primary-light));
}

:root[data-theme="dark"] .task-card.is-selected {
  border-color: var(--monokai-cyan);
  box-shadow: 0 0 0 3px rgba(102, 217, 239, 0.3), 0 10px 25px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, rgba(46, 45, 36, 0.9), rgba(26, 58, 74, 0.6));
}

.task-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, var(--color-primary), var(--color-primary-hover));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.task-card:hover::before {
  opacity: 1;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-2);
}

.task-header h3 {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-text-primary);
  flex: 1;
  word-break: break-word;
}

.task-priority {
  font-size: var(--font-size-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  background: rgba(190, 242, 100, 0.35);
  color: #3f6212;
  font-weight: 700;
  border: 1px solid rgba(190, 242, 100, 0.5);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.task-priority:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-sm);
}

.task-priority[data-priority='P0'],
.task-priority[data-priority='P1'] {
  background: rgba(249, 38, 114, 0.15);
  color: var(--monokai-red);
  border-color: rgba(249, 38, 114, 0.4);
  box-shadow: 0 0 0 1px rgba(249, 38, 114, 0.1);
}

.task-priority[data-priority='P2'] {
  background: rgba(253, 151, 31, 0.15);
  color: var(--monokai-orange);
  border-color: rgba(253, 151, 31, 0.4);
  box-shadow: 0 0 0 1px rgba(253, 151, 31, 0.1);
}

.task-priority[data-priority='P3'],
.task-priority[data-priority='P4'] {
  background: rgba(166, 226, 46, 0.15);
  color: var(--monokai-green);
  border-color: rgba(166, 226, 46, 0.4);
  box-shadow: 0 0 0 1px rgba(166, 226, 46, 0.1);
}

/* Dark mode priority enhancements */
:root[data-theme="dark"] .task-priority[data-priority='P0'],
:root[data-theme="dark"] .task-priority[data-priority='P1'] {
  background: rgba(249, 38, 114, 0.25);
  color: var(--monokai-pink);
  text-shadow: 0 0 3px rgba(249, 38, 114, 0.3);
}

:root[data-theme="dark"] .task-priority[data-priority='P2'] {
  background: rgba(253, 151, 31, 0.25);
  color: var(--monokai-orange);
  text-shadow: 0 0 3px rgba(253, 151, 31, 0.3);
}

:root[data-theme="dark"] .task-priority[data-priority='P3'],
:root[data-theme="dark"] .task-priority[data-priority='P4'] {
  background: rgba(166, 226, 46, 0.25);
  color: var(--monokai-green);
  text-shadow: 0 0 3px rgba(166, 226, 46, 0.3);
}

.task-labels {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.task-labels span {
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  border: 1px solid rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease;
}

.task-labels span:hover {
  background: var(--color-primary);
  color: white;
  transform: scale(1.05);
  box-shadow: var(--shadow-sm);
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-1);
}

.meta-label {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  margin-right: var(--space-1);
  color: var(--color-text-muted);
}

.task-body {
  margin: 0;
  font-size: var(--font-size-sm);
  line-height: 1.5;
  color: var(--color-text-secondary);
  font-weight: 400;
}

.task-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-1);
}

.task-action {
  appearance: none;
  border: none;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.task-action:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-1px) scale(1.05);
  box-shadow: var(--shadow-md);
}

.task-action:active {
  transform: translateY(0) scale(0.95);
}

.command-button {
  appearance: none;
  border: none;
  border-radius: 999px;
  padding: 0.55rem 0.95rem;
  font-weight: 600;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.command-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.28);
}

.command-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.search-form input {
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  padding: 0.55rem 0.75rem;
  font-size: 0.9rem;
}

.search-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.column-form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.column-form select {
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  padding: 0.5rem 0.65rem;
  font-size: 0.9rem;
}

.column-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.6rem;
}

.visually-hidden {
  position: absolute;
  clip: rect(0 0 0 0);
  width: 1px;
  height: 1px;
  margin: -1px;
  border: 0;
  padding: 0;
  overflow: hidden;
}

/* Form styles */
.task-form {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.task-form input,
.task-form textarea,
.task-form select {
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 0.6rem 0.8rem;
  font-size: 0.9rem;
  font-family: var(--font-family);
  background: var(--color-surface);
  color: var(--color-text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

:root[data-theme="dark"] .task-form input,
:root[data-theme="dark"] .task-form textarea,
:root[data-theme="dark"] .task-form select {
  background: var(--monokai-dark-gray);
  border: 1px solid var(--monokai-border);
  color: var(--monokai-light-gray);
}

.task-form input:focus,
.task-form textarea:focus,
.task-form select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

:root[data-theme="dark"] .task-form input:focus,
:root[data-theme="dark"] .task-form textarea:focus,
:root[data-theme="dark"] .task-form select:focus {
  border-color: var(--monokai-cyan);
  box-shadow: 0 0 0 3px rgba(102, 217, 239, 0.2);
}

.task-form textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-buttons {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.delete-button {
  background: linear-gradient(135deg, var(--color-danger), #dc2626) !important;
  box-shadow: 0 8px 18px rgba(220, 38, 38, 0.25) !important;
}

.delete-button:hover {
  background: linear-gradient(135deg, #dc2626, var(--color-danger)) !important;
  box-shadow: 0 12px 24px rgba(220, 38, 38, 0.28) !important;
}

:root[data-theme="dark"] .delete-button {
  background: linear-gradient(135deg, var(--monokai-red), var(--monokai-pink)) !important;
  box-shadow: 0 8px 18px rgba(249, 38, 114, 0.3) !important;
}

:root[data-theme="dark"] .delete-button:hover {
  background: linear-gradient(135deg, var(--monokai-pink), var(--monokai-red)) !important;
  box-shadow: 0 12px 24px rgba(249, 38, 114, 0.4) !important;
}

/* Panel headers */
.panel h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary-light);
  padding-bottom: var(--space-2);
}

:root[data-theme="dark"] .panel h2 {
  color: var(--monokai-cyan);
  border-bottom-color: rgba(102, 217, 239, 0.2);
}

.panel-subheader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.panel-subheader h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Search results */
.search-results-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.result-button {
  appearance: none;
  border: none;
  background: var(--color-secondary-light);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
}

:root[data-theme="dark"] .result-button {
  background: var(--monokai-dark-gray);
  border: 1px solid var(--monokai-border);
}

.result-button:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

:root[data-theme="dark"] .result-button:hover {
  background: rgba(102, 217, 239, 0.1);
  border-color: var(--monokai-cyan);
}

.result-title {
  font-weight: 600;
  color: var(--color-text-primary);
  flex: 1;
}

.result-status {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  background: var(--color-secondary-light);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-weight: 600;
}

.search-single {
  text-align: center;
}

/* Column insight */
.column-insight pre {
  background: var(--color-secondary-light);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  font-size: var(--font-size-xs);
  overflow-x: auto;
  margin: 0;
}

:root[data-theme="dark"] .column-insight pre {
  background: var(--monokai-dark-gray);
  border: 1px solid var(--monokai-border);
  color: var(--monokai-light-gray);
}

/* Command output */
.command-output pre {
  background: var(--color-secondary-light);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  font-size: var(--font-size-xs);
  overflow-x: auto;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

:root[data-theme="dark"] .command-output pre {
  background: var(--monokai-dark-gray);
  border: 1px solid var(--monokai-border);
  color: var(--monokai-light-gray);
}

/* Action log */
.action-log {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-height: 200px;
  overflow-y: auto;
}

.action-log li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-secondary-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  border: 1px solid var(--color-border);
}

:root[data-theme="dark"] .action-log li {
  background: var(--monokai-dark-gray);
  border: 1px solid var(--monokai-border);
}

.action-log li[data-status="ok"] {
  border-left: 3px solid var(--color-success);
}

.action-log li[data-status="error"] {
  border-left: 3px solid var(--color-danger);
}

.log-message {
  flex: 1;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* Status indicators */
.status[data-state='loading'] {
  color: var(--monokai-blue);
}

.status[data-state='idle'] {
  color: var(--monokai-green);
}

.status[data-state='error'] {
  color: var(--monokai-red);
}

.task-empty {
  color: var(--color-text-muted);
  font-style: italic;
  text-align: center;
  padding: var(--space-4);
}

/* Responsive design */
@media (max-width: 1024px) {
  .kanban-main {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  .kanban-sidebar {
    position: static;
    max-height: none;
    order: -1;
  }
}

@media (max-width: 768px) {
  .kanban-app {
    padding: var(--space-6) var(--space-4) var(--space-8);
    gap: var(--space-4);
  }
  
  .kanban-header {
    align-items: flex-start;
    gap: var(--space-4);
    flex-direction: column;
  }
  
  .kanban-header h1 {
    font-size: var(--font-size-3xl);
  }
  
  .kanban-controls {
    width: 100%;
    justify-content: flex-start;
  }
  
  .kanban-columns {
    gap: var(--space-4);
    padding-bottom: var(--space-4);
  }
  
  .kanban-column {
    flex: 0 0 260px;
    padding: var(--space-4);
  }
  
  .panel {
    padding: var(--space-4);
  }
}

@media (max-width: 480px) {
  .kanban-app {
    padding: var(--space-4) var(--space-3) var(--space-6);
  }
  
  .kanban-header h1 {
    font-size: var(--font-size-2xl);
  }
  
  .kanban-columns {
    gap: var(--space-3);
  }
  
  .kanban-column {
    flex: 0 0 280px;
    padding: var(--space-3);
  }
  
  .task-card {
    padding: var(--space-3);
  }
  
  .panel {
    padding: var(--space-3);
  }
  
  button[data-action='refresh'] {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-xs);
  }
}"))

(defn inject-styles! []
  "Inject the kanban styles into the document"
  (let [style-element (.createElement js/document "style")]
    (set! (.-innerHTML style-element) kanban-styles)
    (.appendChild (.-head js/document) style-element)))