/**
 * Real-time Compliance Dashboard Server
 * 
 * Provides HTTP API and WebSocket connections for the compliance monitoring dashboard.
 * Delivers real-time updates and serves the dashboard interface.
 */

import { EventEmitter } from 'events';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import winston from 'winston';
import type {
  ComplianceEvent,
  ComplianceMetrics,
  ComplianceFilter,
  ComplianceScanResult,
  ComplianceConfig,
  ComplianceNotification
} from './types.js';

export interface DashboardServerOptions {
  port?: number;
  host?: string;
  logger?: winston.Logger;
}

/**
 * Dashboard server for real-time compliance monitoring
 */
export class DashboardServer extends EventEmitter {
  private port: number;
  private host: string;
  private logger: winston.Logger;
  private server: FastifyInstance;
  private wsServer?: WebSocketServer;
  private wsClients: Map<string, WebSocket> = new Map();
  private eventHistory: ComplianceEvent[] = [];
  private currentMetrics?: ComplianceMetrics;
  private lastScanResult?: ComplianceScanResult;
  private config?: ComplianceConfig;

  constructor(options: DashboardServerOptions = {}) {
    super();
    this.port = options.port || 3001;
    this.host = options.host || 'localhost';
    this.logger = options.logger || this.createDefaultLogger();
    
    this.server = fastify({
      logger: false // Use our own logger
    });
    
    this.setupRoutes();
  }

  /**
   * Start the dashboard server
   */
  async start(): Promise<void> {
    try {
      // Create HTTP server
      const httpServer = createServer();
      
      // Setup WebSocket server
      this.wsServer = new WebSocketServer({ 
        server: httpServer,
        path: '/ws'
      });
      
      this.setupWebSocketHandlers();
      
      // Start Fastify
      await this.server.listen({ 
        port: this.port, 
        host: this.host,
        server: httpServer
      });

      this.logger.info(`Dashboard server started on http://${this.host}:${this.port}`);
      this.emit('started');
      
    } catch (error) {
      this.logger.error('Failed to start dashboard server:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Stop the dashboard server
   */
  async stop(): Promise<void> {
    try {
      // Close WebSocket connections
      for (const [id, ws] of this.wsClients) {
        ws.close();
      }
      this.wsClients.clear();

      // Close WebSocket server
      if (this.wsServer) {
        this.wsServer.close();
      }

      // Close HTTP server
      await this.server.close();

      this.logger.info('Dashboard server stopped');
      this.emit('stopped');
      
    } catch (error) {
      this.logger.error('Error stopping dashboard server:', error);
      throw error;
    }
  }

  /**
   * Setup HTTP routes
   */
  private setupRoutes(): void {
    // CORS
    this.server.addHook('onRequest', async (request, reply) => {
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    });

    // Health check
    this.server.get('/health', async (request, reply) => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        connectedClients: this.wsClients.size
      };
    });

    // Get current metrics
    this.server.get('/api/metrics', async (request, reply) => {
      return {
        metrics: this.currentMetrics,
        lastUpdate: this.lastScanResult?.endTime,
        connectedClients: this.wsClients.size
      };
    });

    // Get recent events
    this.server.get('/api/events', async (request: FastifyRequest<{ Querystring: ComplianceFilter }>, reply) => {
      const filter = request.query;
      let filteredEvents = [...this.eventHistory];

      // Apply filters
      if (filter.severity) {
        filteredEvents = filteredEvents.filter(e => filter.severity!.includes(e.severity));
      }
      
      if (filter.category) {
        filteredEvents = filteredEvents.filter(e => filter.category!.includes(e.category));
      }
      
      if (filter.resolved !== undefined) {
        filteredEvents = filteredEvents.filter(e => e.resolved === filter.resolved);
      }
      
      if (filter.dateRange) {
        const start = new Date(filter.dateRange.start);
        const end = new Date(filter.dateRange.end);
        filteredEvents = filteredEvents.filter(e => 
          e.timestamp >= start && e.timestamp <= end
        );
      }
      
      if (filter.taskId) {
        filteredEvents = filteredEvents.filter(e => e.taskId === filter.taskId);
      }
      
      if (filter.column) {
        filteredEvents = filteredEvents.filter(e => e.column === filter.column);
      }

      // Sort by timestamp (newest first) and limit
      const limit = parseInt((request.query as any).limit || '100');
      filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      filteredEvents = filteredEvents.slice(0, limit);

      return {
        events: filteredEvents,
        total: this.eventHistory.length,
        filtered: filteredEvents.length
      };
    });

    // Get last scan result
    this.server.get('/api/scan-result', async (request, reply) => {
      if (!this.lastScanResult) {
        reply.code(404).send({ error: 'No scan results available' });
        return;
      }

      return this.lastScanResult;
    });

    // Get configuration
    this.server.get('/api/config', async (request, reply) => {
      if (!this.config) {
        reply.code(404).send({ error: 'Configuration not available' });
        return;
      }

      return this.config;
    });

    // Update configuration
    this.server.post('/api/config', async (request: FastifyRequest<{ Body: Partial<ComplianceConfig> }>, reply) => {
      if (!this.config) {
        reply.code(404).send({ error: 'Configuration not available' });
        return;
      }

      // Merge new configuration
      this.config = { ...this.config, ...request.body };
      
      this.logger.info('Configuration updated via API');
      this.emit('configUpdated', this.config);

      return { success: true, config: this.config };
    });

    // Trigger manual scan
    this.server.post('/api/scan', async (request, reply) => {
      this.emit('manualScanRequested');
      
      return { 
        success: true, 
        message: 'Manual scan triggered',
        timestamp: new Date().toISOString()
      };
    });

    // Resolve event
    this.server.post('/api/events/:eventId/resolve', async (request: FastifyRequest<{ Params: { eventId: string }, Body: { resolutionNotes?: string } }>, reply) => {
      const { eventId } = request.params;
      const { resolutionNotes } = request.body;

      const event = this.eventHistory.find(e => e.id === eventId);
      if (!event) {
        reply.code(404).send({ error: 'Event not found' });
        return;
      }

      event.resolved = true;
      event.resolvedAt = new Date();
      event.resolutionNotes = resolutionNotes;

      this.logger.info(`Event ${eventId} resolved: ${resolutionNotes}`);
      this.emit('eventResolved', event);

      // Broadcast to WebSocket clients
      this.broadcastToClients({
        type: 'eventResolved',
        data: event
      });

      return { success: true, event };
    });

    // Get dashboard data (combined endpoint)
    this.server.get('/api/dashboard', async (request, reply) => {
      return {
        metrics: this.currentMetrics,
        lastScan: this.lastScanResult,
        recentEvents: this.eventHistory.slice(-20),
        connectedClients: this.wsClients.size,
        serverInfo: {
          uptime: process.uptime(),
          version: '1.0.0',
          timestamp: new Date().toISOString()
        }
      };
    });

    // Serve static dashboard files (if available)
    this.server.register(import('@fastify/static'), {
      root: 'dist/dashboard',
      prefix: '/dashboard/'
    });

    // Default route - serve dashboard
    this.server.get('/', async (request, reply) => {
      reply.type('text/html').send(this.getDashboardHTML());
    });
  }

  /**
   * Setup WebSocket handlers
   */
  private setupWebSocketHandlers(): void {
    if (!this.wsServer) return;

    this.wsServer.on('connection', (ws: WebSocket, request) => {
      const clientId = randomUUID();
      this.wsClients.set(clientId, ws);

      this.logger.debug(`WebSocket client connected: ${clientId}`);

      // Send initial data
      this.sendToClient(clientId, {
        type: 'initial',
        data: {
          metrics: this.currentMetrics,
          recentEvents: this.eventHistory.slice(-20),
          lastScan: this.lastScanResult
        }
      });

      // Handle messages
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleWebSocketMessage(clientId, message);
        } catch (error) {
          this.logger.error(`Invalid WebSocket message from ${clientId}:`, error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.wsClients.delete(clientId);
        this.logger.debug(`WebSocket client disconnected: ${clientId}`);
      });

      // Handle errors
      ws.on('error', (error) => {
        this.logger.error(`WebSocket error for ${clientId}:`, error);
        this.wsClients.delete(clientId);
      });
    });
  }

  /**
   * Handle WebSocket messages
   */
  private handleWebSocketMessage(clientId: string, message: any): void {
    switch (message.type) {
      case 'subscribe':
        // Handle subscription to specific event types
        this.logger.debug(`Client ${clientId} subscribed to: ${message.filters}`);
        break;
        
      case 'ping':
        this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
        break;
        
      default:
        this.logger.warn(`Unknown WebSocket message type: ${message.type}`);
    }
  }

  /**
   * Send message to specific WebSocket client
   */
  private sendToClient(clientId: string, message: any): void {
    const ws = this.wsClients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        this.logger.error(`Failed to send message to client ${clientId}:`, error);
        this.wsClients.delete(clientId);
      }
    }
  }

  /**
   * Broadcast message to all connected WebSocket clients
   */
  private broadcastToClients(message: any): void {
    const messageStr = JSON.stringify(message);
    
    for (const [clientId, ws] of this.wsClients) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr);
        } catch (error) {
          this.logger.error(`Failed to broadcast to client ${clientId}:`, error);
          this.wsClients.delete(clientId);
        }
      }
    }
  }

  /**
   * Update metrics and broadcast to clients
   */
  updateMetrics(metrics: ComplianceMetrics): void {
    this.currentMetrics = metrics;
    
    this.broadcastToClients({
      type: 'metricsUpdate',
      data: metrics,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Add new event and broadcast to clients
   */
  addEvent(event: ComplianceEvent): void {
    this.eventHistory.push(event);
    
    // Trim history to prevent memory issues
    if (this.eventHistory.length > 1000) {
      this.eventHistory = this.eventHistory.slice(-1000);
    }

    this.broadcastToClients({
      type: 'newEvent',
      data: event,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Update scan result and broadcast to clients
   */
  updateScanResult(scanResult: ComplianceScanResult): void {
    this.lastScanResult = scanResult;
    
    this.broadcastToClients({
      type: 'scanCompleted',
      data: scanResult,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle dashboard alert
   */
  handleDashboardAlert(notification: ComplianceNotification): void {
    this.broadcastToClients({
      type: 'alert',
      data: notification,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Update configuration
   */
  updateConfig(config: ComplianceConfig): void {
    this.config = config;
    
    this.broadcastToClients({
      type: 'configUpdate',
      data: config,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get dashboard HTML
   */
  private getDashboardHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promethean Compliance Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .severity-critical { background-color: #dc2626; }
        .severity-high { background-color: #ea580c; }
        .severity-medium { background-color: #d97706; }
        .severity-low { background-color: #2563eb; }
    </style>
</head>
<body class="bg-gray-100">
    <div id="app" class="container mx-auto p-4">
        <header class="mb-6">
            <h1 class="text-3xl font-bold text-gray-800">Promethean Compliance Dashboard</h1>
            <p class="text-gray-600">Real-time compliance monitoring and alerting</p>
        </header>

        <!-- Connection Status -->
        <div id="connection-status" class="mb-4 p-2 rounded text-sm">
            <span id="status-text">Connecting...</span>
        </div>

        <!-- Metrics Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-4 rounded shadow">
                <h3 class="text-sm font-medium text-gray-500">Overall Compliance</h3>
                <p id="overall-compliance" class="text-2xl font-bold text-green-600">--%</p>
            </div>
            <div class="bg-white p-4 rounded shadow">
                <h3 class="text-sm font-medium text-gray-500">WIP Compliance</h3>
                <p id="wip-compliance" class="text-2xl font-bold text-blue-600">--%</p>
            </div>
            <div class="bg-white p-4 rounded shadow">
                <h3 class="text-sm font-medium text-gray-500">Process Compliance</h3>
                <p id="process-compliance" class="text-2xl font-bold text-purple-600">--%</p>
            </div>
            <div class="bg-white p-4 rounded shadow">
                <h3 class="text-sm font-medium text-gray-500">Security Compliance</h3>
                <p id="security-compliance" class="text-2xl font-bold text-red-600">--%</p>
            </div>
        </div>

        <!-- Recent Events -->
        <div class="bg-white rounded shadow mb-6">
            <div class="p-4 border-b">
                <h2 class="text-xl font-semibold">Recent Events</h2>
            </div>
            <div id="events-container" class="p-4">
                <p class="text-gray-500">Loading events...</p>
            </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-4 rounded shadow">
                <h3 class="text-lg font-semibold mb-4">Violation Trends</h3>
                <canvas id="trends-chart"></canvas>
            </div>
            <div class="bg-white p-4 rounded shadow">
                <h3 class="text-lg font-semibold mb-4">Compliance Breakdown</h3>
                <canvas id="breakdown-chart"></canvas>
            </div>
        </div>
    </div>

    <script>
        class ComplianceDashboard {
            constructor() {
                this.ws = null;
                this.reconnectAttempts = 0;
                this.maxReconnectAttempts = 5;
                this.charts = {};
                this.init();
            }

            init() {
                this.connectWebSocket();
                this.setupCharts();
            }

            connectWebSocket() {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsUrl = \`\${protocol}//\${window.location.host}/ws\`;
                
                this.ws = new WebSocket(wsUrl);
                
                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    this.updateConnectionStatus('Connected', 'bg-green-100 text-green-800');
                    this.reconnectAttempts = 0;
                };

                this.ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                };

                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.updateConnectionStatus('Disconnected', 'bg-red-100 text-red-800');
                    this.attemptReconnect();
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.updateConnectionStatus('Error', 'bg-red-100 text-red-800');
                };
            }

            attemptReconnect() {
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    this.updateConnectionStatus(\`Reconnecting... (\${this.reconnectAttempts}/\${this.maxReconnectAttempts})\`, 'bg-yellow-100 text-yellow-800');
                    
                    setTimeout(() => {
                        this.connectWebSocket();
                    }, 2000 * this.reconnectAttempts);
                } else {
                    this.updateConnectionStatus('Connection Failed', 'bg-red-100 text-red-800');
                }
            }

            updateConnectionStatus(text, className) {
                const status = document.getElementById('connection-status');
                const statusText = document.getElementById('status-text');
                
                status.className = \`mb-4 p-2 rounded text-sm \${className}\`;
                statusText.textContent = text;
            }

            handleMessage(message) {
                switch (message.type) {
                    case 'initial':
                        this.handleInitialData(message.data);
                        break;
                    case 'metricsUpdate':
                        this.updateMetrics(message.data);
                        break;
                    case 'newEvent':
                        this.addEvent(message.data);
                        break;
                    case 'scanCompleted':
                        this.handleScanCompleted(message.data);
                        break;
                    case 'alert':
                        this.handleAlert(message.data);
                        break;
                    default:
                        console.log('Unknown message type:', message.type);
                }
            }

            handleInitialData(data) {
                if (data.metrics) this.updateMetrics(data.metrics);
                if (data.recentEvents) this.renderEvents(data.recentEvents);
                if (data.lastScan) this.handleScanCompleted(data.lastScan);
            }

            updateMetrics(metrics) {
                document.getElementById('overall-compliance').textContent = \`\${metrics.overallCompliance.toFixed(1)}%\`;
                document.getElementById('wip-compliance').textContent = \`\${metrics.wipCompliance.toFixed(1)}%\`;
                document.getElementById('process-compliance').textContent = \`\${metrics.processCompliance.toFixed(1)}%\`;
                document.getElementById('security-compliance').textContent = \`\${metrics.securityCompliance.toFixed(1)}%\`;

                this.updateCharts(metrics);
            }

            renderEvents(events) {
                const container = document.getElementById('events-container');
                
                if (events.length === 0) {
                    container.innerHTML = '<p class="text-gray-500">No recent events</p>';
                    return;
                }

                const eventsHtml = events.slice(0, 10).map(event => \`
                    <div class="border-l-4 border-\${this.getSeverityColor(event.severity)} pl-4 py-2 mb-2">
                        <div class="flex justify-between items-start">
                            <div>
                                <span class="font-medium">\${event.description}</span>
                                <span class="ml-2 text-xs px-2 py-1 rounded severity-\${event.severity.toLowerCase()} text-white">
                                    \${event.severity}
                                </span>
                            </div>
                            <span class="text-sm text-gray-500">
                                \${new Date(event.timestamp).toLocaleString()}
                            </span>
                        </div>
                        \${event.actionRequired ? \`<p class="text-sm text-gray-600 mt-1">Action: \${event.actionRequired}</p>\` : ''}
                    </div>
                \`).join('');

                container.innerHTML = eventsHtml;
            }

            addEvent(event) {
                // Add to beginning of events list
                this.renderEvents([event, ...this.getCurrentEvents()]);
            }

            getCurrentEvents() {
                // This would get current events from the DOM or maintain a local array
                return [];
            }

            getSeverityColor(severity) {
                const colors = {
                    CRITICAL: 'red',
                    HIGH: 'orange',
                    MEDIUM: 'yellow',
                    LOW: 'blue'
                };
                return colors[severity] || 'gray';
            }

            setupCharts() {
                // Trends chart
                const trendsCtx = document.getElementById('trends-chart').getContext('2d');
                this.charts.trends = new Chart(trendsCtx, {
                    type: 'line',
                    data: {
                        labels: ['24h', '7d', '30d'],
                        datasets: [{
                            label: 'Violations',
                            data: [0, 0, 0],
                            borderColor: 'rgb(239, 68, 68)',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });

                // Breakdown chart
                const breakdownCtx = document.getElementById('breakdown-chart').getContext('2d');
                this.charts.breakdown = new Chart(breakdownCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['WIP', 'Process', 'Security'],
                        datasets: [{
                            data: [0, 0, 0],
                            backgroundColor: [
                                'rgb(59, 130, 246)',
                                'rgb(147, 51, 234)',
                                'rgb(239, 68, 68)'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }

            updateCharts(metrics) {
                // Update trends chart
                if (this.charts.trends && metrics.violationTrend) {
                    this.charts.trends.data.datasets[0].data = [
                        metrics.violationTrend.last24h,
                        metrics.violationTrend.last7d,
                        metrics.violationTrend.last30d
                    ];
                    this.charts.trends.update();
                }

                // Update breakdown chart
                if (this.charts.breakdown) {
                    this.charts.breakdown.data.datasets[0].data = [
                        metrics.wipCompliance,
                        metrics.processCompliance,
                        metrics.securityCompliance
                    ];
                    this.charts.breakdown.update();
                }
            }

            handleScanCompleted(scanResult) {
                console.log('Scan completed:', scanResult);
                // Update UI with scan results
            }

            handleAlert(alert) {
                console.log('Alert received:', alert);
                // Show alert notification
            }
        }

        // Initialize dashboard when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new ComplianceDashboard();
        });
    </script>
</body>
</html>
    `;
  }

  /**
   * Create default logger
   */
  private createDefaultLogger(): winston.Logger {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  /**
   * Get server status
   */
  getStatus(): {
    running: boolean;
    port: number;
    host: string;
    connectedClients: number;
    eventHistorySize: number;
  } {
    return {
      running: !!this.server,
      port: this.port,
      host: this.host,
      connectedClients: this.wsClients.size,
      eventHistorySize: this.eventHistory.length
    };
  }
}