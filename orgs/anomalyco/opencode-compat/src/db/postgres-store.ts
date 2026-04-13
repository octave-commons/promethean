import postgres from "postgres";

import type { CompatConfigDoc, CompatSession, CreateSessionInput, McpServerConfig, McpStatus, MessageWithParts, PermissionRequest, QuestionRequest, SessionListQuery, SessionStatus, StoredMcpServer, UpdateSessionInput } from "../lib/types.js";
import { buildMessageLookup, cloneValue, createSessionRecord, defaultSessionStatus, slugify } from "../lib/helpers.js";

type SessionRow = { document: CompatSession };
type ConfigRow = { document: CompatConfigDoc };
type MessageRow = { document: MessageWithParts["info"] };
type PartRow = { message_id: string; document: MessageWithParts["parts"][number] };
type StatusRow = { session_id: string; status: SessionStatus };
type McpRow = { name: string; config: McpServerConfig; status: McpStatus };
type PermissionRow = { document: PermissionRequest };
type QuestionRow = { document: QuestionRequest };

export async function createPostgresStore(version: string, databaseUrl: string) {
  const sql = postgres(databaseUrl, { prepare: false });
  await ensureSchema(sql);
  return new PostgresCompatStore(sql, version);
}

class PostgresCompatStore {
  constructor(
    private readonly sql: ReturnType<typeof postgres>,
    private readonly version: string
  ) {}

  private json(value: unknown) {
    return this.sql.json(JSON.parse(JSON.stringify(value)) as never);
  }

  async getConfig(directory: string): Promise<CompatConfigDoc | undefined> {
    const rows = await this.sql<ConfigRow[]>`
      select document
      from compat_config
      where directory = ${directory}
      limit 1
    `;
    return rows[0]?.document ? cloneValue(rows[0].document) : undefined;
  }

  async putConfig(directory: string, document: CompatConfigDoc): Promise<CompatConfigDoc> {
    const updatedAt = Date.now();
    await this.sql`
      insert into compat_config (directory, document, updated_at)
      values (${directory}, ${this.json(document)}, ${updatedAt})
      on conflict (directory)
      do update set document = excluded.document, updated_at = excluded.updated_at
    `;
    return cloneValue(document);
  }

  async listSessions(query: SessionListQuery): Promise<CompatSession[]> {
    const rows = await this.sql<SessionRow[]>`
      select document
      from compat_session
      order by updated_at desc
    `;
    return rows
      .map((row: SessionRow) => cloneValue(row.document))
      .filter((session: CompatSession) => {
        if (query.directory && session.directory !== query.directory) {
          return false;
        }
        if (query.roots && session.parentID) {
          return false;
        }
        if (typeof query.start === "number" && session.time.updated < query.start) {
          return false;
        }
        if (query.search && !session.title.toLowerCase().includes(query.search.toLowerCase())) {
          return false;
        }
        return true;
      })
      .slice(0, query.limit ?? Number.MAX_SAFE_INTEGER);
  }

  async createSession(input: CreateSessionInput): Promise<CompatSession> {
    const session = createSessionRecord({
      directory: input.directory,
      title: input.title ?? "New Session",
      version: this.version,
      parentID: input.parentID,
      permission: input.permission
    });
    await this.sql`
      insert into compat_session (
        id,
        directory,
        project_id,
        parent_id,
        title,
        slug,
        version,
        created_at,
        updated_at,
        archived_at,
        document
      )
      values (
        ${session.id},
        ${session.directory},
        ${session.projectID},
        ${session.parentID ?? null},
        ${session.title},
        ${session.slug},
        ${session.version},
        ${session.time.created},
        ${session.time.updated},
        ${session.time.archived ?? null},
        ${this.json(session)}
      )
    `;
    await this.setSessionStatus(session.id, session.directory, defaultSessionStatus());
    return session;
  }

  async getSession(sessionId: string): Promise<CompatSession | undefined> {
    const rows = await this.sql<SessionRow[]>`
      select document
      from compat_session
      where id = ${sessionId}
      limit 1
    `;
    return rows[0]?.document ? cloneValue(rows[0].document) : undefined;
  }

  async updateSession(sessionId: string, input: UpdateSessionInput): Promise<CompatSession | undefined> {
    const current = await this.getSession(sessionId);
    if (!current) {
      return undefined;
    }
    const next: CompatSession = {
      ...current,
      title: input.title ?? current.title,
      slug: input.title ? slugify(input.title) : current.slug,
      share: input.shareUrl === undefined ? current.share : (input.shareUrl ? { url: input.shareUrl } : undefined),
      time: {
        ...current.time,
        updated: Date.now(),
        archived: input.archived === undefined ? current.time.archived : input.archived
      }
    };
    await this.sql`
      update compat_session
      set title = ${next.title},
          slug = ${next.slug},
          updated_at = ${next.time.updated},
          archived_at = ${next.time.archived ?? null},
          document = ${this.json(next)}
      where id = ${sessionId}
    `;
    return next;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const rows = await this.sql<{ id: string }[]>`
      delete from compat_session
      where id = ${sessionId}
      returning id
    `;
    return rows.length > 0;
  }

  async listSessionChildren(sessionId: string): Promise<CompatSession[]> {
    const rows = await this.sql<SessionRow[]>`
      select document
      from compat_session
      where parent_id = ${sessionId}
      order by updated_at desc
    `;
    return rows.map((row: SessionRow) => cloneValue(row.document));
  }

  async listSessionStatus(directory?: string): Promise<Record<string, SessionStatus>> {
    const rows = directory
      ? await this.sql<StatusRow[]>`
          select session_id, status
          from compat_session_status
          where directory = ${directory}
        `
      : await this.sql<StatusRow[]>`
          select session_id, status
          from compat_session_status
        `;
    return Object.fromEntries(rows.map((row: StatusRow) => [row.session_id, cloneValue(row.status)]));
  }

  async setSessionStatus(sessionId: string, directory: string, status: SessionStatus): Promise<void> {
    const updatedAt = Date.now();
    await this.sql`
      insert into compat_session_status (session_id, directory, status, updated_at)
      values (${sessionId}, ${directory}, ${this.json(status)}, ${updatedAt})
      on conflict (session_id)
      do update set directory = excluded.directory, status = excluded.status, updated_at = excluded.updated_at
    `;
  }

  async listMessages(sessionId: string, limit?: number): Promise<MessageWithParts[]> {
    const messages = await this.sql<MessageRow[]>`
      select document
      from compat_message
      where session_id = ${sessionId}
      order by position asc
    `;
    const parts = await this.sql<PartRow[]>`
      select message_id, document
      from compat_message_part
      where session_id = ${sessionId}
      order by position asc
    `;
    const grouped = new Map<string, MessageWithParts["parts"]>();
    for (const row of parts) {
      const items = grouped.get(row.message_id) ?? [];
      items.push(cloneValue(row.document));
      grouped.set(row.message_id, items);
    }
    const entries = messages.map((row: MessageRow) => ({
      info: cloneValue(row.document),
      parts: grouped.get(row.document.id) ?? []
    }));
    if (typeof limit === "number") {
      return entries.slice(-limit);
    }
    return entries;
  }

  async getMessage(sessionId: string, messageId: string): Promise<MessageWithParts | undefined> {
    const entries = buildMessageLookup(await this.listMessages(sessionId));
    return entries[messageId];
  }

  async appendMessage(entry: MessageWithParts, directory: string): Promise<void> {
    const positionRows = await this.sql<{ next_position: number }[]>`
      select coalesce(max(position), 0) + 1 as next_position
      from compat_message
      where session_id = ${entry.info.sessionID}
    `;
    const position = positionRows[0]?.next_position ?? 1;
    await this.sql`
      insert into compat_message (id, session_id, directory, role, position, created_at, document)
      values (
        ${entry.info.id},
        ${entry.info.sessionID},
        ${directory},
        ${entry.info.role},
        ${position},
        ${entry.info.time.created},
        ${this.json(entry.info)}
      )
    `;
    for (const [index, part] of entry.parts.entries()) {
      await this.sql`
        insert into compat_message_part (id, session_id, message_id, position, kind, document)
        values (${part.id}, ${entry.info.sessionID}, ${entry.info.id}, ${index + 1}, ${part.type}, ${this.json(part)})
      `;
    }
    const session = await this.getSession(entry.info.sessionID);
    if (!session) {
      return;
    }
    session.time.updated = Date.now();
    await this.sql`
      update compat_session
      set updated_at = ${session.time.updated}, document = ${this.json(session)}
      where id = ${session.id}
    `;
  }

  async listMcp(directory: string): Promise<Record<string, StoredMcpServer>> {
    const rows = await this.sql<McpRow[]>`
      select name, config, status
      from compat_mcp_server
      where directory = ${directory}
      order by name asc
    `;
    return Object.fromEntries(rows.map((row: McpRow) => [row.name, {
      directory,
      name: row.name,
      config: cloneValue(row.config),
      status: cloneValue(row.status)
    }]));
  }

  async putMcp(directory: string, name: string, config: McpServerConfig, status: McpStatus): Promise<Record<string, StoredMcpServer>> {
    await this.sql`
      insert into compat_mcp_server (directory, name, config, status, updated_at)
      values (${directory}, ${name}, ${this.json(config)}, ${this.json(status)}, ${Date.now()})
      on conflict (directory, name)
      do update set config = excluded.config, status = excluded.status, updated_at = excluded.updated_at
    `;
    return this.listMcp(directory);
  }

  async getMcp(directory: string, name: string): Promise<StoredMcpServer | undefined> {
    const rows = await this.sql<McpRow[]>`
      select name, config, status
      from compat_mcp_server
      where directory = ${directory} and name = ${name}
      limit 1
    `;
    const row = rows[0];
    if (!row) {
      return undefined;
    }
    return {
      directory,
      name: row.name,
      config: cloneValue(row.config),
      status: cloneValue(row.status)
    };
  }

  async setMcpStatus(directory: string, name: string, status: McpStatus): Promise<Record<string, StoredMcpServer>> {
    await this.sql`
      update compat_mcp_server
      set status = ${this.json(status)}, updated_at = ${Date.now()}
      where directory = ${directory} and name = ${name}
    `;
    return this.listMcp(directory);
  }

  async listPermissions(): Promise<PermissionRequest[]> {
    const rows = await this.sql<PermissionRow[]>`
      select document
      from compat_permission_request
      where resolved_at is null
      order by created_at asc
    `;
    return rows.map((row: PermissionRow) => cloneValue(row.document));
  }

  async getPermission(requestId: string): Promise<PermissionRequest | undefined> {
    const rows = await this.sql<PermissionRow[]>`
      select document
      from compat_permission_request
      where id = ${requestId}
      limit 1
    `;
    return rows[0]?.document ? cloneValue(rows[0].document) : undefined;
  }

  async putPermission(request: PermissionRequest): Promise<void> {
    await this.sql`
      insert into compat_permission_request (id, session_id, document, created_at, resolved_at)
      values (${request.id}, ${request.sessionID}, ${this.json(request)}, ${Date.now()}, null)
      on conflict (id)
      do update set document = excluded.document, session_id = excluded.session_id
    `;
  }

  async resolvePermission(requestId: string): Promise<PermissionRequest | undefined> {
    const current = await this.getPermission(requestId);
    if (!current) {
      return undefined;
    }
    await this.sql`
      update compat_permission_request
      set resolved_at = ${Date.now()}
      where id = ${requestId}
    `;
    return current;
  }

  async listQuestions(): Promise<QuestionRequest[]> {
    const rows = await this.sql<QuestionRow[]>`
      select document
      from compat_question_request
      where resolved_at is null
      order by created_at asc
    `;
    return rows.map((row: QuestionRow) => cloneValue(row.document));
  }

  async getQuestion(requestId: string): Promise<QuestionRequest | undefined> {
    const rows = await this.sql<QuestionRow[]>`
      select document
      from compat_question_request
      where id = ${requestId}
      limit 1
    `;
    return rows[0]?.document ? cloneValue(rows[0].document) : undefined;
  }

  async putQuestion(request: QuestionRequest): Promise<void> {
    await this.sql`
      insert into compat_question_request (id, session_id, document, created_at, resolved_at)
      values (${request.id}, ${request.sessionID}, ${this.json(request)}, ${Date.now()}, null)
      on conflict (id)
      do update set document = excluded.document, session_id = excluded.session_id
    `;
  }

  async resolveQuestion(requestId: string): Promise<QuestionRequest | undefined> {
    const current = await this.getQuestion(requestId);
    if (!current) {
      return undefined;
    }
    await this.sql`
      update compat_question_request
      set resolved_at = ${Date.now()}
      where id = ${requestId}
    `;
    return current;
  }

  async rejectQuestion(requestId: string): Promise<QuestionRequest | undefined> {
    return this.resolveQuestion(requestId);
  }

  async close(): Promise<void> {
    await this.sql.end({ timeout: 1 });
  }
}

async function ensureSchema(sql: ReturnType<typeof postgres>) {
  await sql.unsafe(`
    create table if not exists compat_config (
      directory text primary key,
      document jsonb not null,
      updated_at double precision not null
    );

    create table if not exists compat_session (
      id text primary key,
      directory text not null,
      project_id text not null,
      parent_id text,
      title text not null,
      slug text not null,
      version text not null,
      created_at double precision not null,
      updated_at double precision not null,
      archived_at double precision,
      document jsonb not null
    );

    create index if not exists compat_session_directory_updated_idx
      on compat_session (directory, updated_at desc);

    create table if not exists compat_session_status (
      session_id text primary key references compat_session(id) on delete cascade,
      directory text not null,
      status jsonb not null,
      updated_at double precision not null
    );

    create table if not exists compat_message (
      id text primary key,
      session_id text not null references compat_session(id) on delete cascade,
      directory text not null,
      role text not null,
      position integer not null,
      created_at double precision not null,
      document jsonb not null
    );

    create index if not exists compat_message_session_position_idx
      on compat_message (session_id, position asc);

    create table if not exists compat_message_part (
      id text primary key,
      session_id text not null references compat_session(id) on delete cascade,
      message_id text not null references compat_message(id) on delete cascade,
      position integer not null,
      kind text not null,
      document jsonb not null
    );

    create index if not exists compat_message_part_message_position_idx
      on compat_message_part (message_id, position asc);

    create table if not exists compat_mcp_server (
      directory text not null,
      name text not null,
      config jsonb not null,
      status jsonb not null,
      updated_at double precision not null,
      primary key (directory, name)
    );

    create table if not exists compat_permission_request (
      id text primary key,
      session_id text not null,
      document jsonb not null,
      created_at double precision not null,
      resolved_at double precision
    );

    create table if not exists compat_question_request (
      id text primary key,
      session_id text not null,
      document jsonb not null,
      created_at double precision not null,
      resolved_at double precision
    );
  `);
}
