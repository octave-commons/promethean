# Streaming Implementation Guide

This guide covers implementing streaming data flows using the Omni protocol, including real-time data streaming, chunked responses, and backpressure handling.

## Overview

Streaming in the Omni protocol enables efficient handling of large data sets, real-time updates, and continuous data flows without requiring the entire payload to be loaded into memory.

## Streaming Message Types

### 1. Stream Initiation

```typescript
interface StreamInitMessage extends OmniMessage {
  type: "stream-init";
  payload: {
    streamId: string;
    contentType: string;
    totalSize?: number;
    chunkSize?: number;
    metadata?: Record<string, unknown>;
  };
}
```

### 2. Stream Chunks

```typescript
interface StreamChunkMessage extends OmniMessage {
  type: "stream-chunk";
  payload: {
    streamId: string;
    sequence: number;
    data: string | ArrayBuffer;
    isFinal: boolean;
    checksum?: string;
  };
}
```

### 3. Stream Control

```typescript
interface StreamControlMessage extends OmniMessage {
  type: "stream-control";
  payload: {
    streamId: string;
    command: "pause" | "resume" | "cancel" | "ack";
    sequence?: number;
    reason?: string;
  };
}
```

### 4. Stream Status

```typescript
interface StreamStatusMessage extends OmniMessage {
  type: "stream-status";
  payload: {
    streamId: string;
    status: "active" | "paused" | "completed" | "error" | "cancelled";
    progress?: {
      bytesTransferred: number;
      totalBytes?: number;
      percentage?: number;
    };
    error?: {
      code: string;
      message: string;
    };
  };
}
```

## Streaming Server Implementation

### 1. Basic Streaming Server

```typescript
import {
  OmniMessage,
  StreamInitMessage,
  StreamChunkMessage,
  StreamControlMessage,
  StreamStatusMessage,
  validateOmniMessage,
  createRequestId
} from "@promethean/omni-protocol";

export class StreamingServer {
  private streams = new Map<string, StreamContext>();
  private clients = new Map<string, ClientConnection>();

  async handleClientConnection(clientId: string, connection: ClientConnection): Promise<void> {
    this.clients.set(clientId, connection);

    connection.onMessage(async (rawMessage) => {
      try {
        const validated = validateOmniMessage(rawMessage);
        if (!validated.success) {
          await this.sendError(clientId, "INVALID_MESSAGE", validated.error.message);
          return;
        }

        await this.handleMessage(clientId, validated.data);
      } catch (error) {
        console.error(`Error handling message from ${clientId}:`, error);
        await this.sendError(clientId, "INTERNAL_ERROR", error.message);
      }
    });

    connection.onClose(() => {
      this.handleClientDisconnection(clientId);
    });
  }

  private async handleMessage(clientId: string, message: OmniMessage): Promise<void> {
    switch (message.type) {
      case "request":
        await this.handleStreamRequest(clientId, message as any);
        break;
      case "stream-control":
        await this.handleStreamControl(clientId, message as StreamControlMessage);
        break;
      default:
        await this.sendError(clientId, "UNKNOWN_MESSAGE_TYPE", `Unsupported message type: ${message.type}`);
    }
  }

  private async handleStreamRequest(clientId: string, request: any): Promise<void> {
    const { action, params } = request.payload;

    try {
      switch (action) {
        case "startDataStream":
          await this.startDataStream(clientId, request.correlationId, params);
          break;
        case "startFileUpload":
          await this.startFileUpload(clientId, request.correlationId, params);
          break;
        case "startFileDownload":
          await this.startFileDownload(clientId, request.correlationId, params);
          break;
        default:
          await this.sendError(clientId, "UNKNOWN_ACTION", `Unknown action: ${action}`);
      }
    } catch (error) {
      await this.sendErrorResponse(clientId, request.correlationId, "INTERNAL_ERROR", error.message);
    }
  }

  private async startDataStream(clientId: string, correlationId: string, params: any): Promise<void> {
    const streamId = this.generateStreamId();
    const streamContext: StreamContext = {
      streamId,
      clientId,
      correlationId,
      type: "data-stream",
      status: "active",
      startTime: Date.now(),
      bytesTransferred: 0,
      totalBytes: params.totalSize || 0
    };

    this.streams.set(streamId, streamContext);

    // Send stream initiation message
    const initMessage: StreamInitMessage = {
      id: createRequestId(),
      type: "stream-init",
      payload: {
        streamId,
        contentType: params.contentType || "application/octet-stream",
        totalSize: params.totalSize,
        chunkSize: params.chunkSize || 8192,
        metadata: params.metadata
      },
      timestamp: new Date().toISOString(),
      source: "streaming-server"
    };

    await this.sendToClient(clientId, initMessage);

    // Start streaming data
    this.startDataGeneration(streamId, params);
  }

  private async startDataGeneration(streamId: string, params: any): Promise<void> {
    const stream = this.streams.get(streamId);
    if (!stream || stream.status !== "active") return;

    try {
      const dataGenerator = this.createDataGenerator(params);

      for await (const chunk of dataGenerator) {
        if (stream.status !== "active") break;

        await this.sendStreamChunk(streamId, chunk);
        stream.bytesTransferred += chunk.length;

        // Send progress update
        if (stream.totalBytes > 0) {
          await this.sendStreamStatus(streamId, {
            status: "active",
            progress: {
              bytesTransferred: stream.bytesTransferred,
              totalBytes: stream.totalBytes,
              percentage: (stream.bytesTransferred / stream.totalBytes) * 100
            }
          });
        }

        // Implement backpressure by waiting for ACK
        await this.waitForAck(streamId);
      }

      // Send final chunk
      await this.sendFinalChunk(streamId);
      stream.status = "completed";
      await this.sendStreamStatus(streamId, { status: "completed" });

    } catch (error) {
      stream.status = "error";
      await this.sendStreamStatus(streamId, {
        status: "error",
        error: {
          code: "STREAM_ERROR",
          message: error.message
        }
      });
    } finally {
      // Clean up stream
      setTimeout(() => {
        this.streams.delete(streamId);
      }, 5000); // Keep for 5 seconds for any late messages
    }
  }

  private async sendStreamChunk(streamId: string, data: string | ArrayBuffer): Promise<void> {
    const stream = this.streams.get(streamId);
    if (!stream) return;

    const chunkMessage: StreamChunkMessage = {
      id: createRequestId(),
      type: "stream-chunk",
      payload: {
        streamId,
        sequence: stream.sequence++,
        data,
        isFinal: false,
        checksum: this.calculateChecksum(data)
      },
      timestamp: new Date().toISOString(),
      source: "streaming-server"
    };

    await this.sendToClient(stream.clientId, chunkMessage);
  }

  private async sendFinalChunk(streamId: string): Promise<void> {
    const stream = this.streams.get(streamId);
    if (!stream) return;

    const finalChunk: StreamChunkMessage = {
      id: createRequestId(),
      type: "stream-chunk",
      payload: {
        streamId,
        sequence: stream.sequence++,
        data: "",
        isFinal: true
      },
      timestamp: new Date().toISOString(),
      source: "streaming-server"
    };

    await this.sendToClient(stream.clientId, finalChunk);
  }

  private async sendStreamStatus(streamId: string, status: any): Promise<void> {
    const stream = this.streams.get(streamId);
    if (!stream) return;

    const statusMessage: StreamStatusMessage = {
      id: createRequestId(),
      type: "stream-status",
      payload: {
        streamId,
        ...status
      },
      timestamp: new Date().toISOString(),
      source: "streaming-server"
    };

    await this.sendToClient(stream.clientId, statusMessage);
  }

  private async handleStreamControl(clientId: string, control: StreamControlMessage): Promise<void> {
    const { streamId, command } = control.payload;
    const stream = this.streams.get(streamId);

    if (!stream || stream.clientId !== clientId) {
      await this.sendError(clientId, "INVALID_STREAM", "Stream not found or access denied");
      return;
    }

    switch (command) {
      case "pause":
        stream.status = "paused";
        await this.sendStreamStatus(streamId, { status: "paused" });
        break;
      case "resume":
        stream.status = "active";
        await this.sendStreamStatus(streamId, { status: "active" });
        break;
      case "cancel":
        stream.status = "cancelled";
        await this.sendStreamStatus(streamId, { status: "cancelled" });
        break;
      case "ack":
        // Acknowledge receipt of chunk
        stream.lastAckedSequence = control.sequence;
        break;
    }
  }

  private async sendToClient(clientId: string, message: OmniMessage): Promise<void> {
    const client = this.clients.get(clientId);
    if (client) {
      await client.send(message);
    }
  }

  private generateStreamId(): string {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createDataGenerator(params: any): AsyncGenerator<string | ArrayBuffer> {
    // Create appropriate data generator based on params
    if (params.type === "random-data") {
      return this.generateRandomData(params);
    } else if (params.type === "file-content") {
      return this.generateFileContent(params);
    } else {
      return this.generateDefaultData(params);
    }
  }

  private async* generateRandomData(params: any): AsyncGenerator<string> {
    const chunkSize = params.chunkSize || 1024;
    const totalSize = params.totalSize || chunkSize * 10;

    for (let offset = 0; offset < totalSize; offset += chunkSize) {
      const size = Math.min(chunkSize, totalSize - offset);
      const data = Array.from({ length: size }, () =>
        Math.random().toString(36).charAt(2)
      ).join('');

      yield data;
    }
  }

  private async* generateFileContent(params: any): AsyncGenerator<ArrayBuffer> {
    const filePath = params.filePath;
    const chunkSize = params.chunkSize || 8192;

    // Implementation would read file in chunks
    // This is a placeholder
    const fileContent = new ArrayBuffer(1024);
    yield fileContent;
  }

  private async* generateDefaultData(params: any): AsyncGenerator<string> {
    const messages = [
      "Hello, this is streaming data",
      "This is the second chunk",
      "And this is the third chunk",
      "Streaming is working well",
      "Almost done with the stream",
      "This is the final chunk"
    ];

    for (const message of messages) {
      yield message;
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
    }
  }

  private calculateChecksum(data: string | ArrayBuffer): string {
    // Simple checksum implementation
    if (typeof data === "string") {
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += data.charCodeAt(i);
      }
      return sum.toString(16);
    } else {
      // ArrayBuffer checksum
      const view = new Uint8Array(data);
      let sum = 0;
      for (let i = 0; i < view.length; i++) {
        sum += view[i];
      }
      return sum.toString(16);
    }
  }

  private async waitForAck(streamId: string): Promise<void> {
    // Implement backpressure mechanism
    const stream = this.streams.get(streamId);
    if (!stream) return;

    const maxUnackedChunks = 10;
    const unackedChunks = stream.sequence - (stream.lastAckedSequence || 0);

    if (unackedChunks >= maxUnackedChunks) {
      // Wait for ACK before sending more
      await new Promise(resolve => {
        const checkAck = () => {
          const currentStream = this.streams.get(streamId);
          if (!currentStream ||
              currentStream.sequence - (currentStream.lastAckedSequence || 0) < maxUnackedChunks) {
            resolve();
          } else {
            setTimeout(checkAck, 100);
          }
        };
        checkAck();
      });
    }
  }

  private handleClientDisconnection(clientId: string): void {
    // Cancel all streams for this client
    for (const [streamId, stream] of this.streams) {
      if (stream.clientId === clientId && stream.status === "active") {
        stream.status = "cancelled";
        this.sendStreamStatus(streamId, { status: "cancelled" });
      }
    }

    this.clients.delete(clientId);
  }

  private async sendError(clientId: string, code: string, message: string): Promise<void> {
    const errorMessage = {
      id: createRequestId(),
      type: "response",
      payload: {
        success: false,
        error: { code, message }
      },
      timestamp: new Date().toISOString(),
      source: "streaming-server",
      correlationId: ""
    };

    await this.sendToClient(clientId, errorMessage);
  }

  private async sendErrorResponse(
    clientId: string,
    correlationId: string,
    code: string,
    message: string
  ): Promise<void> {
    const errorMessage = {
      id: createRequestId(),
      type: "response",
      payload: {
        success: false,
        error: { code, message }
      },
      timestamp: new Date().toISOString(),
      source: "streaming-server",
      correlationId
    };

    await this.sendToClient(clientId, errorMessage);
  }
}

// Supporting interfaces
interface StreamContext {
  streamId: string;
  clientId: string;
  correlationId: string;
  type: string;
  status: "active" | "paused" | "completed" | "error" | "cancelled";
  startTime: number;
  sequence: number;
  bytesTransferred: number;
  totalBytes: number;
  lastAckedSequence?: number;
}

interface ClientConnection {
  onMessage(handler: (message: any) => Promise<void>): void;
  onClose(handler: () => void): void;
  send(message: OmniMessage): Promise<void>;
}
```

## Streaming Client Implementation

### 1. WebSocket Streaming Client

```typescript
import {
  OmniMessage,
  StreamInitMessage,
  StreamChunkMessage,
  StreamControlMessage,
  StreamStatusMessage,
  validateOmniMessage
} from "@promethean/omni-protocol";

export class StreamingClient {
  private websocket: WebSocket;
  private streams = new Map<string, StreamHandler>();
  private pendingRequests = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>();

  constructor(url: string) {
    this.websocket = new WebSocket(url);
    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.websocket.onopen = () => {
      console.log("WebSocket connected");
    };

    this.websocket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data.toString());
        await this.handleMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.websocket.onclose = () => {
      console.log("WebSocket disconnected");
      this.handleDisconnection();
    };

    this.websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  private async handleMessage(message: any): Promise<void> {
    const validated = validateOmniMessage(message);
    if (!validated.success) {
      console.error("Invalid message received:", validated.error);
      return;
    }

    const omniMessage = validated.data;

    switch (omniMessage.type) {
      case "response":
        this.handleResponse(omniMessage as any);
        break;
      case "stream-init":
        this.handleStreamInit(omniMessage as StreamInitMessage);
        break;
      case "stream-chunk":
        this.handleStreamChunk(omniMessage as StreamChunkMessage);
        break;
      case "stream-status":
        this.handleStreamStatus(omniMessage as StreamStatusMessage);
        break;
      default:
        console.log("Unhandled message type:", omniMessage.type);
    }
  }

  async startDataStream(options: {
    contentType?: string;
    totalSize?: number;
    chunkSize?: number;
    metadata?: Record<string, unknown>;
  }): Promise<string> {
    const requestId = this.generateRequestId();
    const promise = new Promise<any>((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject });
    });

    const request = {
      id: requestId,
      type: "request",
      payload: {
        action: "startDataStream",
        params: options
      },
      timestamp: new Date().toISOString(),
      source: "streaming-client"
    };

    this.websocket.send(JSON.stringify(request));

    // Wait for response with stream ID
    const response = await promise;
    return response.streamId;
  }

  private handleStreamInit(initMessage: StreamInitMessage): void {
    const { streamId, contentType, totalSize, chunkSize, metadata } = initMessage.payload;

    const streamHandler = new StreamHandler(streamId, {
      contentType,
      totalSize,
      chunkSize,
      metadata
    });

    this.streams.set(streamId, streamHandler);

    // Notify listeners about new stream
    this.onStreamInit?.(streamId, streamHandler);
  }

  private handleStreamChunk(chunkMessage: StreamChunkMessage): void {
    const { streamId, sequence, data, isFinal, checksum } = chunkMessage.payload;
    const stream = this.streams.get(streamId);

    if (!stream) {
      console.warn(`Received chunk for unknown stream: ${streamId}`);
      return;
    }

    // Validate checksum
    if (checksum && checksum !== this.calculateChecksum(data)) {
      console.error(`Checksum mismatch for chunk ${sequence} in stream ${streamId}`);
      return;
    }

    // Add chunk to buffer
    stream.addChunk(sequence, data, isFinal);

    // Send ACK
    this.sendControlMessage(streamId, "ack", sequence);

    // Notify listeners
    this.onChunk?.(streamId, sequence, data, isFinal);

    if (isFinal) {
      stream.complete();
      this.onStreamComplete?.(streamId, stream.getCompleteData());
    }
  }

  private handleStreamStatus(statusMessage: StreamStatusMessage): void {
    const { streamId, status, progress, error } = statusMessage.payload;
    const stream = this.streams.get(streamId);

    if (!stream) {
      console.warn(`Received status for unknown stream: ${streamId}`);
      return;
    }

    stream.updateStatus(status, progress, error);
    this.onStreamStatus?.(streamId, status, progress, error);
  }

  private handleResponse(response: any): void {
    const pending = this.pendingRequests.get(response.correlationId);
    if (pending) {
      if (response.payload.success) {
        pending.resolve(response.payload.data);
      } else {
        pending.reject(new Error(response.payload.error.message));
      }
      this.pendingRequests.delete(response.correlationId);
    }
  }

  pauseStream(streamId: string): void {
    this.sendControlMessage(streamId, "pause");
  }

  resumeStream(streamId: string): void {
    this.sendControlMessage(streamId, "resume");
  }

  cancelStream(streamId: string): void {
    this.sendControlMessage(streamId, "cancel");
    this.streams.delete(streamId);
  }

  private sendControlMessage(streamId: string, command: string, sequence?: number): void {
    const controlMessage: StreamControlMessage = {
      id: this.generateRequestId(),
      type: "stream-control",
      payload: {
        streamId,
        command,
        sequence
      },
      timestamp: new Date().toISOString(),
      source: "streaming-client"
    };

    this.websocket.send(JSON.stringify(controlMessage));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateChecksum(data: string | ArrayBuffer): string {
    // Implement same checksum logic as server
    if (typeof data === "string") {
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += data.charCodeAt(i);
      }
      return sum.toString(16);
    } else {
      const view = new Uint8Array(data);
      let sum = 0;
      for (let i = 0; i < view.length; i++) {
        sum += view[i];
      }
      return sum.toString(16);
    }
  }

  private handleDisconnection(): void {
    // Cancel all active streams
    for (const [streamId, stream] of this.streams) {
      stream.updateStatus("error", undefined, {
        code: "CONNECTION_LOST",
        message: "WebSocket connection lost"
      });
    }

    // Reject all pending requests
    for (const [requestId, pending] of this.pendingRequests) {
      pending.reject(new Error("Connection lost"));
    }
    this.pendingRequests.clear();
  }

  // Event handlers
  onStreamInit?: (streamId: string, handler: StreamHandler) => void;
  onChunk?: (streamId: string, sequence: number, data: string | ArrayBuffer, isFinal: boolean) => void;
  onStreamStatus?: (streamId: string, status: string, progress?: any, error?: any) => void;
  onStreamComplete?: (streamId: string, data: string | ArrayBuffer) => void;
}

export class StreamHandler {
  private chunks = new Map<number, { data: string | ArrayBuffer; isFinal: boolean }>();
  private receivedChunks: number[] = [];
  private status: string = "active";
  private progress?: any;
  private error?: any;

  constructor(
    public readonly streamId: string,
    public readonly options: {
      contentType: string;
      totalSize?: number;
      chunkSize?: number;
      metadata?: Record<string, unknown>;
    }
  ) {}

  addChunk(sequence: number, data: string | ArrayBuffer, isFinal: boolean): void {
    this.chunks.set(sequence, { data, isFinal });
    this.receivedChunks.push(sequence);
    this.receivedChunks.sort((a, b) => a - b);
  }

  updateStatus(status: string, progress?: any, error?: any): void {
    this.status = status;
    this.progress = progress;
    this.error = error;
  }

  isComplete(): boolean {
    return this.status === "completed" || this.status === "error" || this.status === "cancelled";
  }

  getCompleteData(): string | ArrayBuffer {
    if (this.options.contentType?.startsWith("text/")) {
      return this.receivedChunks
        .map(seq => this.chunks.get(seq)!)
        .map(chunk => chunk.data as string)
        .join("");
    } else {
      // Combine binary data
      const totalSize = Array.from(this.chunks.values())
        .reduce((sum, chunk) => sum + (chunk.data as ArrayBuffer).byteLength, 0);

      const result = new ArrayBuffer(totalSize);
      const view = new Uint8Array(result);
      let offset = 0;

      for (const sequence of this.receivedChunks) {
        const chunk = this.chunks.get(sequence)!;
        const chunkData = new Uint8Array(chunk.data as ArrayBuffer);
        view.set(chunkData, offset);
        offset += chunkData.length;
      }

      return result;
    }
  }

  complete(): void {
    this.status = "completed";
  }
}
```

## Advanced Streaming Features

### 1. Resumable Streams

```typescript
interface ResumableStreamContext extends StreamContext {
  checkpointInterval: number;
  lastCheckpoint: number;
  resumePosition: number;
}

class ResumableStreamingServer extends StreamingServer {
  private checkpoints = new Map<string, StreamCheckpoint>();

  async startResumableStream(clientId: string, correlationId: string, params: any): Promise<void> {
    const streamId = params.resumeFromStreamId || this.generateStreamId();
    const resumePosition = params.resumePosition || 0;

    const streamContext: ResumableStreamContext = {
      streamId,
      clientId,
      correlationId,
      type: "resumable-stream",
      status: "active",
      startTime: Date.now(),
      sequence: Math.floor(resumePosition / (params.chunkSize || 8192)),
      bytesTransferred: resumePosition,
      totalBytes: params.totalSize || 0,
      checkpointInterval: params.checkpointInterval || 10000,
      lastCheckpoint: Date.now(),
      resumePosition
    };

    this.streams.set(streamId, streamContext);

    // Load last checkpoint if resuming
    if (params.resumeFromStreamId) {
      const checkpoint = this.checkpoints.get(params.resumeFromStreamId);
      if (checkpoint) {
        streamContext.sequence = checkpoint.lastSequence;
        streamContext.bytesTransferred = checkpoint.bytesTransferred;
      }
    }

    // Send stream initiation with resume info
    const initMessage: StreamInitMessage = {
      id: createRequestId(),
      type: "stream-init",
      payload: {
        streamId,
        contentType: params.contentType || "application/octet-stream",
        totalSize: params.totalSize,
        chunkSize: params.chunkSize || 8192,
        metadata: {
          ...params.metadata,
          resumable: true,
          resumePosition
        }
      },
      timestamp: new Date().toISOString(),
      source: "streaming-server"
    };

    await this.sendToClient(clientId, initMessage);
    this.startResumableDataGeneration(streamId, params);
  }

  private async startResumableDataGeneration(streamId: string, params: any): Promise<void> {
    const stream = this.streams.get(streamId) as ResumableStreamContext;
    if (!stream) return;

    try {
      const dataGenerator = this.createDataGenerator({
        ...params,
        startPosition: stream.resumePosition
      });

      let lastCheckpointTime = Date.now();

      for await (const chunk of dataGenerator) {
        if (stream.status !== "active") break;

        await this.sendStreamChunk(streamId, chunk);
        stream.bytesTransferred += chunk.length;

        // Check if checkpoint is needed
        if (Date.now() - lastCheckpointTime > stream.checkpointInterval) {
          await this.createCheckpoint(streamId);
          lastCheckpointTime = Date.now();
        }

        // Implement backpressure
        await this.waitForAck(streamId);
      }

      await this.sendFinalChunk(streamId);
      await this.createCheckpoint(streamId); // Final checkpoint
      stream.status = "completed";

    } catch (error) {
      stream.status = "error";
      await this.createCheckpoint(streamId); // Checkpoint on error
    }
  }

  private async createCheckpoint(streamId: string): Promise<void> {
    const stream = this.streams.get(streamId) as ResumableStreamContext;
    if (!stream) return;

    const checkpoint: StreamCheckpoint = {
      streamId,
      lastSequence: stream.sequence,
      bytesTransferred: stream.bytesTransferred,
      timestamp: Date.now(),
      metadata: {}
    };

    this.checkpoints.set(streamId, checkpoint);
    stream.lastCheckpoint = Date.now();

    // Notify client about checkpoint
    await this.sendStreamStatus(streamId, {
      status: "active",
      checkpoint: {
        sequence: checkpoint.lastSequence,
        bytesTransferred: checkpoint.bytesTransferred
      }
    });
  }
}

interface StreamCheckpoint {
  streamId: string;
  lastSequence: number;
  bytesTransferred: number;
  timestamp: number;
  metadata: Record<string, unknown>;
}
```

### 2. Multi-Stream Coordination

```typescript
class MultiStreamCoordinator {
  private streamGroups = new Map<string, StreamGroup>();
  private dependencies = new Map<string, string[]>();

  createStreamGroup(groupId: string, streamIds: string[]): void {
    const group: StreamGroup = {
      groupId,
      streamIds,
      status: "initializing",
      completedStreams: new Set(),
      failedStreams: new Set()
    };

    this.streamGroups.set(groupId, group);
  }

  addStreamDependency(streamId: string, dependsOn: string[]): void {
    this.dependencies.set(streamId, dependsOn);
  }

  async canStartStream(streamId: string): Promise<boolean> {
    const dependencies = this.dependencies.get(streamId);
    if (!dependencies) return true;

    for (const depId of dependencies) {
      const depGroup = this.findStreamGroup(depId);
      if (depGroup && !depGroup.completedStreams.has(depId)) {
        return false;
      }
    }

    return true;
  }

  onStreamCompleted(streamId: string): void {
    const group = this.findStreamGroup(streamId);
    if (group) {
      group.completedStreams.add(streamId);

      // Check if all streams in group are complete
      if (group.completedStreams.size === group.streamIds.length) {
        group.status = "completed";
        this.onGroupCompleted?.(group.groupId);
      }

      // Check for dependent streams that can now start
      this.checkDependentStreams(streamId);
    }
  }

  onStreamFailed(streamId: string, error: any): void {
    const group = this.findStreamGroup(streamId);
    if (group) {
      group.failedStreams.add(streamId);
      group.status = "failed";
      this.onGroupFailed?.(group.groupId, error);
    }
  }

  private findStreamGroup(streamId: string): StreamGroup | undefined {
    for (const group of this.streamGroups.values()) {
      if (group.streamIds.includes(streamId)) {
        return group;
      }
    }
    return undefined;
  }

  private checkDependentStreams(completedStreamId: string): void {
    for (const [streamId, dependencies] of this.dependencies) {
      if (dependencies.includes(completedStreamId)) {
        if (this.canStartStream(streamId)) {
          this.onStreamReady?.(streamId);
        }
      }
    }
  }

  onGroupCompleted?: (groupId: string) => void;
  onGroupFailed?: (groupId: string, error: any) => void;
  onStreamReady?: (streamId: string) => void;
}

interface StreamGroup {
  groupId: string;
  streamIds: string[];
  status: "initializing" | "active" | "completed" | "failed";
  completedStreams: Set<string>;
  failedStreams: Set<string>;
}
```

## Performance Optimization

### 1. Buffer Management

```typescript
class EfficientBuffer {
  private buffer: ArrayBuffer[] = [];
  private totalSize = 0;
  private maxSize: number;

  constructor(maxSize = 10 * 1024 * 1024) { // 10MB default
    this.maxSize = maxSize;
  }

  append(data: ArrayBuffer): boolean {
    if (this.totalSize + data.byteLength > this.maxSize) {
      return false; // Buffer full
    }

    this.buffer.push(data);
    this.totalSize += data.byteLength;
    return true;
  }

  getCombinedData(): ArrayBuffer {
    const result = new ArrayBuffer(this.totalSize);
    const view = new Uint8Array(result);
    let offset = 0;

    for (const chunk of this.buffer) {
      const chunkView = new Uint8Array(chunk);
      view.set(chunkView, offset);
      offset += chunkView.length;
    }

    return result;
  }

  clear(): void {
    this.buffer = [];
    this.totalSize = 0;
  }

  get utilization(): number {
    return this.totalSize / this.maxSize;
  }
}
```

### 2. Adaptive Chunking

```typescript
class AdaptiveChunkSizer {
  private chunkSize: number;
  private minChunkSize: number;
  private maxChunkSize: number;
  private lastAdjustment = Date.now();
  private performanceMetrics = {
    transferRate: 0,
    errorRate: 0,
    latency: 0
  };

  constructor(initialSize = 8192, minSize = 1024, maxSize = 65536) {
    this.chunkSize = initialSize;
    this.minChunkSize = minSize;
    this.maxChunkSize = maxSize;
  }

  updateMetrics(transferRate: number, errorRate: number, latency: number): void {
    this.performanceMetrics = { transferRate, errorRate, latency };

    // Adjust chunk size based on performance
    if (Date.now() - this.lastAdjustment > 5000) { // Adjust every 5 seconds
      this.adjustChunkSize();
      this.lastAdjustment = Date.now();
    }
  }

  private adjustChunkSize(): void {
    const { transferRate, errorRate, latency } = this.performanceMetrics;

    // Increase chunk size if performance is good
    if (transferRate > 1000000 && errorRate < 0.01 && latency < 100) {
      this.chunkSize = Math.min(this.chunkSize * 1.2, this.maxChunkSize);
    }
    // Decrease chunk size if performance is poor
    else if (transferRate < 100000 || errorRate > 0.05 || latency > 500) {
      this.chunkSize = Math.max(this.chunkSize * 0.8, this.minChunkSize);
    }
  }

  getCurrentChunkSize(): number {
    return Math.round(this.chunkSize);
  }
}
```

This comprehensive streaming implementation guide provides all the necessary components for building robust, efficient streaming applications using the Omni protocol, including advanced features like resumable streams, multi-stream coordination, and performance optimization.