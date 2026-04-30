import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import * as db from './db';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

export const app = new Hono();

// Enable CORS
app.use('/*', cors());

// =====================
// PROJECT Routes
// =====================

app.post('/api/projects', async (c) => {
  try {
    const data = await c.req.json();
    const result = db.createProject({
      name: data.name,
      client: data.client,
      hourly_rate: data.hourly_rate,
      color: data.color
    });
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

app.get('/api/projects', (c) => {
  const projects = db.listProjects();
  return c.json(projects);
});

app.get('/api/projects/:id', (c) => {
  const project = db.getProject(parseInt(c.req.param('id')));
  if (!project) return c.json({ error: 'Project not found' }, 404);
  return c.json(project);
});

app.put('/api/projects/:id', async (c) => {
  try {
    const data = await c.req.json();
    const result = db.updateProject(parseInt(c.req.param('id')), {
      name: data.name,
      client: data.client,
      hourly_rate: data.hourly_rate,
      color: data.color
    });
    if (!result) return c.json({ error: 'Project not found' }, 404);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

app.delete('/api/projects/:id', (c) => {
  db.deleteProject(parseInt(c.req.param('id')));
  return c.json({ success: true });
});

// =====================
// SESSION Routes
// =====================

app.post('/api/sessions/start', async (c) => {
  try {
    const data = await c.req.json();

    // Resolve project by name if provided
    let projectId = data.project_id;
    if (data.project_name && !projectId) {
      let project = db.getProjectByName(data.project_name);
      if (!project) {
        // Create project if it doesn't exist
        project = db.createProject({
          name: data.project_name,
          client: data.client,
          hourly_rate: data.hourly_rate,
          color: data.color
        });
      }
      projectId = project.id;
    }

    if (!projectId) {
      return c.json({ error: 'project_id or project_name required' }, 400);
    }

    const result = db.createSession({
      project_id: projectId,
      task: data.task,
      notes: data.notes,
      tags: data.tags ? JSON.stringify(data.tags) : null
    });

    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

app.post('/api/sessions/:id/stop', (c) => {
  const result = db.stopSession(parseInt(c.req.param('id')));
  if (!result) return c.json({ error: 'No active session found' }, 404);
  return c.json(result);
});

app.post('/api/sessions/stop-all', (c) => {
  const stopped = db.stopAllActiveSessions();
  return c.json({ stopped: stopped.length, sessions: stopped });
});

app.get('/api/sessions/active', (c) => {
  const sessions = db.getActiveSessions();
  return c.json(sessions);
});

app.get('/api/sessions', (c) => {
  const limit = parseInt(c.req.query('limit') || '50');
  const sessions = db.listRecentSessions(limit);
  // Parse tags back to array
  for (const s of sessions) {
    if (s.tags) (s as any).tags_parsed = JSON.parse(s.tags);
  }
  return c.json(sessions);
});

app.get('/api/sessions/:id', (c) => {
  const session = db.getSession(parseInt(c.req.param('id')));
  if (!session) return c.json({ error: 'Session not found' }, 404);
  if (session.tags) (session as any).tags_parsed = JSON.parse(session.tags);
  return c.json(session);
});

app.put('/api/sessions/:id', async (c) => {
  const data = await c.req.json();
  const result = db.updateSession(parseInt(c.req.param('id')), {
    task: data.task,
    notes: data.notes,
    tags: data.tags ? JSON.stringify(data.tags) : null
  });
  if (!result) return c.json({ error: 'Session not found' }, 404);
  return c.json(result);
});

app.delete('/api/sessions/:id', (c) => {
  db.deleteSession(parseInt(c.req.param('id')));
  return c.json({ success: true });
});

// =====================
// REPORT Routes
// =====================

app.get('/api/reports/daily', (c) => {
  const startDate = c.req.query('start') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = c.req.query('end') || new Date().toISOString().split('T')[0];

  const summary = db.getDailySummary(startDate, endDate);
  return c.json(summary);
});

app.get('/api/reports/sessions', (c) => {
  const startDate = c.req.query('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = c.req.query('end') || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const sessions = db.getSessionsByDateRange(startDate, endDate);
  for (const s of sessions) {
    if (s.tags) (s as any).tags_parsed = JSON.parse(s.tags);
  }
  return c.json(sessions);
});

app.get('/api/reports/project/:id', (c) => {
  const result = db.getTotalTimeForProject(parseInt(c.req.param('id')));
  return c.json(result || { project_id: parseInt(c.req.param('id')), total_seconds: 0, session_count: 0 });
});

// =====================
// AGENT TOOL API
// =====================

// Simple status endpoint for agent tools
app.get('/api/agent/status', (c) => {
  const activeSessions = db.getActiveSessions();
  const recentSessions = db.listRecentSessions(5);
  const projects = db.listProjects();

  return c.json({
    active: activeSessions.map(s => ({
      id: s.id,
      project: s.project_name,
      task: s.task,
      start_time: s.start_time,
      duration_seconds: Math.floor((Date.now() - new Date(s.start_time).getTime()) / 1000)
    })),
    recent: recentSessions.slice(0, 5).map(s => ({
      id: s.id,
      project: s.project_name,
      task: s.task,
      duration_seconds: s.duration_seconds,
      start_time: s.start_time
    })),
    projects: projects.map(p => ({ id: p.id, name: p.name, client: p.client }))
  });
});

// Serve static files from public/
app.use('/*', serveStatic({ root: publicDir }));

// Fallback to index.html for SPA
app.get('*', async (c) => {
  const file = Bun.file(join(publicDir, 'index.html'));
  return c.html(await file.text());
});

export default app;