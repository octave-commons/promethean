// SPDX-License-Identifier: GPL-3.0-only
// Sessions API

export interface Session {
  id: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  isAgentTask?: boolean;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export async function listSessions(): Promise<Session[]> {
  // Implementation placeholder
  throw new Error('Not implemented');
}

export async function createSession(options: any): Promise<Session> {
  // Implementation placeholder
  throw new Error('Not implemented');
}

export async function getSession(sessionId: string): Promise<Session> {
  // Implementation placeholder
  throw new Error('Not implemented');
}

export async function closeSession(sessionId: string): Promise<void> {
  // Implementation placeholder
  throw new Error('Not implemented');
}

export async function searchSessions(query: string): Promise<Session[]> {
  // Implementation placeholder
  throw new Error('Not implemented');
}

export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  // Implementation placeholder
  throw new Error('Not implemented');
}

export async function sendMessage(sessionId: string, message: string): Promise<Message> {
  // Implementation placeholder
  throw new Error('Not implemented');
}
