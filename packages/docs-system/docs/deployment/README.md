# Deployment Guide

This comprehensive guide covers deploying the Promethean Documentation System in various environments, from development to production.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Docker** & **Docker Compose** 20.10+
- **MongoDB** 5.0+ (or use Docker)
- **Redis** 6.0+ (or use Docker)
- **Ollama** (for AI features)
- **Domain name** (for production)
- **SSL certificate** (for production HTTPS)

### One-Command Development Deployment

```bash
# Clone and start development environment
git clone <repository-url>
cd promethean/packages/docs-system
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# API Documentation: http://localhost:3001/api-docs
```

## 🐳 Docker Deployment

### Development Environment

#### docker-compose.yml

```yaml
version: '3.8'

services:
  # Application Service
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - '3001:3001'
      - '3000:3000'
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/docs-system
      - REDIS_URL=redis://redis:6379
      - OLLAMA_BASE_URL=http://ollama:11434
      - JWT_SECRET=dev-jwt-secret-change-in-production
      - FRONTEND_URL=http://localhost:3000
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - mongo
      - redis
      - ollama
    restart: unless-stopped
    networks:
      - docs-network

  # MongoDB Database
  mongo:
    image: mongo:5.0
    ports:
      - '27017:27017'
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password123
      - MONGO_INITDB_DATABASE=docs-system
    volumes:
      - mongo_data:/data/db
      - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    restart: unless-stopped
    networks:
      - docs-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    command: redis-server --appendonly yes --requirepass redis123
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - docs-network

  # Ollama AI Service
  ollama:
    image: ollama/ollama
    ports:
      - '11434:11434'
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
    restart: unless-stopped
    networks:
      - docs-network

  # Nginx Reverse Proxy (Optional)
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - docs-network

volumes:
  mongo_data:
  redis_data:
  ollama_data:

networks:
  docs-network:
    driver: bridge
```

#### Dockerfile.dev

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Expose ports
EXPOSE 3000 3001

# Start development servers
CMD ["pnpm", "dev"]
```

### Production Environment

#### docker-compose.prod.yml

```yaml
version: '3.8'

services:
  # Application Service
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3001:3001'
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/docs-system
      - REDIS_URL=redis://redis:6379
      - OLLAMA_BASE_URL=http://ollama:11434
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
    depends_on:
      - mongo
      - redis
      - ollama
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
    networks:
      - docs-network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3001/health']
      interval: 30s
      timeout: 10s
      retries: 3

  # MongoDB Database
  mongo:
    image: mongo:5.0
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=docs-system
    volumes:
      - mongo_data:/data/db
      - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    restart: unless-stopped
    networks:
      - docs-network
    command: mongod --auth

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - docs-network

  # Ollama AI Service
  ollama:
    image: ollama/ollama
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
    restart: unless-stopped
    networks:
      - docs-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./dist/frontend:/usr/share/nginx/html:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - docs-network

volumes:
  mongo_data:
  redis_data:
  ollama_data:

networks:
  docs-network:
    driver: bridge
```

#### Dockerfile (Production)

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server/index.js"]
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file for production:

```env
# Application
NODE_ENV=production
PORT=3001

# Database
MONGODB_URI=mongodb://username:password@mongo:27017/docs-system?authSource=admin
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password

# Cache
REDIS_URL=redis://:redis-password@redis:6379
REDIS_PASSWORD=your-redis-password

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# AI Service
OLLAMA_BASE_URL=http://ollama:11434

# Frontend
FRONTEND_URL=https://your-domain.com

# SSL (if using HTTPS)
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
```

### Nginx Configuration

#### nginx.prod.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

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

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Upstream backend
    upstream backend {
        least_conn;
        server app:3001 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;

        # Modern SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # HSTS
        add_header Strict-Transport-Security "max-age=63072000" always;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy "strict-origin-when-cross-origin";

        # Frontend static files
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;

            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # API proxy
        location /api/ {
            limit_req zone=api burst=20 nodelay;

            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # WebSocket proxy
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Login endpoint with stricter rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;

            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://backend;
            access_log off;
        }
    }
}
```

## ☸️ Kubernetes Deployment

### Namespace and ConfigMaps

#### namespace.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: docs-system
  labels:
    name: docs-system
```

#### configmap.yaml

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: docs-system-config
  namespace: docs-system
data:
  NODE_ENV: 'production'
  PORT: '3001'
  MONGODB_URI: 'mongodb://mongo-service:27017/docs-system'
  REDIS_URL: 'redis://redis-service:6379'
  OLLAMA_BASE_URL: 'http://ollama-service:11434'
  FRONTEND_URL: 'https://your-domain.com'
  LOG_LEVEL: 'info'
  ENABLE_METRICS: 'true'
```

#### secret.yaml

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: docs-system-secrets
  namespace: docs-system
type: Opaque
data:
  JWT_SECRET: <base64-encoded-jwt-secret>
  MONGO_ROOT_USERNAME: <base64-encoded-mongo-username>
  MONGO_ROOT_PASSWORD: <base64-encoded-mongo-password>
  REDIS_PASSWORD: <base64-encoded-redis-password>
```

### Application Deployment

#### deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: docs-system-app
  namespace: docs-system
  labels:
    app: docs-system-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: docs-system-app
  template:
    metadata:
      labels:
        app: docs-system-app
    spec:
      containers:
        - name: docs-system
          image: promethean/docs-system:latest
          ports:
            - containerPort: 3001
          envFrom:
            - configMapRef:
                name: docs-system-config
            - secretRef:
                name: docs-system-secrets
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 3001
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          volumeMounts:
            - name: logs
              mountPath: /app/logs
      volumes:
        - name: logs
          emptyDir: {}
      imagePullSecrets:
        - name: registry-secret
```

#### service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: docs-system-service
  namespace: docs-system
  labels:
    app: docs-system-app
spec:
  selector:
    app: docs-system-app
  ports:
    - name: http
      port: 3001
      targetPort: 3001
      protocol: TCP
  type: ClusterIP
```

### Database Deployments

#### mongodb-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: docs-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
        - name: mongodb
          image: mongo:5.0
          ports:
            - containerPort: 27017
          env:
            - name: MONGO_INITDB_ROOT_USERNAME
              valueFrom:
                secretKeyRef:
                  name: docs-system-secrets
                  key: MONGO_ROOT_USERNAME
            - name: MONGO_INITDB_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: docs-system-secrets
                  key: MONGO_ROOT_PASSWORD
            - name: MONGO_INITDB_DATABASE
              value: 'docs-system'
          volumeMounts:
            - name: mongo-storage
              mountPath: /data/db
          resources:
            requests:
              memory: '512Mi'
              cpu: '250m'
            limits:
              memory: '1Gi'
              cpu: '500m'
      volumes:
        - name: mongo-storage
          persistentVolumeClaim:
            claimName: mongodb-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: mongo-service
  namespace: docs-system
spec:
  selector:
    app: mongodb
  ports:
    - port: 27017
      targetPort: 27017
  type: ClusterIP
```

#### redis-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: docs-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          ports:
            - containerPort: 6379
          command: ['redis-server', '--requirepass', '$(REDIS_PASSWORD)', '--appendonly', 'yes']
          env:
            - name: REDIS_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: docs-system-secrets
                  key: REDIS_PASSWORD
          volumeMounts:
            - name: redis-storage
              mountPath: /data
          resources:
            requests:
              memory: '128Mi'
              cpu: '100m'
            limits:
              memory: '256Mi'
              cpu: '200m'
      volumes:
        - name: redis-storage
          persistentVolumeClaim:
            claimName: redis-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: redis-service
  namespace: docs-system
spec:
  selector:
    app: redis
  ports:
    - port: 6379
      targetPort: 6379
  type: ClusterIP
```

### Ingress Configuration

#### ingress.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: docs-system-ingress
  namespace: docs-system
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
    nginx.ingress.kubernetes.io/use-regex: 'true'
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    nginx.ingress.kubernetes.io/rate-limit: '100'
    nginx.ingress.kubernetes.io/rate-limit-window: '1m'
spec:
  tls:
    - hosts:
        - your-domain.com
        - www.your-domain.com
      secretName: docs-system-tls
  rules:
    - host: your-domain.com
      http:
        paths:
          - path: /api(/|$)(.*)
            pathType: Prefix
            backend:
              service:
                name: docs-system-service
                port:
                  number: 3001
          - path: /socket.io(/|$)(.*)
            pathType: Prefix
            backend:
              service:
                name: docs-system-service
                port:
                  number: 3001
          - path: /(.*)
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
    - host: www.your-domain.com
      http:
        paths:
          - path: /api(/|$)(.*)
            pathType: Prefix
            backend:
              service:
                name: docs-system-service
                port:
                  number: 3001
          - path: /socket.io(/|$)(.*)
            pathType: Prefix
            backend:
              service:
                name: docs-system-service
                port:
                  number: 3001
          - path: /(.*)
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
```

### Persistent Volumes

#### pvc.yaml

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-pvc
  namespace: docs-system
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: fast-ssd
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-pvc
  namespace: docs-system
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi
  storageClassName: fast-ssd
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ollama-pvc
  namespace: docs-system
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
  storageClassName: fast-ssd
```

## 🚀 Deployment Scripts

### Automated Deployment Script

#### deploy.sh

```bash
#!/bin/bash

set -e

# Configuration
DOCKER_REGISTRY="your-registry.com"
IMAGE_NAME="docs-system"
VERSION=${1:-latest}
ENVIRONMENT=${2:-production}

echo "🚀 Deploying Promethean Documentation System"
echo "Version: $VERSION"
echo "Environment: $ENVIRONMENT"

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -t $DOCKER_REGISTRY/$IMAGE_NAME:$VERSION .
docker push $DOCKER_REGISTRY/$IMAGE_NAME:$VERSION

# Deploy to Kubernetes
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🌐 Deploying to production..."
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/secret.yaml
    kubectl apply -f k8s/pvc.yaml
    kubectl apply -f k8s/mongodb-deployment.yaml
    kubectl apply -f k8s/redis-deployment.yaml
    kubectl apply -f k8s/ollama-deployment.yaml
    kubectl apply -f k8s/deployment.yaml
    kubectl apply -f k8s/service.yaml
    kubectl apply -f k8s/ingress.yaml

    # Wait for deployment
    echo "⏳ Waiting for deployment to be ready..."
    kubectl rollout status deployment/docs-system-app -n docs-system --timeout=300s

    echo "✅ Production deployment completed!"
else
    echo "🧪 Deploying to staging..."
    # Apply staging configurations
    kubectl apply -f k8s/staging/

    echo "✅ Staging deployment completed!"
fi

# Show status
echo "📊 Deployment status:"
kubectl get pods -n docs-system
kubectl get services -n docs-system
kubectl get ingress -n docs-system

echo "🎉 Deployment completed successfully!"
```

### Health Check Script

#### health-check.sh

```bash
#!/bin/bash

set -e

NAMESPACE="docs-system"
SERVICE_NAME="docs-system-service"
HEALTH_URL="https://your-domain.com/health"

echo "🏥 Checking application health..."

# Check Kubernetes pods
echo "📋 Checking pod status..."
kubectl get pods -n $NAMESPACE

# Check service endpoints
echo "🔗 Checking service endpoints..."
kubectl get endpoints -n $NAMESPACE

# Check application health endpoint
echo "❤️ Checking application health..."
if curl -f -s $HEALTH_URL > /dev/null; then
    echo "✅ Application is healthy"
else
    echo "❌ Application health check failed"
    exit 1
fi

# Check database connectivity
echo "🗄️ Checking database connectivity..."
kubectl exec -n $NAMESPACE deployment/mongodb -- mongo --eval "db.adminCommand('ismaster')" > /dev/null 2>&1
echo "✅ MongoDB is accessible"

# Check Redis connectivity
echo "🔴 Checking Redis connectivity..."
kubectl exec -n $NAMESPACE deployment/redis -- redis-cli ping > /dev/null 2>&1
echo "✅ Redis is accessible"

echo "🎉 All health checks passed!"
```

## 🔍 Monitoring and Logging

### Prometheus Monitoring

#### monitoring.yaml

```yaml
apiVersion: v1
kind: ServiceMonitor
metadata:
  name: docs-system-monitor
  namespace: docs-system
  labels:
    app: docs-system-app
spec:
  selector:
    matchLabels:
      app: docs-system-app
  endpoints:
    - port: http
      path: /metrics
      interval: 30s
---
apiVersion: v1
kind: Service
metadata:
  name: docs-system-metrics
  namespace: docs-system
  labels:
    app: docs-system-app
spec:
  selector:
    app: docs-system-app
  ports:
    - name: metrics
      port: 9090
      targetPort: 9090
      protocol: TCP
```

### Logging Configuration

#### logging.yaml

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: docs-system
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*docs-system*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      format json
      time_format %Y-%m-%dT%H:%M:%S.%NZ
    </source>

    <filter kubernetes.**>
      @type kubernetes_metadata
    </filter>

    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch.logging.svc.cluster.local
      port 9200
      index_name docs-system-logs
      type_name _doc
    </match>
```

## 🔧 Maintenance

### Backup Script

#### backup.sh

```bash
#!/bin/bash

set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
NAMESPACE="docs-system"

echo "💾 Starting backup process..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "📄 Backing up MongoDB..."
kubectl exec -n $NAMESPACE deployment/mongodb -- mongodump --out /tmp/backup
kubectl cp $NAMESPACE/$(kubectl get pods -n $NAMESPACE -l app=mongodb -o jsonpath='{.items[0].metadata.name}'):/tmp/backup $BACKUP_DIR/mongodb_$DATE

# Backup Redis
echo "🔴 Backing up Redis..."
kubectl exec -n $NAMESPACE deployment/redis -- redis-cli --rdb /tmp/redis_backup.rdb
kubectl cp $NAMESPACE/$(kubectl get pods -n $NAMESPACE -l app=redis -o jsonpath='{.items[0].metadata.name}'):/tmp/redis_backup.rdb $BACKUP_DIR/redis_$DATE.rdb

# Compress backups
echo "🗜️ Compressing backups..."
tar -czf $BACKUP_DIR/docs_system_backup_$DATE.tar.gz $BACKUP_DIR/mongodb_$DATE $BACKUP_DIR/redis_$DATE.rdb

# Cleanup temporary files
rm -rf $BACKUP_DIR/mongodb_$DATE $BACKUP_DIR/redis_$DATE.rdb

echo "✅ Backup completed: $BACKUP_DIR/docs_system_backup_$DATE.tar.gz"
```

### Update Script

#### update.sh

```bash
#!/bin/bash

set -e

VERSION=${1:-latest}
NAMESPACE="docs-system"

echo "🔄 Updating Promethean Documentation System to version $VERSION"

# Pull new image
echo "📦 Pulling new image..."
kubectl set image deployment/docs-system-app docs-system=promethean/docs-system:$VERSION -n $NAMESPACE

# Wait for rollout
echo "⏳ Waiting for rollout to complete..."
kubectl rollout status deployment/docs-system-app -n $NAMESPACE --timeout=300s

# Verify deployment
echo "✅ Verifying deployment..."
kubectl get pods -n $NAMESPACE -l app=docs-system-app

echo "🎉 Update completed successfully!"
```

## 🛡️ Security Considerations

### SSL/TLS Setup

1. **Generate SSL Certificate**

   ```bash
   # Using Let's Encrypt
   certbot certonly --standalone -d your-domain.com -d www.your-domain.com

   # Or use self-signed for development
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout nginx/ssl/key.pem \
     -out nginx/ssl/cert.pem
   ```

2. **Configure Automatic Renewal**
   ```bash
   # Add to crontab
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Security Best Practices

1. **Network Security**

   - Use private networks for internal communication
   - Implement firewall rules
   - Use VPN for administrative access

2. **Container Security**

   - Use non-root users
   - Scan images for vulnerabilities
   - Implement resource limits

3. **Secrets Management**

   - Use Kubernetes secrets
   - Rotate secrets regularly
   - Never commit secrets to version control

4. **Monitoring and Alerting**
   - Set up security alerts
   - Monitor access logs
   - Implement intrusion detection

## 🚨 Troubleshooting

### Common Issues

1. **Container Won't Start**

   ```bash
   # Check logs
   kubectl logs -n docs-system deployment/docs-system-app

   # Check events
   kubectl describe pod -n docs-system
   ```

2. **Database Connection Issues**

   ```bash
   # Test database connectivity
   kubectl exec -it -n docs-system deployment/docs-system-app -- node -e "
   const mongoose = require('mongoose');
   mongoose.connect(process.env.MONGODB_URI)
     .then(() => console.log('✅ Database connected'))
     .catch(err => console.error('❌ Database connection failed:', err));
   "
   ```

3. **High Memory Usage**

   ```bash
   # Check resource usage
   kubectl top pods -n docs-system

   # Check resource limits
   kubectl describe pod -n docs-system
   ```

### Performance Optimization

1. **Database Optimization**

   - Add appropriate indexes
   - Monitor slow queries
   - Implement connection pooling

2. **Caching Strategy**

   - Use Redis for frequently accessed data
   - Implement CDN for static assets
   - Optimize cache TTL values

3. **Load Balancing**
   - Use multiple replicas
   - Implement health checks
   - Configure proper load balancing algorithms

---

This deployment guide provides comprehensive instructions for deploying the Promethean Documentation System in various environments. Always test deployments in a staging environment before applying to production.
