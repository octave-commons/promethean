# Pantheon Framework Security Configuration Templates

## Overview

This document provides production-ready security configuration templates for the Pantheon Agent Management Framework. These templates implement defense-in-depth security principles and can be customized for specific deployment environments.

## 1. Production Security Configuration

### Main Security Configuration
```typescript
// config/security.ts
export const productionSecurityConfig = {
  // Authentication & Authorization
  authentication: {
    jwt: {
      secret: process.env.JWT_SECRET || throw new Error('JWT_SECRET required'),
      expiry: '1h',
      refreshExpiry: '7d',
      issuer: 'promethean-agent-os',
      audience: 'promethean-agents',
      algorithm: 'HS256'
    },
    mfa: {
      required: true,
      window: 300, // 5 minutes
      backupCodes: 10
    },
    rateLimit: {
      windowMs: 900000, // 15 minutes
      maxAttempts: 5,
      lockoutDuration: 1800000, // 30 minutes
      progressivePenalty: true
    },
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventReuse: 5,
      expiryDays: 90
    }
  },

  // Sandbox Configuration
  sandbox: {
    enabled: true,
    defaultIsolation: 'container',
    configurations: {
      process: {
        enabled: true,
        maxMemory: 256 * 1024 * 1024, // 256MB
        maxCpu: 25,
        timeout: 10000, // 10 seconds
        allowedPaths: ['/tmp', '/var/tmp'],
        networkAccess: false
      },
      container: {
        enabled: true,
        image: 'promethean/sandbox:latest',
        maxMemory: 512 * 1024 * 1024, // 512MB
        maxCpu: 50,
        timeout: 30000, // 30 seconds
        allowedPaths: ['/app/data', '/tmp'],
        networkAccess: false,
        readOnlyRoot: true,
        dropCapabilities: ['ALL'],
        addCapabilities: []
      },
      vm: {
        enabled: false, // Requires additional infrastructure
        maxMemory: 1024 * 1024 * 1024, // 1GB
        maxCpu: 75,
        timeout: 60000, // 60 seconds
        networkAccess: false
      }
    }
  },

  // Resource Limits
  resourceLimits: {
    global: {
      maxMemory: 8 * 1024 * 1024 * 1024, // 8GB
      maxCpu: 80, // 80% of available CPU
      maxConnections: 1000,
      maxMessagesPerSecond: 1000,
      maxPayloadSize: 10 * 1024 * 1024 // 10MB
    },
    perAgent: {
      maxMemory: 512 * 1024 * 1024, // 512MB
      maxCpu: 25,
      maxConnections: 10,
      maxMessagesPerSecond: 10,
      maxPayloadSize: 1024 * 1024 // 1MB
    }
  },

  // Input Validation
  validation: {
    maxAgentIdLength: 255,
    maxTokenLength: 2000,
    maxEventDataSize: 1024 * 1024, // 1MB
    maxContextSize: 50 * 1024 * 1024, // 50MB
    maxSourcesPerContext: 100,
    maxSourceSize: 10 * 1024 * 1024, // 10MB
    allowedEventTypes: [
      'context_created',
      'context_updated',
      'context_deleted',
      'context_shared',
      'context_archived',
      'snapshot_created',
      'auth_token_generated',
      'auth_token_validated',
      'auth_token_revoked',
      'tool_execution_started',
      'tool_execution_completed',
      'security_violation_detected'
    ],
    sanitizedFields: [
      'password', 'token', 'secret', 'key', 'auth',
      'credential', 'private', 'confidential'
    ]
  },

  // MCP Security
  mcp: {
    maxInputSize: 1024 * 1024, // 1MB
    maxOutputSize: 10 * 1024 * 1024, // 10MB
    allowedToolNames: [], // Empty means all allowed
    blockedToolNames: [
      'eval', 'exec', 'system', 'shell',
      'spawn', 'child_process', 'vm',
      'require', 'import', 'Function'
    ],
    requireAuthentication: true,
    auditAllCalls: true,
    rateLimitPerTool: new Map([
      ['file_operations', 10],
      ['system_commands', 1],
      ['network_requests', 5],
      ['database_operations', 20]
    ]),
    allowedDomains: [
      '*.api.openai.com',
      '*.anthropic.com',
      '*.googleapis.com'
    ],
    blockedDomains: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '*.internal',
      '*.local'
    ]
  },

  // Audit Logging
  audit: {
    enabled: true,
    level: 'info',
    retentionDays: 90,
    batchSize: 100,
    flushInterval: 5000, // 5 seconds
    includeStackTrace: false,
    sanitizeSensitiveData: true,
    realTimeAlerting: {
      enabled: true,
      criticalEvents: [
        'authentication_failure',
        'authorization_violation',
        'security_violation',
        'system_compromise'
      ],
      alertChannels: ['slack', 'email', 'pagerduty']
    }
  },

  // Monitoring
  monitoring: {
    metrics: {
      enabled: true,
      interval: 30000, // 30 seconds
      retentionDays: 30
    },
    healthChecks: {
      enabled: true,
      interval: 10000, // 10 seconds
      timeout: 5000, // 5 seconds
      endpoints: ['/healthz', '/readyz', '/security/status']
    },
    anomalyDetection: {
      enabled: true,
      sensitivity: 'medium',
      learningPeriod: 86400000, // 24 hours
      alertThreshold: 0.8
    }
  },

  // Encryption
  encryption: {
    atRest: {
      enabled: true,
      algorithm: 'AES-256-GCM',
      keyRotationDays: 90,
      keyProvider: 'aws-kms' // or 'azure-keyvault', 'gcp-kms'
    },
    inTransit: {
      minVersion: 'TLSv1.2',
      ciphers: [
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-CHACHA20-POLY1305',
        'ECDHE-RSA-CHACHA20-POLY1305'
      ],
      preferServerCipherOrder: true
    }
  }
};
```

### Environment-Specific Configurations
```typescript
// config/environments.ts
export const environmentConfigs = {
  development: {
    ...productionSecurityConfig,
    authentication: {
      ...productionSecurityConfig.authentication,
      mfa: {
        ...productionSecurityConfig.authentication.mfa,
        required: false
      },
      rateLimit: {
        ...productionSecurityConfig.authentication.rateLimit,
        maxAttempts: 20,
        lockoutDuration: 60000 // 1 minute
      }
    },
    sandbox: {
      ...productionSecurityConfig.sandbox,
      defaultIsolation: 'process'
    },
    audit: {
      ...productionSecurityConfig.audit,
      level: 'debug',
      realTimeAlerting: {
        ...productionSecurityConfig.audit.realTimeAlerting,
        enabled: false
      }
    }
  },

  staging: {
    ...productionSecurityConfig,
    authentication: {
      ...productionSecurityConfig.authentication,
      mfa: {
        ...productionSecurityConfig.authentication.mfa,
        required: false
      }
    },
    resourceLimits: {
      ...productionSecurityConfig.resourceLimits,
      global: {
        ...productionSecurityConfig.resourceLimits.global,
        maxMemory: 4 * 1024 * 1024 * 1024, // 4GB
        maxCpu: 60
      }
    }
  },

  production: productionSecurityConfig
};
```

## 2. Docker Security Configuration

### Secure Dockerfile
```dockerfile
# Dockerfile.secure
FROM node:18-alpine AS builder

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S pantheon -u 1001

# Security: Install security updates
RUN apk update && \
    apk upgrade && \
    apk add --no-cache dumb-init curl

# Set working directory
WORKDIR /app

# Security: Copy package files first for better layer caching
COPY package*.json ./
COPY tsconfig*.json ./

# Security: Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf ~/.npm

# Security: Copy application code with proper ownership
COPY --chown=pantheon:nodejs . .

# Security: Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Security: Install runtime dependencies and security tools
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
        dumb-init \
        curl \
        ca-certificates && \
    rm -rf /var/cache/apk/*

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S pantheon -u 1001

# Security: Create required directories with proper permissions
RUN mkdir -p /app/logs /app/tmp && \
    chown -R pantheon:nodejs /app

# Set working directory
WORKDIR /app

# Security: Copy built application
COPY --from=builder --chown=pantheon:nodejs /app/dist ./dist
COPY --from=builder --chown=pantheon:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=pantheon:nodejs /app/package.json ./

# Security: Switch to non-root user
USER pantheon

# Security: Expose port
EXPOSE 3000

# Security: Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/healthz || exit 1

# Security: Use dumb-init as PID 1
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/index.js"]
```

### Docker Compose Security
```yaml
# docker-compose.secure.yml
version: '3.8'

services:
  pantheon-framework:
    build:
      context: .
      dockerfile: Dockerfile.secure
    image: promethean/pantheon-framework:latest
    restart: unless-stopped
    
    # Security: Resource limits
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    
    # Security: Environment variables
    environment:
      - NODE_ENV=production
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - DB_ENCRYPTION_KEY_FILE=/run/secrets/db_key
      - LOG_LEVEL=info
    
    # Security: Secrets management
    secrets:
      - jwt_secret
      - db_key
      - api_keys
    
    # Security: Network configuration
    networks:
      - pantheon-network
    
    # Security: Volume mounts
    volumes:
      - pantheon-logs:/app/logs
      - pantheon-data:/app/data
    
    # Security: Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    
    # Security: Security options
    security_opt:
      - no-new-privileges:true
      - seccomp:default
    
    # Security: Read-only filesystem
    read_only: true
    
    # Security: Temporary filesystems
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
      - /var/run:noexec,nosuid,size=50m

  # Security: Reverse proxy
  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - pantheon-logs:/var/log/nginx
    networks:
      - pantheon-network
    depends_on:
      - pantheon-framework
    security_opt:
      - no-new-privileges:true

# Security: Secrets
secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  db_key:
    file: ./secrets/db_key.txt
  api_keys:
    file: ./secrets/api_keys.txt

# Security: Networks
networks:
  pantheon-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

# Security: Volumes
volumes:
  pantheon-logs:
    driver: local
  pantheon-data:
    driver: local
```

## 3. Kubernetes Security Configuration

### Secure Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pantheon-framework
  namespace: pantheon
  labels:
    app: pantheon-framework
    version: v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: pantheon-framework
  template:
    metadata:
      labels:
        app: pantheon-framework
        version: v1.0.0
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
    spec:
      # Security: Service account
      serviceAccountName: pantheon-service-account
      
      # Security: Security context
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
        seccompProfile:
          type: RuntimeDefault
      
      # Security: Containers
      containers:
      - name: pantheon
        image: promethean/pantheon-framework:latest
        imagePullPolicy: Always
        
        # Security: Container security context
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
          privileged: false
          runAsNonRoot: true
          runAsUser: 1001
        
        # Security: Environment variables
        env:
        - name: NODE_ENV
          value: "production"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: pantheon-secrets
              key: jwt-secret
        - name: DB_ENCRYPTION_KEY
          valueFrom:
            secretKeyRef:
              name: pantheon-secrets
              key: db-encryption-key
        - name: LOG_LEVEL
          value: "info"
        
        # Security: Resource limits
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        
        # Security: Ports
        ports:
        - name: http
          containerPort: 3000
          protocol: TCP
        
        # Security: Health checks
        livenessProbe:
          httpGet:
            path: /healthz
            port: http
            scheme: HTTP
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
          successThreshold: 1
        
        readinessProbe:
          httpGet:
            path: /readyz
            port: http
            scheme: HTTP
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
          successThreshold: 1
        
        # Security: Volume mounts
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: logs
          mountPath: /app/logs
        - name: config
          mountPath: /app/config
          readOnly: true
      
      # Security: Volumes
      volumes:
      - name: tmp
        emptyDir: {}
      - name: logs
        emptyDir: {}
      - name: config
        configMap:
          name: pantheon-config
      
      # Security: Image pull secrets
      imagePullSecrets:
      - name: registry-secret
      
      # Security: Node selector
      nodeSelector:
        kubernetes.io/os: linux
      
      # Security: Tolerations
      tolerations:
      - key: "dedicated"
        operator: "Equal"
        value: "pantheon"
        effect: "NoSchedule"
      
      # Security: Affinity
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - pantheon-framework
              topologyKey: kubernetes.io/hostname
```

### Network Policy
```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: pantheon-network-policy
  namespace: pantheon
spec:
  podSelector:
    matchLabels:
      app: pantheon-framework
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  - from:
    - namespaceSelector:
        matchLabels:
          name: monitoring
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: database
    ports:
    - protocol: TCP
      port: 5432
  - to: []
    ports:
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
```

### Pod Security Policy
```yaml
# k8s/pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: pantheon-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
  readOnlyRootFilesystem: true
```

## 4. Infrastructure Security

### Nginx Configuration
```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Security: Hide nginx version
    server_tokens off;

    # Security: Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; font-src 'self'; object-src 'none'; media-src 'self'; frame-src 'none';" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Security: Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Security: Connection limits
    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Security: SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Upstream backend
    upstream pantheon_backend {
        least_conn;
        server pantheon-framework:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name api.promethean.ai;

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_trusted_certificate /etc/nginx/ssl/chain.pem;

        # Security: Connection limits
        limit_conn conn_limit_per_ip 20;

        # Security: Rate limiting for API
        limit_req zone=api burst=20 nodelay;

        # Security: Proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # Security: Proxy settings
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_http_version 1.1;
        proxy_set_header Connection "";

        # API endpoints
        location /api/ {
            limit_req zone=api burst=50 nodelay;
            proxy_pass http://pantheon_backend;
            proxy_connect_timeout 5s;
            proxy_send_timeout 10s;
            proxy_read_timeout 10s;
        }

        # Authentication endpoints with stricter rate limiting
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://pantheon_backend;
            proxy_connect_timeout 5s;
            proxy_send_timeout 10s;
            proxy_read_timeout 10s;
        }

        # Health check
        location /healthz {
            proxy_pass http://pantheon_backend;
            access_log off;
        }

        # Security: Block common attacks
        location ~* \.(aspx|php|jsp|cgi)$ {
            deny all;
        }

        # Security: Block access to sensitive files
        location ~* \.(conf|log|sql|bak|backup|old)$ {
            deny all;
        }

        # Security: Block access to hidden files
        location ~ /\. {
            deny all;
        }
    }
}
```

## 5. Monitoring and Alerting Configuration

### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "security_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'pantheon-framework'
    static_configs:
      - targets: ['pantheon-framework:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:9113']
    scrape_interval: 30s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    scrape_interval: 30s
```

### Security Alert Rules
```yaml
# monitoring/security_rules.yml
groups:
  - name: pantheon_security
    rules:
      - alert: HighAuthenticationFailureRate
        expr: rate(pantheon_auth_failures_total[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High authentication failure rate detected"
          description: "Authentication failure rate is {{ $value }} failures per second"

      - alert: SecurityViolationDetected
        expr: increase(pantheon_security_violations_total[1m]) > 0
        for: 0m
        labels:
          severity: critical
        annotations:
          summary: "Security violation detected"
          description: "{{ $value }} security violations detected in the last minute"

      - alert: UnauthorizedAccessAttempt
        expr: increase(pantheon_unauthorized_access_total[5m]) > 5
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Multiple unauthorized access attempts"
          description: "{{ $value }} unauthorized access attempts detected"

      - alert: ResourceExhaustion
        expr: pantheon_memory_usage_percent > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is {{ $value }}%"

      - alert: SuspiciousToolExecution
        expr: increase(pantheon_tool_executions_total[5m]) > 100
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Unusual tool execution rate"
          description: "{{ $value }} tool executions detected in 5 minutes"
```

## 6. Environment Variables Configuration

### Production Environment
```bash
# .env.production
# Application
NODE_ENV=production
LOG_LEVEL=info
DEBUG=false

# Security
JWT_SECRET_FILE=/run/secrets/jwt_secret
DB_ENCRYPTION_KEY_FILE=/run/secrets/db_key
API_KEYS_FILE=/run/secrets/api_keys

# Database
DATABASE_URL=postgresql://user:pass@db:5432/pantheon
DATABASE_SSL_MODE=require
DATABASE_SSL_CERT=/etc/ssl/certs/db.crt

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD_FILE=/run/secrets/redis_password

# External Services
OPENAI_API_KEY_FILE=/run/secrets/openai_key
ANTHROPIC_API_KEY_FILE=/run/secrets/anthropic_key

# Monitoring
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090

# Security Headers
TRUST_PROXY=true
CORS_ORIGIN=https://app.promethean.ai

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Sandbox
SANDBOX_ENABLED=true
SANDBOX_ISOLATION=container
SANDBOX_MAX_MEMORY=536870912
SANDBOX_MAX_CPU=50
SANDBOX_TIMEOUT=30000

# Audit
AUDIT_ENABLED=true
AUDIT_RETENTION_DAYS=90
AUDIT_REAL_TIME_ALERTING=true
```

## Conclusion

These security configuration templates provide a comprehensive foundation for deploying the Pantheon Framework in production environments. They implement defense-in-depth principles and can be customized based on specific requirements and compliance needs.

Regular security reviews and updates to these configurations are essential to maintain effectiveness against evolving threats.

---

**Last Updated**: October 20, 2025  
**Next Review**: January 20, 2026  
**Security Team**: security@promethean.ai