import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';
const PORT = process.env.PORT || 3000;

function startServer() {
  const app = express();

  // CORS configuration
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }),
  );

  // Serve static files from dist in production
  if (!isDev) {
    app.use('/static', express.static(join(__dirname, '../static')));
  }

  // Main application routes
  app.get('/', (_req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Promethean Frontend Applications</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .app-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .app-card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-decoration: none; color: inherit; display: block; }
            .app-card:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            .app-title { font-size: 1.2em; font-weight: bold; margin-bottom: 10px; }
            .app-description { color: #666; margin-bottom: 15px; }
            .app-port { background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-family: monospace; }
          </style>
        </head>
        <body>
          <h1>Promethean Frontend Applications</h1>
          <div class="app-grid">
            <a href="/chat-ui" class="app-card">
              <div class="app-title">Chat UI</div>
              <div class="app-description">ClojureScript chat UI for viewing and managing indexed conversations</div>
              <div class="app-port">Port: 8080</div>
            </a>
            <a href="/docops" class="app-card">
              <div class="app-title">DocOps</div>
              <div class="app-description">Documentation operations frontend</div>
              <div class="app-port">Port: 8081</div>
            </a>
            <a href="/duck-web" class="app-card">
              <div class="app-title">Duck Web</div>
              <div class="app-description">Duck web interface</div>
              <div class="app-port">Port: 8082</div>
            </a>
            <a href="/kanban" class="app-card">
              <div class="app-title">Kanban</div>
              <div class="app-description">Kanban board frontend</div>
              <div class="app-port">Port: 8083</div>
            </a>
            <a href="/openai-server" class="app-card">
              <div class="app-title">OpenAI Server</div>
              <div class="app-description">OpenAI server interface</div>
              <div class="app-port">Port: 8084</div>
            </a>
            <a href="/opencode-session-manager" class="app-card">
              <div class="app-title">Opencode Session Manager</div>
              <div class="app-description">Session management interface</div>
              <div class="app-port">Port: 8085</div>
            </a>
            <a href="/piper" class="app-card">
              <div class="app-title">Piper</div>
              <div class="app-description">File management tool</div>
              <div class="app-port">Port: 8086</div>
            </a>
            <a href="/report-forge" class="app-card">
              <div class="app-title">Report Forge</div>
              <div class="app-description">Report generation tool</div>
              <div class="app-port">Port: 8087</div>
            </a>
            <a href="/smartgpt-dashboard" class="app-card">
              <div class="app-title">SmartGPT Dashboard</div>
              <div class="app-description">SmartGPT dashboard interface</div>
              <div class="app-port">Port: 8088</div>
            </a>
            <a href="/pantheon" class="app-card">
              <div class="app-title">Pantheon</div>
              <div class="app-description">React-based management UI</div>
              <div class="app-port">Port: 3000</div>
            </a>
          </div>
        </body>
      </html>
    `);
  });

  // Individual app routes
  const apps = [
    'chat-ui',
    'docops',
    'duck-web',
    'kanban',
    'openai-server',
    'opencode-session-manager',
    'piper',
    'report-forge',
    'smartgpt-dashboard',
    'pantheon',
  ];

  apps.forEach((appName) => {
    // Serve the main HTML file for each app
    app.get(`/${appName}`, (_req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${appName.replace('-', ' ').toUpperCase()} - Promethean</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: #f5f5f5; 
              }
              .container { 
                max-width: 1200px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 8px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                padding: 20px; 
              }
              .header { 
                border-bottom: 1px solid #eee; 
                padding-bottom: 20px; 
                margin-bottom: 20px; 
              }
              .back-link { 
                color: #007acc; 
                text-decoration: none; 
                font-weight: bold; 
              }
              .app-info { 
                background: #e8f4fd; 
                padding: 15px; 
                border-radius: 4px; 
                margin-bottom: 20px; 
              }
              .iframe-container { 
                width: 100%; 
                height: 80vh; 
                border: 1px solid #ddd; 
                border-radius: 4px; 
                overflow: hidden; 
              }
              iframe { 
                width: 100%; 
                height: 100%; 
                border: none; 
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <a href="/" class="back-link">← Back to Apps</a>
                <h1>${appName.replace('-', ' ').toUpperCase()}</h1>
              </div>
              <div class="app-info">
                <strong>Application:</strong> ${appName}<br>
                <strong>Status:</strong> Loading...<br>
                <strong>Development Mode:</strong> ${isDev ? 'Enabled' : 'Disabled'}
              </div>
              <div class="iframe-container">
                <iframe src="/app/${appName}" id="${appName}-frame"></iframe>
              </div>
            </div>
            <script>
              // Handle iframe loading and communication
              const iframe = document.getElementById('${appName}-frame');
              iframe.onload = function() {
                document.querySelector('.app-info strong:nth-child(2)').textContent = 'Status: Loaded';
              };
              iframe.onerror = function() {
                document.querySelector('.app-info strong:nth-child(2)').textContent = 'Status: Error loading application';
              };
            </script>
          </body>
        </html>
      `);
    });

    // Serve the actual application content
    app.use(
      `/app/${app}`,
      express.static(isDev ? join(__dirname, `../src/${app}`) : join(__dirname, `../dist/${app}`)),
    );
  });

  // API routes for development
  if (isDev) {
    app.get('/api/build-status', (_req, res) => {
      res.json({
        apps: apps.map((app) => ({
          name: app,
          status: 'development',
          url: `/${app}`,
        })),
        timestamp: new Date().toISOString(),
      });
    });
  }

  // 404 handling
  app.use((_req, res) => {
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>404 - App Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin: 40px; }
            .error-code { font-size: 4em; color: #ccc; margin-bottom: 20px; }
            .error-message { font-size: 1.2em; color: #666; }
            .back-link { color: #007acc; text-decoration: none; margin-top: 20px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="error-code">404</div>
          <div class="error-message">Application not found</div>
          <a href="/" class="back-link">← Back to Apps</a>
        </body>
      </html>
    `);
  });

  app.listen(PORT, () => {
    console.log(`🚀 Promethean Frontend Server running on http://localhost:${PORT}`);
    console.log(`📱 Environment: ${isDev ? 'Development' : 'Production'}`);
    console.log(`📊 Available applications:`);
    apps.forEach((app) => {
      console.log(`   http://localhost:${PORT}/${app}`);
    });
  });

  return app;
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();
