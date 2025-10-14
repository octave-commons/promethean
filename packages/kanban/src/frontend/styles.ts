export const KANBAN_STYLES = String.raw`
  :root {
    color-scheme: only light;
    font-family: "Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
    
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

  body {
    margin: 0;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
    min-height: 100vh;
    color: var(--color-text-primary);
    line-height: 1.6;
    font-size: var(--font-size-base);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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
    font-family: "JetBrains Mono", "Fira Mono", "SFMono-Regular",
      ui-monospace, monospace;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-md);
    background: var(--color-secondary-light);
    color: var(--color-text-primary);
    font-size: 0.875em;
    font-weight: 600;
    border: 1px solid var(--color-border);
  }

  .kanban-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  button[data-action="refresh"] {
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

  button[data-action="refresh"]::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  button[data-action="refresh"]:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: var(--shadow-xl);
    background: linear-gradient(135deg, var(--color-primary-hover), var(--color-primary));
  }

  button[data-action="refresh"]:hover::before {
    left: 100%;
  }

  button[data-action="refresh"]:active {
    transform: translateY(0) scale(0.98);
    box-shadow: var(--shadow-md);
    transition: all 0.1s ease;
  }

  .status {
    font-size: 0.9rem;
    font-weight: 600;
  }

  .status[data-state="loading"] {
    color: #0369a1;
  }

  .status[data-state="idle"] {
    color: #0f172a;
  }

  .status[data-state="error"] {
    color: #dc2626;
  }

  .board-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .metric {
    background: var(--color-surface);
    border-radius: var(--radius-2xl);
    padding: var(--space-5) var(--space-6);
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid var(--color-border);
    position: relative;
    overflow: hidden;
  }

  .metric::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-primary-hover));
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  .metric:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
    border-color: var(--color-primary-light);
  }

  .metric:hover::before {
    transform: scaleX(1);
  }

  .metric-value {
    font-size: var(--font-size-3xl);
    font-weight: 800;
    line-height: 1;
    background: linear-gradient(135deg, var(--color-text-primary), var(--color-primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .metric-label {
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    font-weight: 700;
  }

  .board-container {
    background: rgba(15, 23, 42, 0.02);
    border-radius: var(--radius-2xl);
    padding: var(--space-6);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(255, 255, 255, 0.1);
    border: 1px solid var(--color-border);
    backdrop-filter: blur(10px);
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

  .panel:hover {
    box-shadow: var(--shadow-xl);
    border-color: var(--color-primary-light);
  }

  .panel h2 {
    margin: 0;
    font-size: 1.1rem;
    color: #1e3a8a;
  }

  .panel-subheader {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #475569;
  }

  .panel-subheader h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #1f2937;
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

  .kanban-columns::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(90deg, var(--color-primary-hover), var(--color-primary));
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

  .kanban-column:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
    border-color: var(--color-primary-light);
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

  .task-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary-light);
  }

  .task-card:hover::before {
    opacity: 1;
  }

  .task-card.is-selected {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15), var(--shadow-lg);
    background: linear-gradient(135deg, var(--color-surface), var(--color-primary-light));
  }

  .task-card.is-selected::before {
    opacity: 1;
    width: 4px;
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

  .task-priority[data-priority="P0"],
  .task-priority[data-priority="P1"] {
    background: rgba(248, 113, 113, 0.15);
    color: #dc2626;
    border-color: rgba(248, 113, 113, 0.4);
    box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.1);
  }

  .task-priority[data-priority="P2"] {
    background: rgba(251, 191, 36, 0.15);
    color: #d97706;
    border-color: rgba(251, 191, 36, 0.4);
    box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.1);
  }

  .task-priority[data-priority="P3"],
  .task-priority[data-priority="P4"] {
    background: rgba(190, 242, 100, 0.15);
    color: #16a34a;
    border-color: rgba(190, 242, 100, 0.4);
    box-shadow: 0 0 0 1px rgba(190, 242, 100, 0.1);
  }

  .task-labels {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-1);
  }

  .task-label {
    background: var(--color-primary-light);
    color: var(--color-primary);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: 600;
    border: 1px solid rgba(59, 130, 246, 0.3);
    transition: all 0.2s ease;
  }

  .task-label:hover {
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



  .status-control select {
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.4);
    padding: 0.35rem 0.75rem;
    font-size: 0.8rem;
    background: rgba(248, 250, 252, 0.9);
    color: #1e293b;
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

  .selected-task header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
  }

  .selected-task header h3 {
    margin: 0;
    font-size: 1rem;
  }

  .selected-task header code {
    font-size: 0.75rem;
    color: #475569;
  }

  .selected-task-labels {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .selected-task-labels span {
    background: rgba(59, 130, 246, 0.12);
    color: #1d4ed8;
    border-radius: 999px;
    padding: 0.2rem 0.55rem;
    font-size: 0.75rem;
  }

  .selected-task-meta {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.35rem 0.75rem;
    font-size: 0.8rem;
    color: #475569;
  }

  .meta-key {
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .selected-task-body {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.5;
    color: #1f2937;
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

  .result-button {
    width: 100%;
    text-align: left;
    border: none;
    background: rgba(37, 99, 235, 0.08);
    border-radius: 12px;
    padding: 0.5rem 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    color: #1e293b;
    cursor: pointer;
  }

  .result-button:hover {
    background: rgba(37, 99, 235, 0.15);
  }

  .result-title {
    font-weight: 600;
  }

  .result-status {
    font-size: 0.8rem;
    color: #1d4ed8;
  }

  .search-results-list {
    list-style: none;
    margin: 0.75rem 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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

  .column-insight pre,
  .command-output pre {
    margin: 0;
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.05);
    border-radius: 12px;
    font-size: 0.8rem;
    max-height: 240px;
    overflow: auto;
  }

  .button-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.6rem;
  }

  .action-log {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.8rem;
  }

  .action-log li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 0.5rem;
    align-items: center;
  }

  .action-log li[data-status="ok"] {
    color: #166534;
  }

  .action-log li[data-status="error"] {
    color: #b91c1c;
  }

  .log-message {
    justify-self: end;
    font-weight: 500;
  }

  .task-empty {
    margin: 0;
    padding: var(--space-6);
    background: linear-gradient(135deg, var(--color-secondary-light), rgba(148, 163, 184, 0.1));
    border-radius: var(--radius-lg);
    text-align: center;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-style: italic;
    border: 2px dashed var(--color-border);
    position: relative;
    overflow: hidden;
  }

  .task-empty::before {
    content: '📋';
    display: block;
    font-size: 2rem;
    margin-bottom: var(--space-2);
    opacity: 0.5;
  }

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
    
    .board-overview {
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: var(--space-3);
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

    .board-overview {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    .metric {
      padding: var(--space-4) var(--space-3);
      text-align: center;
    }

    .metric-value {
      font-size: var(--font-size-2xl);
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

    .board-overview {
      grid-template-columns: 1fr;
      gap: var(--space-3);
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

    button[data-action="refresh"] {
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-xs);
    }
  }
`;
