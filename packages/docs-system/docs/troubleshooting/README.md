# Troubleshooting Guide

This guide covers common issues, error scenarios, and their solutions for the Promethean Documentation System.

## 🚨 Common Issues

### Installation & Setup

#### Issue: "Module not found" errors during installation

**Symptoms:**

```
Error: Cannot find module '@promethean/level-cache'
```

**Solutions:**

1. Ensure you're in the correct directory:

```bash
cd packages/docs-system
```

2. Install dependencies from the repository root:

```bash
pnpm install
```

3. Clear package manager cache:

```bash
pnpm store prune
pnpm install
```

#### Issue: MongoDB connection failed

**Symptoms:**

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

1. Start MongoDB service:

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:5.0

# Using system service
sudo systemctl start mongod
```

2. Check MongoDB configuration:

```bash
# Verify MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Check connection string in .env
echo $MONGODB_URI
```

3. Update environment variables:

```env
MONGODB_URI=mongodb://localhost:27017/docs-system
MONGODB_DB_NAME=promethean_docs
```

#### Issue: Ollama connection timeout

**Symptoms:**

```
Error: connect ETIMEDOUT 127.0.0.1:11434
```

**Solutions:**

1. Start Ollama service:

```bash
# Install and start Ollama
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve
```

2. Pull required models:

```bash
ollama pull llama2
ollama pull codellama
```

3. Verify Ollama is accessible:

```bash
curl http://localhost:11434/api/tags
```

### Development Issues

#### Issue: Frontend build fails with TypeScript errors

**Symptoms:**

```
error TS2322: Type 'string' is not assignable to type 'number'
```

**Solutions:**

1. Check TypeScript configuration:

```bash
# Verify tsconfig.json
cat tsconfig.json

# Check for type errors
pnpm typecheck
```

2. Update type definitions:

```bash
# Regenerate types if needed
pnpm build:types
```

3. Fix specific type errors:

```typescript
// Example fix
const count: number = parseInt(stringValue, 10);
```

#### Issue: ESLint errors during development

**Symptoms:**

```
error: 'unusedVar' is defined but never used
```

**Solutions:**

1. Run ESLint with auto-fix:

```bash
pnpm lint --fix
```

2. Check specific rules:

```bash
pnpm lint src/components/MyComponent.tsx
```

3. Update ESLint configuration if needed:

```json
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn"
  }
}
```

#### Issue: Hot reload not working

**Symptoms:**

- Changes to files don't trigger browser refresh
- Manual refresh required to see changes

**Solutions:**

1. Check development server configuration:

```bash
# Restart dev servers
pnpm dev
```

2. Verify file watching:

```bash
# Check if files are being watched
lsof -i :3000
lsof -i :3001
```

3. Clear browser cache:

- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Clear cache in developer tools

### Runtime Issues

#### Issue: JWT authentication failures

**Symptoms:**

```
Error: jwt malformed
Error: invalid signature
```

**Solutions:**

1. Check JWT secret configuration:

```env
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
```

2. Verify token format:

```javascript
// Token should be in Authorization header
Authorization: Bearer <token>
```

3. Clear local storage and re-authenticate:

```javascript
// In browser console
localStorage.clear();
location.reload();
```

#### Issue: CORS errors in browser

**Symptoms:**

```
Access to fetch at 'http://localhost:3001/api' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Solutions:**

1. Check CORS configuration:

```javascript
// In server.ts
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);
```

2. Update environment variables:

```env
FRONTEND_URL=http://localhost:3000
```

3. Restart server after configuration changes:

```bash
pnpm dev:server
```

#### Issue: Database query timeouts

**Symptoms:**

```
Error: Query timeout after 30000ms
```

**Solutions:**

1. Check MongoDB performance:

```javascript
// In MongoDB shell
db.runCommand({ serverStatus: 1 });
db.collection.stats();
```

2. Add database indexes:

```javascript
// Create indexes for better performance
db.documents.createIndex({ title: 'text', content: 'text' });
db.documents.createIndex({ authorId: 1 });
db.documents.createIndex({ tags: 1 });
```

3. Optimize queries:

```javascript
// Use lean() for read-only operations
const docs = await Document.find(query).lean().limit(50);
```

### Performance Issues

#### Issue: Slow application startup

**Symptoms:**

- Application takes >30 seconds to start
- Memory usage spikes during startup

**Solutions:**

1. Check dependencies:

```bash
# Analyze bundle size
pnpm analyze

# Check for heavy dependencies
pnpm ls --depth=0
```

2. Optimize imports:

```typescript
// Use dynamic imports for heavy modules
const heavyModule = await import('./heavy-module');
```

3. Enable production optimizations:

```bash
# Build with optimizations
NODE_ENV=production pnpm build
```

#### Issue: High memory usage

**Symptoms:**

- Node.js process using >1GB RAM
- Memory leaks over time

**Solutions:**

1. Profile memory usage:

```bash
# Use Node.js profiler
node --inspect dist/server.js
```

2. Check for memory leaks:

```javascript
// Add memory monitoring
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory:', usage);
}, 30000);
```

3. Optimize database connections:

```javascript
// Use connection pooling
mongoose.connect(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
});
```

## 🔧 Debugging Tools

### Browser Developer Tools

1. **Network Tab**: Monitor API requests and responses
2. **Console Tab**: Check for JavaScript errors
3. **Application Tab**: Inspect local storage and cookies
4. **Performance Tab**: Analyze runtime performance

### Server Debugging

1. **Enable debug logging**:

```bash
DEBUG=* pnpm dev:server
```

2. **Use Node.js inspector**:

```bash
node --inspect-brk dist/server.js
```

3. **Monitor process metrics**:

```bash
# Install PM2 for production monitoring
npm install -g pm2
pm2 start ecosystem.config.js
pm2 monit
```

### Database Debugging

1. **MongoDB queries**:

```javascript
// Enable query logging
mongoose.set('debug', true);
```

2. **Database performance**:

```javascript
// Explain query execution
db.documents.find({}).explain('executionStats');
```

## 📊 Monitoring & Health Checks

### Application Health

Create health check endpoints:

```typescript
// routes/health.ts
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: await checkDatabaseHealth(),
    ollama: await checkOllamaHealth(),
  };

  res.json(health);
});
```

### Database Health

```javascript
async function checkDatabaseHealth() {
  try {
    await mongoose.connection.db.admin().ping();
    return { status: 'connected' };
  } catch (error) {
    return { status: 'disconnected', error: error.message };
  }
}
```

### External Service Health

```javascript
async function checkOllamaHealth() {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    return { status: 'connected', models: response.data.models.length };
  } catch (error) {
    return { status: 'disconnected', error: error.message };
  }
}
```

## 🆘 Getting Help

### Log Collection

When reporting issues, include:

1. **Application logs**:

```bash
# Collect recent logs
docker-compose logs --tail=100 app
```

2. **System information**:

```bash
# Node.js version
node --version

# npm/pnpm version
pnpm --version

# System info
uname -a
```

3. **Environment variables** (sanitized):

```bash
# Show non-sensitive environment variables
env | grep -E 'NODE_ENV|PORT|MONGODB_URI' | sed 's/=.*/=***/'
```

### Community Support

- **GitHub Issues**: [Create an issue](https://github.com/your-org/promethean/issues)
- **Discussions**: [Join the discussion](https://github.com/your-org/promethean/discussions)
- **Documentation**: [Check the docs](../README.md)

### Emergency Procedures

#### Database Corruption

1. **Stop the application**:

```bash
docker-compose down
```

2. **Backup current data**:

```bash
mongodump --db promethean_docs --out backup-$(date +%Y%m%d)
```

3. **Restore from backup**:

```bash
mongorestore --db promethean_docs backup-20231201/promethean_docs
```

#### Security Incident

1. **Rotate secrets**:

```bash
# Generate new JWT secret
openssl rand -base64 32
```

2. **Review access logs**:

```bash
# Check authentication logs
grep "auth" logs/app.log | tail -50
```

3. **Update passwords**:

```javascript
// Force password reset for all users
db.users.updateMany({}, { $set: { passwordResetRequired: true } });
```

---

## 📝 Checklist Before Reporting Issues

- [ ] Checked all environment variables are set correctly
- [ ] Verified all required services are running (MongoDB, Ollama)
- [ ] Reviewed application logs for error messages
- [ ] Tried restarting all services
- [ ] Checked for recent changes that might have caused the issue
- [ ] Tested with a clean environment (fresh Docker container)
- [ ] Collected relevant logs and system information

---

**If you continue to experience issues, please don't hesitate to reach out for support!**
