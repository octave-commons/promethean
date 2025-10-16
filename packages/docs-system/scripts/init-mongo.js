// MongoDB initialization script for Promethean Documentation System

// Switch to the application database
db = db.getSiblingDB('promethean_docs');

// Create application user
db.createUser({
  user: 'promethean_user',
  pwd: 'promethean_password',
  roles: [
    {
      role: 'readWrite',
      db: 'promethean_docs'
    }
  ]
});

// Create collections and indexes
print('Creating collections and indexes...');

// Users collection
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

// Documents collection
db.createCollection('documents');
db.documents.createIndex({ title: 'text', content: 'text' });
db.documents.createIndex({ authorId: 1 });
db.documents.createIndex({ tags: 1 });
db.documents.createIndex({ createdAt: -1 });
db.documents.createIndex({ updatedAt: -1 });

// Queries collection
db.createCollection('queries');
db.queries.createIndex({ userId: 1 });
db.queries.createIndex({ status: 1 });
db.queries.createIndex({ createdAt: -1 });
db.queries.createIndex({ jobId: 1 });

// Ollama jobs collection
db.createCollection('ollama_jobs');
db.ollamaJobs.createIndex({ jobId: 1 }, { unique: true });
db.ollamaJobs.createIndex({ userId: 1 });
db.ollamaJobs.createIndex({ status: 1 });
db.ollamaJobs.createIndex({ createdAt: -1 });
db.ollamaJobs.createIndex({ priority: -1 });

// Settings collection
db.createCollection('settings');
db.settings.createIndex({ key: 1 }, { unique: true });

// Insert default settings
db.settings.insertOne({
  key: 'system',
  value: {
    siteName: 'Promethean Documentation System',
    siteDescription: 'AI-powered documentation system',
    contactEmail: 'admin@promethean.dev',
    defaultLanguage: 'en',
    timezone: 'UTC',
    version: '1.0.0',
    initializedAt: new Date()
  }
});

print('Database initialization completed successfully!');
print('Database: promethean_docs');
print('User: promethean_user');
print('Collections: users, documents, queries, ollama_jobs, settings');