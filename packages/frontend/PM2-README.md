# Frontend PM2 Service Management

This document explains how to use PM2 to manage the consolidated frontend applications.

## Quick Start

### Start All Frontend Applications

```bash
# Start all apps in development mode
pnpm run pm2:dev

# Or start in production mode
pnpm run pm2:prod

# Or just start with default environment
pnpm run pm2:start
```

### Stop All Applications

```bash
pnpm run pm2:stop
```

### Restart All Applications

```bash
pnpm run pm2:restart
```

### Delete All Applications

```bash
pnpm run pm2:delete
```

## Monitoring

### Check Status

```bash
pnpm run pm2:status
```

### View Logs

```bash
pnpm run pm2:logs
```

### Open Monitor Dashboard

```bash
pnpm run pm2:monit
```

## Individual Applications

The PM2 configuration includes all frontend applications:

| Application              | Name                                | Port | Description               |
| ------------------------ | ----------------------------------- | ---- | ------------------------- |
| Chat UI                  | `frontend-chat-ui`                  | 8080 | ClojureScript chat UI     |
| DocOps                   | `frontend-docops`                   | 8081 | Documentation operations  |
| Duck Web                 | `frontend-duck-web`                 | 8082 | Duck web interface        |
| Kanban                   | `frontend-kanban`                   | 8083 | Kanban board              |
| OpenAI Server            | `frontend-openai-server`            | 8084 | OpenAI server interface   |
| Opencode Session Manager | `frontend-opencode-session-manager` | 8085 | Session management        |
| Piper                    | `frontend-piper`                    | 8086 | File management tool      |
| Report Forge             | `frontend-report-forge`             | 8087 | Report generation         |
| SmartGPT Dashboard       | `frontend-smartgpt-dashboard`       | 8088 | SmartGPT dashboard        |
| Pantheon                 | `frontend-pantheon`                 | 3000 | React-based management UI |

## Log Files

All applications write logs to the `./logs/` directory:

- `{app-name}-error.log` - Error logs
- `{app-name}-out.log` - Standard output
- `{app-name}-combined.log` - Combined logs with timestamps

## Environment Variables

### Development

- `NODE_ENV=development`
- Individual ports for each app (8080-8088, 3000)

### Production

- `NODE_ENV=production`
- Same port allocation as development

## Memory Management

Each application is configured with:

- Max memory restart: 1GB
- Node.js memory limit: 4GB (`--max-old-space-size=4096`)

## Chrome DevTools Testing

To test with Chrome DevTools:

1. Start the desired application(s):

   ```bash
   # Start specific app
   pm2 start frontend-chat-ui

   # Or start all
   pnpm run pm2:start
   ```

2. Open Chrome DevTools and navigate to:

   - Chat UI: `http://localhost:8080`
   - Pantheon: `http://localhost:3000`
   - etc.

3. Use Chrome DevTools to inspect, debug, and test the applications

## Troubleshooting

### View Real-time Logs

```bash
# Follow logs for specific app
pm2 logs frontend-chat-ui

# Follow all logs
pm2 logs
```

### Restart Specific App

```bash
pm2 restart frontend-chat-ui
```

### Check Memory Usage

```bash
pm2 monit
```

### Stop Specific App

```bash
pm2 stop frontend-chat-ui
```

## Configuration File

The PM2 configuration is stored in `ecosystem.config.mjs`. You can modify this file to:

- Change ports
- Adjust memory limits
- Add environment variables
- Modify log locations

## Deployment

For production deployment, the configuration includes a deploy section that:

- Uses the `production` environment
- Runs `pnpm install && pnpm run build` on deploy
- Deploys to `/var/www/promethean/frontend`

Use with:

```bash
pm2 deploy production
```
