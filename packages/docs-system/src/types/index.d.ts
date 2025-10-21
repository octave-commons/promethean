/**
 * Core type definitions for the Promethean Documentation System
 * Provides comprehensive type safety for the fullstack application
 */
export interface SystemConfig {
    /** Server configuration */
    server: {
        port: number;
        host: string;
        env: 'development' | 'production' | 'test';
        cors: {
            origin: string[];
            credentials: boolean;
        };
    };
    /** Database configuration */
    database: {
        url: string;
        name: string;
        options: {
            maxPoolSize: number;
            minPoolSize: number;
            maxIdleTimeMS: number;
        };
    };
    /** Ollama configuration */
    ollama: {
        endpoint: string;
        defaultModel: string;
        timeout: number;
        retryAttempts: number;
    };
    /** Authentication configuration */
    auth: {
        jwtSecret: string;
        jwtExpiration: string;
        bcryptRounds: number;
    };
    /** Logging configuration */
    logging: {
        level: 'error' | 'warn' | 'info' | 'debug';
        format: 'json' | 'simple';
        file?: string;
    };
}
export interface User {
    _id: string;
    username: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    profile: UserProfile;
    preferences: UserPreferences;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    isActive: boolean;
}
export type UserRole = 'admin' | 'user' | 'viewer';
export interface UserProfile {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    organization?: string;
}
export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    notifications: NotificationPreferences;
}
export interface NotificationPreferences {
    email: boolean;
    browser: boolean;
    jobCompletion: boolean;
    systemUpdates: boolean;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface LoginRequest {
    username: string;
    password: string;
    rememberMe?: boolean;
}
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    profile?: UserProfile;
}
export interface Document {
    _id: string;
    title: string;
    content: string;
    summary?: string;
    type: DocumentType;
    category: string;
    tags: string[];
    metadata: DocumentMetadata;
    embeddings?: number[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    version: number;
    status: DocumentStatus;
    accessLevel: AccessLevel;
}
export type DocumentType = 'markdown' | 'documentation' | 'api-reference' | 'tutorial' | 'guide' | 'policy' | 'specification' | 'code-example';
export type DocumentStatus = 'draft' | 'published' | 'archived' | 'deprecated';
export type AccessLevel = 'public' | 'internal' | 'restricted' | 'confidential';
export interface DocumentMetadata {
    wordCount: number;
    readingTime: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    prerequisites?: string[];
    relatedDocuments?: string[];
    lastReviewed?: Date;
    reviewFrequency?: number;
}
export interface Query {
    _id: string;
    text: string;
    type: QueryType;
    filters: QueryFilters;
    options: QueryOptions;
    userId: string;
    status: QueryStatus;
    result?: QueryResult;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}
export type QueryType = 'search' | 'qa' | 'summarization' | 'analysis' | 'recommendation';
export interface QueryFilters {
    documentTypes?: DocumentType[];
    categories?: string[];
    tags?: string[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    accessLevel?: AccessLevel;
    createdBy?: string;
}
export interface QueryOptions {
    maxResults?: number;
    includeMetadata?: boolean;
    includeContent?: boolean;
    sortBy?: 'relevance' | 'date' | 'title' | 'popularity';
    sortOrder?: 'asc' | 'desc';
    threshold?: number;
}
export type QueryStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export interface QueryResult {
    documents: SearchResult[];
    totalCount: number;
    searchTime: number;
    relevanceScores: number[];
    suggestions?: string[];
    relatedQueries?: string[];
}
export interface SearchResult {
    document: Document;
    score: number;
    highlights: string[];
    matchedSections: DocumentSection[];
}
export interface DocumentSection {
    title: string;
    content: string;
    level: number;
    startPosition: number;
    endPosition: number;
}
export interface OllamaJob {
    _id: string;
    type: OllamaJobType;
    input: OllamaJobInput;
    output?: OllamaJobOutput;
    status: OllamaJobStatus;
    priority: JobPriority;
    userId: string;
    model: string;
    options: OllamaJobOptions;
    progress: JobProgress;
    error?: JobError;
    createdAt: Date;
    updatedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}
export type OllamaJobType = 'generate' | 'chat' | 'embedding' | 'summarization' | 'analysis' | 'classification';
export interface OllamaJobInput {
    prompt?: string;
    messages?: ChatMessage[];
    text?: string;
    context?: Record<string, any>;
    documents?: string[];
}
export interface OllamaJobOutput {
    text?: string;
    response?: string;
    embeddings?: number[];
    analysis?: AnalysisResult;
    metadata?: Record<string, any>;
}
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}
export type OllamaJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';
export interface OllamaJobOptions {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxTokens?: number;
    stopSequences?: string[];
    systemPrompt?: string;
    timeout?: number;
}
export interface JobProgress {
    current: number;
    total: number;
    percentage: number;
    message?: string;
    estimatedTimeRemaining?: number;
}
export interface JobError {
    code: string;
    message: string;
    details?: Record<string, any>;
    stack?: string;
}
export interface AnalysisResult {
    type: AnalysisType;
    summary: string;
    insights: Insight[];
    recommendations: Recommendation[];
    confidence: number;
    metadata: AnalysisMetadata;
}
export type AnalysisType = 'sentiment' | 'topic-modeling' | 'entity-extraction' | 'summarization' | 'classification' | 'similarity';
export interface Insight {
    type: string;
    title: string;
    description: string;
    confidence: number;
    evidence: string[];
    importance: 'low' | 'medium' | 'high';
}
export interface Recommendation {
    type: string;
    title: string;
    description: string;
    action: string;
    priority: 'low' | 'medium' | 'high';
    estimatedImpact?: string;
}
export interface AnalysisMetadata {
    model: string;
    version: string;
    processingTime: number;
    inputSize: number;
    parameters: Record<string, any>;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: ResponseMeta;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
    stack?: string;
}
export interface ResponseMeta {
    pagination?: PaginationMeta;
    timing?: TimingMeta;
    version?: string;
    requestId?: string;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface TimingMeta {
    requestTime: number;
    processingTime: number;
    totalTime: number;
}
export interface WebSocketMessage {
    type: WebSocketMessageType;
    payload: any;
    timestamp: Date;
    id: string;
    userId?: string;
}
export type WebSocketMessageType = 'job_update' | 'query_progress' | 'system_notification' | 'user_activity' | 'document_update' | 'error';
export interface JobUpdateMessage {
    jobId: string;
    status: OllamaJobStatus;
    progress: JobProgress;
    result?: OllamaJobOutput;
    error?: JobError;
}
export interface QueryProgressMessage {
    queryId: string;
    status: QueryStatus;
    progress: JobProgress;
    partialResults?: SearchResult[];
}
export interface SystemNotificationMessage {
    level: 'info' | 'warning' | 'error';
    title: string;
    message: string;
    actions?: NotificationAction[];
}
export interface NotificationAction {
    label: string;
    action: string;
    url?: string;
}
export interface SystemSettings {
    general: GeneralSettings;
    search: SearchSettings;
    ai: AISettings;
    security: SecuritySettings;
    performance: PerformanceSettings;
}
export interface GeneralSettings {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    defaultLanguage: string;
    timezone: string;
}
export interface SearchSettings {
    defaultResultsPerPage: number;
    maxResultsPerPage: number;
    enableFuzzySearch: boolean;
    enableSemanticSearch: boolean;
    searchTimeout: number;
}
export interface AISettings {
    defaultModel: string;
    maxTokens: number;
    temperature: number;
    enableStreaming: boolean;
    cacheResults: boolean;
    cacheExpiration: number;
}
export interface SecuritySettings {
    enableRateLimit: boolean;
    rateLimitWindow: number;
    rateLimitMax: number;
    enableAuditLog: boolean;
    sessionTimeout: number;
}
export interface PerformanceSettings {
    enableCaching: boolean;
    cacheExpiration: number;
    enableCompression: boolean;
    maxUploadSize: number;
    concurrentJobs: number;
}
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface DateRange {
    start: Date;
    end: Date;
}
export interface FileUpload {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
}
export declare class DocsSystemError extends Error {
    code: string;
    statusCode: number;
    details?: Record<string, any> | undefined;
    constructor(message: string, code: string, statusCode?: number, details?: Record<string, any> | undefined);
}
export declare class ValidationError extends DocsSystemError {
    constructor(message: string, details?: Record<string, any>);
}
export declare class AuthenticationError extends DocsSystemError {
    constructor(message?: string);
}
export declare class AuthorizationError extends DocsSystemError {
    constructor(message?: string);
}
export declare class NotFoundError extends DocsSystemError {
    constructor(resource: string);
}
export declare class ConflictError extends DocsSystemError {
    constructor(message: string);
}
export declare class RateLimitError extends DocsSystemError {
    constructor(message?: string);
}
export declare class OllamaError extends DocsSystemError {
    constructor(message: string, details?: Record<string, any>);
}
//# sourceMappingURL=index.d.ts.map