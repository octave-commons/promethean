# Omni Service Deployment Guide

This guide covers various deployment scenarios for the Omni Service, including Docker, Docker Compose, Kubernetes, and reverse proxy configuration.

## 🚀 Quick Start with Docker

### Build and Run Locally

```bash
# Build the Docker image
cd packages/omni-service
docker build -t omni-service:latest .

# Run the service
docker run -d \
  --name omni-service \
  -p 3000:3000 \
  -e JWT_SECRET=your-super-secret-jwt-key-min-32-characters \
  -e NODE_ENV=production \
  omni-service:latest
```

### Using Docker Compose

```bash
# Production deployment
docker-compose up -d

# Development environment
docker-compose --profile dev up -d

# Run tests
docker-compose --profile test up
```

## 📋 Configuration

### Environment Variables

#### Required Variables
- `JWT_SECRET`: JWT secret key (minimum 32 characters)
- `NODE_ENV`: Node environment (production/development/test)

#### Optional Variables
- `PORT`: Service port (default: 3000)
- `HOST`: Service host (default: 0.0.0.0)
- `LOG_LEVEL`: Log level (debug|info|warn|error|fatal)
- `CORS_ORIGIN`: CORS origins (comma-separated)
- `RATE_LIMIT_MAX`: Rate limit requests per minute
- `APIKEY_ENABLED`: Enable API key authentication
- `RBAC_DEFAULT_ROLES`: Default roles for new users

#### Database Configuration
- `MONGODB_HOST`: MongoDB host
- `MONGODB_PORT`: MongoDB port
- `MONGODB_DATABASE`: MongoDB database name
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `REDIS_PASSWORD`: Redis password

### Development Environment Variables

```bash
# Create .env file
cat > .env << EOF
# Service Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=debug

# Authentication
JWT_SECRET=dev-jwt-secret-for-development-only
APIKEY_ENABLED=true
RBAC_DEFAULT_ROLES=readonly

# Database
MONGODB_HOST=mongodb
MONGODB_PORT=27017
MONGODB_DATABASE=omni_service_dev
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=devredispassword

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8080
EOF
```

### Production Environment Variables

```bash
# Create .env.production file
cat > .env.production << EOF
# Service Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=info

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-for-production
APIKEY_ENABLED=true
RBAC_DEFAULT_ROLES=readonly

# Database
MONGODB_HOST=mongodb
MONGODB_PORT=27017
MONGODB_DATABASE=omni_service
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redispassword

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_MAX=1000
EOF
```

## 🐳 Docker Deployment

### Multi-Stage Build

The Dockerfile uses a multi-stage build process:

1. **Base Stage**: Installs build dependencies
2. **Builder Stage**: Builds the application
3. **Production Stage**: Creates production image with only runtime dependencies

### Production Image

```bash
# Build production image
docker build --target production -t omni-service:production .

# Run with environment file
docker run -d \
  --name omni-service-prod \
  -p 3000:3000 \
  --env-file .env.production \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/static:/app/static \
  omni-service:production
```

### Development Image

```bash
# Build development image
docker build --target development -t omni-service:dev .

# Run with hot reload
docker run -d \
  --name omni-service-dev \
  -p 3000:3000 \
  -p 9229:9229 \
  -v $(pwd)/packages/omni-service/src:/app/packages/omni-service/src \
  --env-file .env \
  omni-service:dev
```

### Testing Image

```bash
# Build testing image
docker build --target testing -t omni-service:test .

# Run tests
docker run --rm \
  --env-file .env.test \
  -v $(pwd)/test-reports:/app/test-reports \
  omni-service:test
```

## 🔧 Docker Compose

### Production Deployment

```bash
# Deploy with all services
docker-compose up -d

# Scale the service
docker-compose up -d --scale omni-service=3

# View logs
docker-compose logs -f omni-service
```

### Development Environment

```bash
# Start development environment
docker-compose --profile dev up -d

# View development logs
docker-compose --profile dev logs -f omni-service-dev

# Connect to MongoDB
docker-compose exec mongodb mongo
```

### Testing

```bash
# Run test suite
docker-compose --profile test up

# View test results
docker-compose --profile test logs omni-service-testing
```

### Services Included

- **omni-service**: Main application service
- **redis**: Caching and session storage
- **mongodb**: Database for persistence
- **nginx**: Reverse proxy with SSL termination
- **prometheus**: Metrics collection
- **grafana**: Monitoring dashboard

## 🌐 Kubernetes Deployment

### Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: omni-service
  labels:
    name: omni-service
```

### ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: omni-service-config
  namespace: omni-service
data:
  JWT_SECRET: "your-super-secret-jwt-key-min-32-characters"
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  PORT: "3000"
  HOST: "0.0.0.0"
  CORS_ORIGIN: "https://yourdomain.com"
  RATE_LIMIT_MAX: "1000"
  APIKEY_ENABLED: "true"
  RBAC_DEFAULT_ROLES: "readonly"
```

### Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: omni-service-secrets
  namespace: omni-service
type: Opaque
data:
  mongodb-root-username: YWRtaW4=  # admin
  mongodb-root-password: YWRtaW5wYWRtaW4=  # adminadmin
  redis-password: cmVkaXNwYXNzJlcg==  # redispassword
```

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: omni-service
  namespace: omni-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: omni-service
  template:
    metadata:
      labels:
        app: omni-service
    spec:
      containers:
      - name: omni-service
        image: omni-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: JWT_SECRET
          valueFrom:
            configMapKeyRef:
              name: omni-service-config
              key: JWT_SECRET
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: omni-service-config
              key: NODE_ENV
        - name: MONGODB_HOST
          value: "mongodb"
        - name: REDIS_HOST
          value: "redis"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        volumeMounts:
        - name: static
          mountPath: /app/static
      volumes:
      - name: static
        persistentVolumeClaim:
          claimName: omni-service-static
```

### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: omni-service
  namespace: omni-service
spec:
  selector:
    app: omni-service
  ports:
  - port: 3000
    targetPort: 3000
    name: http
  type: ClusterIP
```

### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: omni-service-ingress
  namespace: omni-service
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  tls:
  - hosts:
    - yourdomain.com
    secretName: omni-service-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: omni-service
            port:
              number: 3000
```

### PersistentVolumeClaim

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: omni-service-static
  namespace: omni-service
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

## 🔧 Nginx Reverse Proxy

### Basic Configuration

```nginx
upstream omni_service {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;
    
    # Proxy to Omni Service
    location / {
        proxy_pass http://omni_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS Headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    }
}
```

### Multi-Protocol Routing

```nginx
# REST API routing
location /api/ {
    proxy_pass http://omni_service;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# GraphQL routing with WebSocket support
location /graphql {
    proxy_pass http://omni_service;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# WebSocket routing
location /ws {
    proxy_pass http://omni_service;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# MCP routing
location /mcp {
    proxy_pass http://omni_service;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Content-Type application/json;
}
```

## 📊 Monitoring

### Health Check

```bash
# Check service health
curl http://localhost:3000/health

# Check adapter status
curl http://localhost:3000/adapters/status
```

### Metrics Collection

The service exposes metrics in Prometheus format:

```bash
# Get metrics endpoint
curl http://localhost:3000/metrics
```

### Logging

Configure structured logging for production:

```typescript
// Log format for production
{
  "timestamp": "2025-06-20T18:45:00.000Z",
  "level": "info",
  "message": "Request completed",
  "service": "omni-service",
  "adapter": "rest",
  "requestId": "req_123456789",
  "method": "GET",
  "path": "/api/v1/users",
  "statusCode": 200,
  "duration": 45,
  "userId": "user_123",
  "roles": ["user"]
}
```

## 🔒 Security

### SSL/TLS Configuration

```bash
# Generate self-signed certificate for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/nginx/ssl/key.pem \
  -out docker/nginx/ssl/cert.pem \
  -subj "/CN=localhost"

# For production, use Let's Encrypt
certbot certonly --standalone -d yourdomain.com
```

### Security Headers

The reverse proxy adds these security headers:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

### Firewall Rules

```bash
# Allow only necessary ports
ufw allow 80/tcp   # HTTP (redirect)
ufw allow 443/tcp  # HTTPS
ufw allow 3000/tcp # Omni Service
ufw allow 9229/tcp # Debug port (development only)
```

## 📈 Performance Tuning

### Node.js Optimization

```javascript
// In package.json scripts
"start": "node --max-old-space-size=2048 --optimize-for-size dist/index.js",
```

### Nginx Optimization

```nginx
# Worker processes
worker_processes auto;

# Connection handling
events {
    worker_connections 2048;
}

# Buffer settings
client_body_buffer_size 8k;
client_max_body_size 10M;
client_header_buffer_size 1k;
large_client_header_buffers 4 4k;

# Timeout settings
keepalive_timeout 65;
send_timeout 30;
read_timeout 30;
```

### Database Optimization

```javascript
// MongoDB connection pooling
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  bufferMaxEntriesBytes: 0,
};
```

## 🚨 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker logs omni-service

# Check configuration
docker exec omni-service pnpm config

# Verify JWT secret is at least 32 characters
```

#### Database Connection Issues
```bash
# Check MongoDB connection
docker-compose exec mongodb mongo --eval "db.adminCommand('ismaster')"

# Check Redis connection
docker-compose exec redis redis-cli ping
```

#### Port Conflicts
```bash
# Check port availability
netstat -tuln | grep :3000

# Use different port
docker-compose up -e PORT=3001
```

#### Memory Issues
```bash
# Monitor memory usage
docker stats omni-service

# Check Node.js memory limits
docker exec omni-service node --max-old-space-size=4096 --process.memoryUsage
```

### Debug Mode

```bash
# Enable debug logging
docker-compose up -e LOG_LEVEL=debug

# Connect to container for debugging
docker-compose exec omni-service sh

# View all processes inside container
docker-compose exec omni-service ps aux
```

---

**This guide provides comprehensive deployment options for the Omni Service, from local development to production Kubernetes deployments.**