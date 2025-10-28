/**
 * Unified Content Model for Indexing Architecture
 *
 * This file defines the unified content model that standardizes data structures
 * across all indexing systems (files, messages, events, attachments).
 */
/**
 * Transformation functions to convert existing formats to unified model
 */
/**
 * Transform DualStoreEntry to IndexableContent
 */
export function transformDualStoreEntry(entry, defaultType = 'document', defaultSource = 'system') {
    const metadata = entry.metadata || {};
    // Determine content type from metadata
    let type = defaultType;
    let source = defaultSource;
    if (metadata.type === 'image') {
        type = 'attachment';
        source = 'discord';
    }
    else if (metadata.userName) {
        type = metadata.isThought ? 'thought' : 'message';
        source = 'discord';
    }
    else if (metadata.type === 'file') {
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
        },
    };
}
/**
 * Transform IndexedFile to IndexableContent
 */
export function transformIndexedFile(file, additionalMetadata = {}) {
    const path = file.path;
    const extension = path.split('.').pop();
    const metadata = {
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
export function transformDiscordMessage(message, additionalMetadata = {}) {
    const timestamp = typeof message.created_at === 'string'
        ? new Date(message.created_at).getTime()
        : message.created_at || Date.now();
    const metadata = {
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
        type: 'attachment',
        source: 'discord',
        content: '', // Attachments have separate content
        timestamp,
        metadata: {
            type: 'attachment',
            source: 'discord',
            attachment_urn: att.urn,
            message_id: message.id,
            url: att.url,
            content_type: att.content_type,
            size: att.size,
            sha256: att.sha256,
            timestamp,
        },
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
 * Transform OpenCode session to IndexableContent
 */
export function transformOpenCodeSession(session, additionalMetadata = {}) {
    const timestamp = typeof session.created_at === 'string'
        ? new Date(session.created_at).getTime()
        : session.created_at || Date.now();
    const metadata = {
        type: 'session',
        source: 'opencode',
        session_id: session.id || generateId(),
        title: session.title,
        status: session.status,
        created_at: timestamp,
        updated_at: typeof session.updated_at === 'string'
            ? new Date(session.updated_at).getTime()
            : session.updated_at || timestamp,
        ...additionalMetadata,
    };
    return {
        id: session.id || generateId(),
        type: 'session',
        source: 'opencode',
        content: session.title || `Session ${session.id}`,
        timestamp,
        metadata,
    };
}
/**
 * Transform OpenCode message to IndexableContent
 */
export function transformOpenCodeMessage(message, additionalMetadata = {}) {
    const timestamp = typeof message.timestamp === 'string' ? new Date(message.timestamp).getTime() : message.timestamp || Date.now();
    const metadata = {
        type: 'message',
        source: 'opencode',
        message_id: message.id,
        session_id: message.session_id,
        role: message.role,
        created_at: timestamp,
        ...additionalMetadata,
    };
    return {
        id: message.id || generateId(),
        type: 'message',
        source: 'opencode',
        content: message.content || '',
        timestamp,
        metadata,
    };
}
/**
 * Transform OpenCode event to IndexableContent
 */
export function transformOpencodeEvent(event, additionalMetadata = {}) {
    const metadata = {
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
 * Transform Kanban task to IndexableContent
 */
export function transformKanbanTask(task, additionalMetadata = {}) {
    const timestamp = typeof task.created_at === 'string' ? new Date(task.created_at).getTime() : task.created_at || Date.now();
    const metadata = {
        type: 'task',
        source: 'kanban',
        task_id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        labels: task.labels,
        due_date: typeof task.due_date === 'string' ? new Date(task.due_date).getTime() : task.due_date,
        created_at: timestamp,
        updated_at: typeof task.updated_at === 'string' ? new Date(task.updated_at).getTime() : task.updated_at || timestamp,
        ...additionalMetadata,
    };
    return {
        id: task.id || generateId(),
        type: 'task',
        source: 'kanban',
        content: task.description || task.title || `Task ${task.id}`,
        timestamp,
        metadata,
    };
}
/**
 * Validation functions
 */
/**
 * Validate IndexableContent structure
 */
export function validateIndexableContent(content) {
    const errors = [];
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
        const fileMeta = content.metadata;
        if (!fileMeta.path) {
            errors.push('File content must have a path');
        }
    }
    if (content.type === 'message') {
        const messageMeta = content.metadata;
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
function generateId() {
    return `content_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
/**
 * Check if value is a valid ContentType
 */
function isValidContentType(type) {
    const validTypes = ['file', 'message', 'event', 'session', 'attachment', 'thought', 'document'];
    return validTypes.includes(type);
}
/**
 * Check if value is a valid ContentSource
 */
function isValidContentSource(source) {
    const validSources = ['filesystem', 'discord', 'opencode', 'agent', 'user', 'system', 'external'];
    return validSources.includes(source);
}
// All types and functions are already exported above
//# sourceMappingURL=unified-content-model.js.map