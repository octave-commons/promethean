/**
 * Unified Content Model for Indexing Architecture
 *
 * This file defines the unified content model that standardizes data structures
 * across all indexing systems (files, messages, events, attachments).
 */
import type { DualStoreMetadata } from './types.js';
/**
 * Core content types that can be indexed
 */
export type ContentType = 'file' | 'message' | 'event' | 'session' | 'attachment' | 'thought' | 'document' | 'task' | 'board';
/**
 * Source systems that produce content
 */
export type ContentSource = 'filesystem' | 'discord' | 'opencode' | 'agent' | 'user' | 'system' | 'external' | 'kanban';
/**
 * Standardized metadata fields for all content types
 */
export interface BaseContentMetadata {
    id?: string;
    type?: ContentType;
    source?: ContentSource;
    timestamp?: number;
    created_at?: number;
    updated_at?: number;
    user_id?: string;
    user_name?: string;
    author_urn?: string;
    session_id?: string;
    space_urn?: string;
    tags?: string[];
    category?: string;
    language?: string;
    content_type?: string;
    encoding?: string;
    size?: number;
    checksum?: string;
    indexed_at?: number;
    vector_write_success?: boolean;
    vector_write_error?: string;
    vector_write_timestamp?: number | null;
    userName?: string;
    isThought?: boolean;
    caption?: string;
}
/**
 * File-specific metadata
 */
export interface FileMetadata extends BaseContentMetadata {
    type: 'file';
    source: 'filesystem';
    path: string;
    extension?: string;
    directory?: string;
    line_count?: number;
    word_count?: number;
    language_detected?: string;
    chunk_index?: number;
    start_line?: number;
    end_line?: number;
    bytes_start?: number;
    bytes_end?: number;
}
/**
 * Message-specific metadata
 */
export interface MessageMetadata extends BaseContentMetadata {
    type: 'message';
    source: 'discord' | 'opencode' | 'agent';
    message_id?: string;
    foreign_id?: string;
    thread_id?: string;
    channel_id?: string;
    role?: 'user' | 'assistant' | 'system';
    reply_to?: string;
    mentions?: string[];
    reactions?: Array<{
        emoji: string;
        count: number;
        users?: string[];
    }>;
    provider?: string;
    tenant?: string;
}
/**
 * Event-specific metadata
 */
export interface EventMetadata extends BaseContentMetadata {
    type: 'event';
    source: 'opencode' | 'agent' | 'system';
    event_id?: string;
    event_type?: string;
    agent_id?: string;
    data?: Record<string, unknown>;
    properties?: Record<string, unknown>;
    processed?: boolean;
    error?: string;
}
/**
 * Session-specific metadata
 */
export interface SessionMetadata extends BaseContentMetadata {
    type: 'session';
    source: 'opencode' | 'agent';
    session_id: string;
    title?: string;
    description?: string;
    status?: 'active' | 'closed' | 'paused';
    started_at?: number;
    ended_at?: number;
    duration?: number;
    context?: Record<string, unknown>;
    variables?: Record<string, unknown>;
}
/**
 * Attachment-specific metadata
 */
export interface AttachmentMetadata extends BaseContentMetadata {
    type: 'attachment';
    source: 'discord' | 'filesystem' | 'user';
    attachment_urn?: string;
    message_id?: string;
    url?: string;
    filename?: string;
    content_type?: string;
    size?: number;
    sha256?: string;
    downloaded?: boolean;
    processed?: boolean;
    thumbnail_path?: string;
}
/**
 * Thought-specific metadata (for agent thoughts/reasoning)
 */
export interface ThoughtMetadata extends BaseContentMetadata {
    type: 'thought';
    source: 'agent' | 'system';
    thought_id?: string;
    reasoning_type?: 'analysis' | 'planning' | 'reflection' | 'decision';
    confidence?: number;
    context_id?: string;
    related_thoughts?: string[];
    premises?: string[];
    conclusion?: string;
}
/**
 * Document-specific metadata (for processed documents)
 */
export interface DocumentMetadata extends BaseContentMetadata {
    type: 'document';
    source?: 'filesystem' | 'external' | 'user';
    document_id?: string;
    title?: string;
    authors?: string[];
    summary?: string;
    sections?: Array<{
        title: string;
        content: string;
        level: number;
    }>;
    topics?: string[];
    entities?: Array<{
        name: string;
        type: string;
        confidence: number;
    }>;
}
/**
 * Task-specific metadata
 */
export interface TaskMetadata extends BaseContentMetadata {
    type: 'task';
    source: 'kanban' | 'agent';
    task_id?: string;
    title?: string;
    description?: string;
    status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    assignee?: string;
    labels?: string[];
    due_date?: number;
    parent_task?: string;
    subtasks?: string[];
    dependencies?: string[];
    blocks?: string[];
}
/**
 * Board-specific metadata
 */
export interface BoardMetadata extends BaseContentMetadata {
    type: 'board';
    source: 'kanban';
    board_id?: string;
    name?: string;
    description?: string;
    columns?: Array<{
        id: string;
        name: string;
        status: string;
    }>;
    workflow?: string[];
    permissions?: Record<string, string[]>;
}
/**
 * Union type for all metadata types
 */
export type ContentMetadata = FileMetadata | MessageMetadata | EventMetadata | SessionMetadata | AttachmentMetadata | ThoughtMetadata | DocumentMetadata | TaskMetadata | BoardMetadata;
/**
 * Unified content interface that standardizes all indexed content
 */
export interface IndexableContent {
    id: string;
    type: ContentType;
    source: ContentSource;
    content: string;
    metadata: ContentMetadata;
    timestamp: number;
    created_at?: number;
    updated_at?: number;
    attachments?: AttachmentMetadata[];
    embedding?: {
        model: string;
        dimensions?: number;
        vector_id?: string;
    };
}
/**
 * Transformation functions to convert existing formats to unified model
 */
/**
 * Transform DualStoreEntry to IndexableContent
 */
export declare function transformDualStoreEntry(entry: {
    id?: string;
    text?: string;
    content?: string;
    timestamp?: number;
    metadata?: DualStoreMetadata;
}, defaultType?: ContentType, defaultSource?: ContentSource): IndexableContent;
/**
 * Transform IndexedFile to IndexableContent
 */
export declare function transformIndexedFile(file: {
    path: string;
    content?: string;
}, additionalMetadata?: Partial<FileMetadata>): IndexableContent;
/**
 * Transform Discord message to IndexableContent
 */
export declare function transformDiscordMessage(message: {
    id?: string;
    content?: string;
    author_urn?: string;
    space_urn?: string;
    created_at?: string | number;
    attachments?: Array<{
        urn?: string;
        url?: string;
        content_type?: string;
        size?: number;
        sha256?: string;
    }>;
}, additionalMetadata?: Partial<MessageMetadata>): IndexableContent;
/**
 * Transform OpenCode session to IndexableContent
 */
export declare function transformOpenCodeSession(session: {
    id?: string;
    title?: string;
    status?: string;
    created_at?: string | number;
    updated_at?: string | number;
}, additionalMetadata?: Partial<SessionMetadata>): IndexableContent;
/**
 * Transform OpenCode message to IndexableContent
 */
export declare function transformOpenCodeMessage(message: {
    id?: string;
    session_id?: string;
    role?: string;
    content?: string;
    timestamp?: string | number;
}, additionalMetadata?: Partial<MessageMetadata>): IndexableContent;
/**
 * Transform OpenCode event to IndexableContent
 */
export declare function transformOpencodeEvent(event: {
    id?: string;
    type?: string;
    timestamp?: number;
    data?: Record<string, unknown>;
    properties?: Record<string, unknown>;
}, additionalMetadata?: Partial<EventMetadata>): IndexableContent;
/**
 * Transform Kanban task to IndexableContent
 */
export declare function transformKanbanTask(task: {
    id?: string;
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assignee?: string;
    labels?: string[];
    due_date?: string | number;
    created_at?: string | number;
    updated_at?: string | number;
}, additionalMetadata?: Partial<TaskMetadata>): IndexableContent;
/**
 * Validation functions
 */
/**
 * Validate IndexableContent structure
 */
export declare function validateIndexableContent(content: IndexableContent): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=unified-content-model.d.ts.map