import { Database } from 'bun:sqlite';
import { homedir } from 'os';
import { join } from 'path';
import { mkdirSync } from 'fs';

const dbPath = join(homedir(), '.chronos', 'chronos.db');

// Ensure directory exists
mkdirSync(join(homedir(), '.chronos'), { recursive: true });

export const db = new Database(dbPath);

// Initialize schema
db.run(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    client TEXT,
    hourly_rate REAL,
    color TEXT DEFAULT '#4a9eff',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    task TEXT,
    notes TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT,
    duration_seconds INTEGER,
    tags TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS agent_context (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    agent_name TEXT NOT NULL,
    agent_role TEXT DEFAULT 'assistant',
    context_type TEXT DEFAULT 'primary',
    metadata TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  )
`);

db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_id)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_start ON sessions(start_time)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_end ON sessions(end_time)`);

export interface Project {
  id: number;
  name: string;
  client?: string;
  hourly_rate?: number;
  color: string;
  created_at: string;
}

export interface Session {
  id: number;
  project_id: number;
  task?: string;
  notes?: string;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  tags?: string;
  created_at: string;
  project_name?: string;
  project_client?: string;
}

// Project operations - Bun SQLite uses .run() for inserts, .query() for selects
export const projectQueries = {
  create: db.query<{ id: number }, { $name: string; $client: string | null; $hourly_rate: number | null; $color: string }>(`
    INSERT INTO projects (name, client, hourly_rate, color)
    VALUES ($name, $client, $hourly_rate, $color)
  `),

  getById: db.query<Project, { $id: number }>(`
    SELECT * FROM projects WHERE id = $id
  `),

  getByName: db.query<Project, { $name: string }>(`
    SELECT * FROM projects WHERE name = $name
  `),

  list: db.query<Project, {}>(`
    SELECT * FROM projects ORDER BY created_at DESC
  `),

  update: db.query<{ changes: number }, { $id: number; $name: string | null; $client: string | null; $hourly_rate: number | null; $color: string | null }>(`
    UPDATE projects SET
      name = COALESCE($name, name),
      client = COALESCE($client, client),
      hourly_rate = COALESCE($hourly_rate, hourly_rate),
      color = COALESCE($color, color)
    WHERE id = $id
  `),

  delete: db.query<{ changes: number }, { $id: number }>(`
    DELETE FROM projects WHERE id = $id
  `)
};

// Session operations - use localtime for correct JS parsing
export const sessionQueries = {
  create: db.query<{ id: number }, { $project_id: number; $task: string | null; $notes: string | null; $tags: string | null }>(`
    INSERT INTO sessions (project_id, task, notes, start_time, tags)
    VALUES ($project_id, $task, $notes, datetime('now', 'localtime'), $tags)
  `),

  getById: db.query<Session & { project_name: string; project_client: string; hourly_rate: number; color: string }, { $id: number }>(`
    SELECT s.*, p.name as project_name, p.client as project_client, p.hourly_rate, p.color
    FROM sessions s
    JOIN projects p ON s.project_id = p.id
    WHERE s.id = $id
  `),

  getActive: db.query<Session & { project_name: string; project_client: string; hourly_rate: number; color: string }, {}>(`
    SELECT s.*, p.name as project_name, p.client as project_client, p.hourly_rate, p.color
    FROM sessions s
    JOIN projects p ON s.project_id = p.id
    WHERE s.end_time IS NULL
    ORDER BY s.start_time DESC
  `),

  stop: db.query<{ changes: number }, { $id: number }>(`
    UPDATE sessions SET
      end_time = datetime('now', 'localtime'),
      duration_seconds = CAST((julianday('now', 'localtime') - julianday(start_time)) * 86400 AS INTEGER)
    WHERE id = $id AND end_time IS NULL
  `),

  update: db.query<{ changes: number }, { $id: number; $task: string | null; $notes: string | null; $tags: string | null }>(`
    UPDATE sessions SET
      task = COALESCE($task, task),
      notes = COALESCE($notes, notes),
      tags = COALESCE($tags, tags)
    WHERE id = $id
  `),

  listRecent: db.query<Session & { project_name: string; project_client: string; hourly_rate: number; color: string }, { $limit: number }>(`
    SELECT s.*, p.name as project_name, p.client as project_client, p.hourly_rate, p.color
    FROM sessions s
    JOIN projects p ON s.project_id = p.id
    ORDER BY s.start_time DESC
    LIMIT $limit
  `),

  delete: db.query<{ changes: number }, { $id: number }>(`
    DELETE FROM sessions WHERE id = $id
  `),

  getByDateRange: db.query<Session & { project_name: string; project_client: string; hourly_rate: number; color: string }, { $start_date: string; $end_date: string }>(`
    SELECT s.*, p.name as project_name, p.client as project_client, p.hourly_rate, p.color
    FROM sessions s
    JOIN projects p ON s.project_id = p.id
    WHERE s.start_time >= $start_date AND s.start_time < $end_date
    ORDER BY s.start_time DESC
  `),

  getDailySummary: db.query<{ date: string; project_id: number; total_seconds: number; session_count: number }, { $start_date: string; $end_date: string }>(`
    SELECT
      date(start_time) as date,
      project_id,
      SUM(duration_seconds) as total_seconds,
      COUNT(*) as session_count
    FROM sessions
    WHERE start_time >= $start_date AND start_time < $end_date AND end_time IS NOT NULL
    GROUP BY date(start_time), project_id
    ORDER BY date DESC
  `),

  getTotalForProject: db.query<{ project_id: number; total_seconds: number; session_count: number }, { $project_id: number }>(`
    SELECT
      project_id,
      SUM(duration_seconds) as total_seconds,
      COUNT(*) as session_count
    FROM sessions
    WHERE project_id = $project_id AND end_time IS NOT NULL
    GROUP BY project_id
  `)
};

// Helper functions that execute the queries
export function createProject(data: { name: string; client?: string | null; hourly_rate?: number | null; color?: string }): Project {
  const result = projectQueries.create.run({
    $name: data.name,
    $client: data.client || null,
    $hourly_rate: data.hourly_rate || null,
    $color: data.color || '#4a9eff'
  });
  const project = projectQueries.getById.get({ $id: result.lastInsertRowid }) as Project;
  return project;
}

export function getProject(id: number): Project | null {
  return projectQueries.getById.get({ $id: id }) as Project | null;
}

export function getProjectByName(name: string): Project | null {
  return projectQueries.getByName.get({ $name: name }) as Project | null;
}

export function listProjects(): Project[] {
  return projectQueries.list.all({}) as Project[];
}

export function updateProject(id: number, data: { name?: string; client?: string; hourly_rate?: number; color?: string }): Project | null {
  projectQueries.update.run({
    $id: id,
    $name: data.name || null,
    $client: data.client || null,
    $hourly_rate: data.hourly_rate || null,
    $color: data.color || null
  });
  return getProject(id);
}

export function deleteProject(id: number): boolean {
  const result = projectQueries.delete.run({ $id: id });
  return result.changes > 0;
}

export function createSession(data: { project_id: number; task?: string | null; notes?: string | null; tags?: string | null }): Session {
  const result = sessionQueries.create.run({
    $project_id: data.project_id,
    $task: data.task || null,
    $notes: data.notes || null,
    $tags: data.tags || null
  });
  const session = sessionQueries.getById.get({ $id: result.lastInsertRowid }) as Session;
  return session;
}

export function getSession(id: number): Session | null {
  return sessionQueries.getById.get({ $id: id }) as Session | null;
}

export function getActiveSessions(): Session[] {
  return sessionQueries.getActive.all({}) as Session[];
}

export function stopSession(id: number): Session | null {
  sessionQueries.stop.run({ $id: id });
  return getSession(id);
}

export function stopAllActiveSessions(): Session[] {
  const active = getActiveSessions();
  for (const session of active) {
    sessionQueries.stop.run({ $id: session.id });
  }
  return active.map(s => getSession(s.id)).filter((s): s is Session => s !== null);
}

export function updateSession(id: number, data: { task?: string; notes?: string; tags?: string | null }): Session | null {
  sessionQueries.update.run({
    $id: id,
    $task: data.task || null,
    $notes: data.notes || null,
    $tags: data.tags || null
  });
  return getSession(id);
}

export function listRecentSessions(limit: number = 50): Session[] {
  return sessionQueries.listRecent.all({ $limit: limit }) as Session[];
}

export function deleteSession(id: number): boolean {
  const result = sessionQueries.delete.run({ $id: id });
  return result.changes > 0;
}

export function getSessionsByDateRange(startDate: string, endDate: string): Session[] {
  return sessionQueries.getByDateRange.all({ $start_date: startDate, $end_date: endDate }) as Session[];
}

export function getDailySummary(startDate: string, endDate: string): { date: string; project_id: number; total_seconds: number; session_count: number }[] {
  return sessionQueries.getDailySummary.all({ $start_date: startDate, $end_date: endDate });
}

export function getTotalTimeForProject(projectId: number): { project_id: number; total_seconds: number; session_count: number } | null {
  return sessionQueries.getTotalForProject.get({ $project_id: projectId }) as { project_id: number; total_seconds: number; session_count: number } | null;
}