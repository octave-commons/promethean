export let KANBAN_STYLES = String.raw`
  :root {
    color-scheme: only light;
    font-family: "Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
  }

  body {
    margin: 0;
    background: radial-gradient(circle at top, #f8fafc, #e2e8f0);
    min-height: 100vh;
    color: #0f172a;
  }

  .kanban-app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 3rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .kanban-main {
    display: grid;
    grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
  }

  .kanban-sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .kanban-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .kanban-header h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    letter-spacing: -0.015em;
  }

  .muted {
    color: #475569;
    margin: 0.25rem 0;
    font-size: 0.9rem;
  }

  code {
    font-family: "JetBrains Mono", "Fira Mono", "SFMono-Regular",
      ui-monospace, monospace;
    padding: 0.1rem 0.35rem;
    border-radius: 6px;
    background: rgba(15, 23, 42, 0.08);
  }

  .kanban-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  button[data-action="refresh"] {
    appearance: none;
    border: none;
    padding: 0.6rem 1rem;
    border-radius: 9999px;
    font-weight: 600;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: white;
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25);
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  button[data-action="refresh"]:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(37, 99, 235, 0.28);
  }

  button[data-action="refresh"]:active {
    transform: translateY(0);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.22);
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
    gap: 1rem;
  }

  .metric {
    background: white;
    border-radius: 16px;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 18px 35px rgba(15, 23, 42, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .metric-value {
    font-size: 2.1rem;
    font-weight: 700;
  }

  .metric-label {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.75rem;
    color: #64748b;
  }

  .board-container {
    background: rgba(15, 23, 42, 0.04);
    border-radius: 18px;
    padding: 1.5rem;
    box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.16);
  }

  .panel {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 18px;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
    border: 1px solid rgba(148, 163, 184, 0.18);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
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
    gap: 1.5rem;
    align-items: flex-start;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .kanban-columns::-webkit-scrollbar {
    height: 10px;
  }

  .kanban-columns::-webkit-scrollbar-thumb {
    background: rgba(30, 64, 175, 0.35);
    border-radius: 999px;
  }

  .kanban-column {
    flex: 0 0 280px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), #fff);
    border-radius: 20px;
    padding: 1.1rem;
    box-shadow: 0 16px 30px rgba(15, 23, 42, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 1px solid rgba(148, 163, 184, 0.18);
  }

  .column-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .column-header h2 {
    margin: 0;
    font-size: 1.1rem;
    color: #1e3a8a;
  }

  .column-count {
    font-weight: 600;
    color: #334155;
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
    background: white;
    border-radius: 14px;
    padding: 0.85rem 1rem;
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
    border: 1px solid rgba(148, 163, 184, 0.25);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .task-card.is-selected {
    border-color: rgba(37, 99, 235, 0.6);
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .task-header h3 {
    margin: 0;
    font-size: 1rem;
  }

  .task-priority {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
    background: rgba(190, 242, 100, 0.35);
    color: #3f6212;
    font-weight: 700;
  }

  .task-priority[data-priority="P0"],
  .task-priority[data-priority="P1"] {
    background: rgba(248, 113, 113, 0.32);
    color: #b91c1c;
  }

  .task-priority[data-priority="P2"] {
    background: rgba(251, 191, 36, 0.32);
    color: #b45309;
  }

  .task-priority[data-priority="P3"],
  .task-priority[data-priority="P4"] {
    background: rgba(190, 242, 100, 0.28);
    color: #3f6212;
  }

  .task-labels {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .task-label {
    background: rgba(59, 130, 246, 0.18);
    color: #1d4ed8;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .task-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    font-size: 0.75rem;
    color: #475569;
  }

  .meta-label {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 600;
    margin-right: 0.25rem;
    color: #64748b;
  }

  .task-body {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.4;
    color: #1e293b;
  }

  .task-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .task-action {
    appearance: none;
    border: none;
    background: rgba(37, 99, 235, 0.12);
    color: #1d4ed8;
    border-radius: 999px;
    padding: 0.35rem 0.6rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .task-action:hover {
    background: rgba(37, 99, 235, 0.22);
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
    padding: 0.75rem;
    background: rgba(148, 163, 184, 0.15);
    border-radius: 12px;
    text-align: center;
    font-size: 0.85rem;
    color: #475569;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .kanban-app {
      padding: 1.5rem 1rem 2rem;
    }

    .kanban-header {
      align-items: flex-start;
    }

    .kanban-main {
      grid-template-columns: 1fr;
    }

    .kanban-columns {
      padding-bottom: 1rem;
    }

    .kanban-column {
      flex: 0 0 240px;
    }
  }
`;
