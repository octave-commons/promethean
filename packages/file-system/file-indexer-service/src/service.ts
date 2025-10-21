import express from 'express';
import { z } from 'zod';
import { FileIndexer } from './file-indexer.js';

const SearchQuerySchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(100).default(10),
});

const IndexDirectorySchema = z.object({
  path: z.string().min(1),
  includePatterns: z.array(z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
  maxFileSize: z.number().positive().optional(),
  followSymlinks: z.boolean().default(false),
});

const FilePathSchema = z.object({
  path: z.string().min(1),
});

export class FileIndexerService {
  private app: express.Application;
  private indexer: FileIndexer;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.indexer = new FileIndexer();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Search files
    this.app.post('/search', async (req, res) => {
      try {
        const { query, limit } = SearchQuerySchema.parse(req.body);
        const results = await this.indexer.search(query, limit);
        res.json({ success: true, results });
      } catch (error) {
        res.status(400).json({
          success: false,
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    });

    // Index directory
    this.app.post('/index', async (req, res) => {
      try {
        const options = IndexDirectorySchema.parse(req.body);
        const stats = await this.indexer.indexDirectory(options.path, options);
        res.json({ success: true, stats });
      } catch (error) {
        res.status(400).json({
          success: false,
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    });

    // Get file by path
    this.app.post('/file', async (req, res) => {
      try {
        const { path } = FilePathSchema.parse(req.body);
        const file = await this.indexer.getFileByPath(path);
        if (!file) {
          return res.status(404).json({ success: false, error: 'File not found' });
        }
        res.json({ success: true, file });
      } catch (error) {
        res.status(400).json({
          success: false,
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    });

    // Get recent files
    this.app.get('/recent', async (req, res) => {
      try {
        const limit = parseInt(req.query.limit as string) || 10;
        const files = await this.indexer.getRecentFiles(limit);
        res.json({ success: true, files });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    });

    // Remove file
    this.app.delete('/file', async (req, res) => {
      try {
        const { path } = FilePathSchema.parse(req.body);
        const success = await this.indexer.removeFile(path);
        res.json({ success });
      } catch (error) {
        res.status(400).json({
          success: false,
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    });

    // Get statistics
    this.app.get('/stats', async (req, res) => {
      try {
        const stats = await this.indexer.getStats();
        res.json({ success: true, stats });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    });

    // Error handling middleware
    this.app.use(
      (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error('Unhandled error:', err);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      },
    );
  }

  async start(): Promise<void> {
    try {
      await this.indexer.initialize();
      this.app.listen(this.port, () => {
        console.log(`File Indexer Service running on port ${this.port}`);
      });
    } catch (error) {
      console.error('Failed to start service:', error);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    await this.indexer.cleanup();
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.env.PORT || '3000');
  const service = new FileIndexerService(port);

  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await service.stop();
    process.exit(0);
  });

  service.start().catch(console.error);
}
