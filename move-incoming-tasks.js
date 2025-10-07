#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files that have #incoming tags (from the grep results)
const incomingFiles = [
  'docs/agile/tasks/auth_service_rfc_and_architecture.md',
  'docs/agile/tasks/ecs_mongo_adapter_library.md',
  'docs/agile/tasks/cephalon_feature_flag_path_selection.md',
  'docs/agile/tasks/cephalon_store_user_transcripts_unified.md',
  'docs/agile/tasks/rewrite-build-tools-with-bb.md',
  'docs/agile/tasks/auth_ci_and_load_tests.md',
  'docs/agile/tasks/ecs_migration_path_docs.md',
  'docs/agile/tasks/cephalon_tests_for_persistence_and_ecs.md',
  'docs/agile/tasks/auth_service_scaffold_and_endpoints.md',
  'docs/agile/tasks/integrate-sonarqube-into-devops.md',
  'docs/agile/tasks/scripts_group_audio_tools.md',
  'docs/agile/tasks/cephalon_persist_llm_replies_to_agent_messages.md',
  'docs/agile/tasks/Consolidate all kanban helpers to kanban package.md',
  'docs/agile/tasks/scripts_update_ci_and_refs.md',
  'docs/agile/tasks/ecs_persistence_integration_cephalon.md',
  'docs/agile/tasks/auth_migrate_services_to_jwt.md',
  'docs/agile/tasks/scripts_audit_and_standardize_cli_flags.md',
  'docs/agile/tasks/cephalon_event_schema_updates.md',
  'docs/agile/tasks/scripts_add_folder_readmes_and_usage.md',
  'docs/agile/tasks/ecs_query_api_gateway.md',
  'docs/agile/tasks/auth_shared_clients_and_middleware.md',
  'docs/agile/tasks/mock-broker.md',
  'docs/agile/tasks/cephalon_persist_utterance_timing_metadata.md',
  'docs/agile/tasks/bb-tool-chain.md',
  'docs/agile/tasks/ecs_projection_jobs.md',
  'docs/agile/tasks/cephalon_context_window_from_collections.md',
  'docs/agile/tasks/scripts_group_indexing_tools.md',
  'docs/agile/tasks/scripts_group_docs_utilities.md',
  'docs/agile/tasks/scripts_add_make_targets_and_aliases.md',
  'docs/agile/tasks/auth_key_rotation_and_bootstrap.md',
  'docs/agile/tasks/cephalon_backfill_conversation_history.md',
  'docs/agile/tasks/ecs_component_schemas_core.md',
  'docs/agile/tasks/upgrade-boardrev-indexing-for-large-files.md'
];

// Function to read front matter and check status
function getTaskStatus(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontMatterMatch) return null;

    const frontMatter = frontMatterMatch[1];
    const statusMatch = frontMatter.match(/^status:\s*(.+)$/m);

    return statusMatch ? statusMatch[1].trim() : null;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Function to update task status
function updateTaskStatus(filePath, newStatus) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Replace status in front matter
    const updatedContent = content.replace(
      /^(status:\s*)(.+)$/m,
      `$1${newStatus}`
    );

    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated: ${filePath} -> ${newStatus}`);
    return true;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
let movedCount = 0;
let alreadyIncomingCount = 0;
console.log('Checking for tasks with #incoming tags...\n');

for (const file of incomingFiles) {
  const filePath = path.join(__dirname, file);

  if (fs.existsSync(filePath)) {
    const status = getTaskStatus(filePath);

    if (status === null) {
      console.log(`No status found in: ${file}`);
    } else if (status === 'incoming') {
      console.log(`Already incoming: ${file}`);
      alreadyIncomingCount++;
    } else {
      console.log(`Found task with #incoming tag (status: ${status}): ${file}`);
      if (updateTaskStatus(filePath, 'incoming')) {
        movedCount++;
      }
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
}

console.log(`\nSummary:`);
console.log(`- Moved ${movedCount} tasks to incoming status`);
console.log(`- ${alreadyIncomingCount} tasks were already incoming`);