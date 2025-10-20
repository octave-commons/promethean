import { Migration } from '../contract';

export const migration: Migration = {
  id: '002-agent-context-schema',
  description: 'Create Agent OS context management tables',
  up: async (db) => {
    // Create agent_context_events table
    await db.query(`
      CREATE TABLE IF NOT EXISTS agent_context_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(255) NOT NULL,
        agent_id VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        data JSONB NOT NULL DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        version BIGINT NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        
        -- Indexes for performance
        INDEX idx_agent_context_events_agent_id (agent_id),
        INDEX idx_agent_context_events_timestamp (timestamp),
        INDEX idx_agent_context_events_version (version),
        INDEX idx_agent_context_events_type (type)
      );
    `);

    // Create agent_context_snapshots table
    await db.query(`
      CREATE TABLE IF NOT EXISTS agent_context_snapshots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        state JSONB NOT NULL DEFAULT '{}',
        version BIGINT NOT NULL,
        event_id UUID REFERENCES agent_context_events(id),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        
        -- Indexes for performance
        INDEX idx_agent_context_snapshots_agent_id (agent_id),
        INDEX idx_agent_context_snapshots_version (version),
        INDEX idx_agent_context_snapshots_timestamp (timestamp),
        
        -- Ensure only one latest snapshot per agent for quick lookups
        UNIQUE (agent_id, version)
      );
    `);

    // Create agent_context_shares table for context sharing between agents
    await db.query(`
      CREATE TABLE IF NOT EXISTS agent_context_shares (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_agent_id VARCHAR(255) NOT NULL,
        shared_with_agent_id VARCHAR(255) NOT NULL,
        context_snapshot_id UUID REFERENCES agent_context_snapshots(id),
        share_type VARCHAR(50) NOT NULL DEFAULT 'read', -- read, write, admin
        permissions JSONB DEFAULT '{}',
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_by VARCHAR(255),
        
        -- Indexes for performance
        INDEX idx_agent_context_shares_owner (owner_agent_id),
        INDEX idx_agent_context_shares_shared_with (shared_with_agent_id),
        INDEX idx_agent_context_shares_expires (expires_at),
        
        -- Prevent duplicate shares
        UNIQUE (owner_agent_id, shared_with_agent_id, context_snapshot_id)
      );
    `);

    // Create agent_context_metadata table for enhanced context information
    await db.query(`
      CREATE TABLE IF NOT EXISTS agent_context_metadata (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id VARCHAR(255) NOT NULL,
        context_key VARCHAR(255) NOT NULL,
        context_value JSONB NOT NULL,
        context_type VARCHAR(100) NOT NULL DEFAULT 'generic', -- topic, participant, preference, etc.
        visibility VARCHAR(50) NOT NULL DEFAULT 'private', -- private, shared, public
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        
        -- Indexes for performance and querying
        INDEX idx_agent_context_metadata_agent_id (agent_id),
        INDEX idx_agent_context_metadata_key (context_key),
        INDEX idx_agent_context_metadata_type (context_type),
        INDEX idx_agent_context_metadata_visibility (visibility),
        INDEX idx_agent_context_metadata_expires (expires_at),
        
        -- Prevent duplicate metadata entries
        UNIQUE (agent_id, context_key)
      );
    `);

    // Create function to update updated_at timestamp
    await db.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger for agent_context_metadata
    await db.query(`
      CREATE TRIGGER update_agent_context_metadata_updated_at
        BEFORE UPDATE ON agent_context_metadata
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Add RLS (Row Level Security) for context sharing
    await db.query(`
      ALTER TABLE agent_context_shares ENABLE ROW LEVEL SECURITY;
      
      -- Policy: Agents can only see shares where they are the owner or recipient
      CREATE POLICY agent_context_shares_visibility ON agent_context_shares
        FOR ALL USING (
          owner_agent_id = current_setting('app.current_agent_id', true) 
          OR shared_with_agent_id = current_setting('app.current_agent_id', true)
        );
    `);

    // Add RLS for metadata
    await db.query(`
      ALTER TABLE agent_context_metadata ENABLE ROW LEVEL SECURITY;
      
      -- Policy: Agents can only see their own metadata unless it's shared or public
      CREATE POLICY agent_context_metadata_visibility ON agent_context_metadata
        FOR SELECT USING (
          agent_id = current_setting('app.current_agent_id', true)
          OR visibility IN ('shared', 'public')
        );
      
      -- Policy: Agents can only update their own metadata
      CREATE POLICY agent_context_metadata_update ON agent_context_metadata
        FOR UPDATE USING (
          agent_id = current_setting('app.current_agent_id', true)
        );
      
      -- Policy: Agents can only insert their own metadata
      CREATE POLICY agent_context_metadata_insert ON agent_context_metadata
        FOR INSERT WITH CHECK (
          agent_id = current_setting('app.current_agent_id', true)
        );
    `);
  },
  
  down: async (db) => {
    // Drop tables in reverse order due to dependencies
    await db.query('DROP TABLE IF EXISTS agent_context_metadata CASCADE;');
    await db.query('DROP TABLE IF EXISTS agent_context_shares CASCADE;');
    await db.query('DROP TABLE IF EXISTS agent_context_snapshots CASCADE;');
    await db.query('DROP TABLE IF EXISTS agent_context_events CASCADE;');
    
    // Drop the trigger and function
    await db.query('DROP TRIGGER IF EXISTS update_agent_context_metadata_updated_at ON agent_context_metadata;');
    await db.query('DROP FUNCTION IF EXISTS update_updated_at_column();');
  },
};