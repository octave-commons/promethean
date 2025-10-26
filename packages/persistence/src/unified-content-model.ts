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
export type ContentType = 'file' | 'message' | 'event' | 'session' | 'attachment' | 'thought' | 'document';

/**
 * Source systems that produce content
 */
export type ContentSource = 'filesystem' | 'discord' | 'opencode' | 'agent' | 'user' | 'system' | 'external';

/**
 * Standardized metadata fields for all content types
 */
export interface BaseContentMetadata {
    // Core identification
    id?: string;
    type?: ContentType;
    source?: ContentSource;

    // Timestamps
    timestamp?: number;
    created_at?: number;
    updated_at?: number;

    // Authorship and ownership
    user_id?: string;
    user_name?: string;
    author_urn?: string;
    session_id?: string;
    space_urn?: string;

    // Content classification
    tags?: string[];
    category?: string;
    language?: string;

    // Technical metadata
    content_type?: string;
    encoding?: string;
    size?: number;
    checksum?: string;

    // Processing metadata
    indexed_at?: number;
    vector_write_success?: boolean;
    vector_write_error?: string;
    vector_write_timestamp?: number | null;

    // Legacy compatibility
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

    // File system specific
    path: string;
    extension?: string;
    directory?: string;

    // Content analysis
    line_count?: number;
    word_count?: number;
    language_detected?: string;

    // Indexing metadata
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

    // Message specific
    message_id?: string;
    foreign_id?: string;
    thread_id?: string;
    channel_id?: string;

    // Message content
    reply_to?: string;
    mentions?: string[];
    reactions?: Array<{
        emoji: string;
        count: number;
        users?: string[];
    }>;

    // Discord specific
    provider?: string;
    tenant?: string;
}

/**
 * Event-specific metadata
 */
export interface EventMetadata extends BaseContentMetadata {
    type: 'event';
    source: 'opencode' | 'agent' | 'system';

    // Event specific
    event_id?: string;
    event_type?: string;
    agent_id?: string;

    // Event data
    data?: Record<string, unknown>;
    properties?: Record<string, unknown>;

    // Event processing
    processed?: boolean;
    error?: string;
}

/**
 * Session-specific metadata
 */
export interface SessionMetadata extends BaseContentMetadata {
    type: 'session';
    source: 'opencode' | 'agent';

    // Session specific
    session_id: string;
    title?: string;
    description?: string;

    // Session lifecycle
    started_at?: number;
    ended_at?: number;
    duration?: number;

    // Session context
    context?: Record<string, unknown>;
    variables?: Record<string, unknown>;
}

/**
 * Attachment-specific metadata
 */
export interface AttachmentMetadata extends BaseContentMetadata {
    type: 'attachment';
    source: 'discord' | 'filesystem' | 'user';

    // Attachment specific
    attachment_urn?: string;
    message_id?: string;
    url?: string;

    // File information
    filename?: string;
    content_type?: string;
    size?: number;
    sha256?: string;

    // Attachment processing
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

    // Thought specific
    thought_id?: string;
    reasoning_type?: 'analysis' | 'planning' | 'reflection' | 'decision';
    confidence?: number;

    // Thought context
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

    // Document specific
    document_id?: string;
    title?: string;
    authors?: string[];
    summary?: string;

    // Document structure
    sections?: Array<{
        title: string;
        content: string;
        level: number;
    }>;

    // Document analysis
    topics?: string[];
    entities?: Array<{
        name: string;
        type: string;
        confidence: number;
    }>;
}

/**
 * Union type for all metadata types
 */
export type ContentMetadata =
    | FileMetadata
    | MessageMetadata
    | EventMetadata
    | SessionMetadata
    | AttachmentMetadata
    | ThoughtMetadata
    | DocumentMetadata;

/**
 * Unified content interface that standardizes all indexed content
 */
export interface IndexableContent {
    // Core identification
    id: string;
    type: ContentType;
    source: ContentSource;

    // Content data
    content: string;

    // Metadata (typed based on content type)
    metadata: ContentMetadata;

    // Timestamps
    timestamp: number;
    created_at?: number;
    updated_at?: number;

    // Optional attachments for content that includes them
    attachments?: AttachmentMetadata[];

    // Vector embedding information
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
export function transformDualStoreEntry(
    entry: {
        id?: string;
        text?: string;
        content?: string;
        timestamp?: number;
        metadata?: DualStoreMetadata;
    },
    defaultType: ContentType = 'document',
    defaultSource: ContentSource = 'system',
): IndexableContent {
    const metadata = entry.metadata || {};

    // Determine content type from metadata
    let type: ContentType = defaultType;
    let source: ContentSource = defaultSource;

    if (metadata.type === 'image') {
        type = 'attachment';
        source = 'discord';
    } else if (metadata.userName) {
        type = metadata.isThought ? 'thought' : 'message';
        source = 'discord';
    } else if (metadata.type === 'file') {
        type = 'file';
        source = 'filesystem';
    }

    return {
        id: entry.id || generateId(),
        type,
        source,
        content: entry.text || entry.content || '',
        timestamp: entry.timestamp || Date.now(),
        metadata: {
            ...metadata,
            type,
            source,
            vector_write_success: metadata.vectorWriteSuccess,
            vector_write_error: metadata.vectorWriteError,
            vector_write_timestamp: metadata.vectorWriteTimestamp,
        } as ContentMetadata,
    };
}

/**
 * Transform IndexedFile to IndexableContent
 */
export function transformIndexedFile(
    file: {
        path: string;
        content?: string;
    },
    additionalMetadata: Partial<FileMetadata> = {},
): IndexableContent {
    const path = file.path;
    const extension = path.split('.').pop();

    const metadata: FileMetadata = {
        type: 'file',
        source: 'filesystem',
        path,
        extension,
        directory: path.split('/').slice(0, -1).join('/'),
        size: file.content?.length,
        timestamp: Date.now(),
        ...additionalMetadata,
    };

    return {
        id: generateId(),
        type: 'file',
        source: 'filesystem',
        content: file.content || '',
        timestamp: Date.now(),
        metadata,
    };
}

/**
 * Transform Discord message to IndexableContent
 */
export function transformDiscordMessage(
    message: {
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
    },
    additionalMetadata: Partial<MessageMetadata> = {},
): IndexableContent {
    const timestamp =
        typeof message.created_at === 'string'
            ? new Date(message.created_at).getTime()
            : message.created_at || Date.now();

    const metadata: MessageMetadata = {
        type: 'message',
        source: 'discord',
        message_id: message.id,
        author_urn: message.author_urn,
        space_urn: message.space_urn,
        timestamp,
        created_at: timestamp,
        ...additionalMetadata,
    };

    const attachments = message.attachments?.map((att) => ({
        id: generateId(),
        type: 'attachment' as const,
        source: 'discord' as const,
        content: '', // Attachments have separate content
        timestamp,
        metadata: {
            type: 'attachment' as const,
            source: 'discord' as const,
            attachment_urn: att.urn,
            message_id: message.id,
            url: att.url,
            content_type: att.content_type,
            size: att.size,
            sha256: att.sha256,
            timestamp,
        } as AttachmentMetadata,
    }));

    return {
        id: message.id || generateId(),
        type: 'message',
        source: 'discord',
        content: message.content || '',
        timestamp,
        metadata,
        attachments,
    };
}

/**
 * Transform OpenCode event to IndexableContent
 */
export function transformOpencodeEvent(
    event: {
        id?: string;
        type?: string;
        timestamp?: number;
        data?: Record<string, unknown>;
        properties?: Record<string, unknown>;
    },
    additionalMetadata: Partial<EventMetadata> = {},
): IndexableContent {
    const metadata: EventMetadata = {
        type: 'event',
        source: 'opencode',
        event_id: event.id,
        event_type: event.type,
        data: event.data,
        properties: event.properties,
        timestamp: event.timestamp || Date.now(),
        created_at: event.timestamp || Date.now(),
        ...additionalMetadata,
    };

    return {
        id: event.id || generateId(),
        type: 'event',
        source: 'opencode',
        content: JSON.stringify(event.data || event.properties || {}),
        timestamp: event.timestamp || Date.now(),
        metadata,
    };
}

/**
 * Validation functions
 */

/**
 * Validate IndexableContent structure
 */
export function validateIndexableContent(content: IndexableContent): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Required fields
    if (!content.id || typeof content.id !== 'string') {
        errors.push('Content must have a valid string id');
    }

    if (!content.type || !isValidContentType(content.type)) {
        errors.push('Content must have a valid type');
    }

    if (!content.source || !isValidContentSource(content.source)) {
        errors.push('Content must have a valid source');
    }

    if (typeof content.content !== 'string') {
        errors.push('Content must have string content');
    }

    if (typeof content.timestamp !== 'number' || content.timestamp <= 0) {
        errors.push('Content must have a valid timestamp');
    }

    // Type-specific validation
    if (content.type === 'file') {
        const fileMeta = content.metadata as FileMetadata;
        if (!fileMeta.path) {
            errors.push('File content must have a path');
        }
    }

    if (content.type === 'message') {
        const messageMeta = content.metadata as MessageMetadata;
        if (!messageMeta.message_id) {
            errors.push('Message content must have a message_id');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Helper functions
 */

/**
 * Generate a unique ID
 */
function generateId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Check if value is a valid ContentType
 */
function isValidContentType(type: string): type is ContentType {
    const validTypes: ContentType[] = ['file', 'message', 'event', 'session', 'attachment', 'thought', 'document'];
    return validTypes.includes(type as ContentType);
}

/**
 * Check if value is a valid ContentSource
 */
function isValidContentSource(source: string): source is ContentSource {
    const validSources: ContentSource[] = ['filesystem', 'discord', 'opencode', 'agent', 'user', 'system', 'external'];
    return validSources.includes(source as ContentSource);
}

// All types and functions are already exported above
