#!/usr/bin/env node

// Complete kanban sync workflow - creates project, issues, and provides setup instructions
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class CompleteKanbanSync {
  constructor() {
    this.GITHUB_TOKEN = process.env.CLASSIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    this.GITHUB_OWNER = process.env.GITHUB_OWNER || 'riatzukiza';
    this.GITHUB_REPO = process.env.GITHUB_REPO || 'promethean';
    this.PROJECT_NAME = process.env.PROJECT_NAME || 'generated';

    if (!this.GITHUB_TOKEN) {
      throw new Error('❌ No GitHub token found. Please set CLASSIC_GITHUB_TOKEN');
    }

    console.log(`🚀 COMPLETE KANBAN SYNC WORKFLOW`);
    console.log(`🔑 Token: ${process.env.CLASSIC_GITHUB_TOKEN ? 'CLASSIC_GITHUB_TOKEN ✅' : 'GITHUB_TOKEN ⚠️'}`);
    console.log(`🎯 Target: ${this.GITHUB_OWNER}/${this.GITHUB_REPO}`);
    console.log(`📋 Project: ${this.PROJECT_NAME}\n`);
  }

  async runCompleteSync() {
    console.log(`${'='.repeat(60)}`);
    console.log(`STEP 1: Running kanban task sync to GitHub`);
    console.log(`${'='.repeat(60)}\n`);

    // Import and run the final sync
    const { default: FinalKanbanSync } = await import('./kanban-sync-final.mjs');
    const sync = new FinalKanbanSync();

    const syncResult = await sync.syncKanbanTasksToProject();

    if (!syncResult.project) {
      console.log('❌ Sync failed - no project created');
      return;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`STEP 2: Providing board setup instructions`);
    console.log(`${'='.repeat(60)}\n`);

    // Import and run status check
    const { default: ProjectStatusChecker } = await import('./check-project-status.mjs');
    const checker = new ProjectStatusChecker();

    await checker.runCheck();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎉 COMPLETE SYNC FINISHED!`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📊 FINAL RESULTS:`);
    console.log(`   ✅ Project created: ${syncResult.project.url}`);
    console.log(`   ✅ Issues created: ${syncResult.results.filter(r => r.success).length}`);
    console.log(`   ✅ Items added to project: ${syncResult.results.filter(r => r.success && r.addedToProject).length}`);
    console.log(`   ✅ Ready for board setup: YES`);

    console.log(`\n🔗 IMPORTANT LINKS:`);
    console.log(`   📋 GitHub Project: ${syncResult.project.url}`);
    console.log(`   🔗 Repository Issues: https://github.com/${this.GITHUB_OWNER}/${this.GITHUB_REPO}/issues`);

    console.log(`\n📝 NEXT STEPS:`);
    console.log(`   1️⃣  Open the project: ${syncResult.project.url}`);
    console.log(`   2️⃣  Click "Board" view`);
    console.log(`   3️⃣  Add columns: Icebox, Incoming, Accepted, Breakdown, Blocked, Ready, Todo, In Progress, Review, Document, Done, Rejected`);
    console.log(`   4️⃣  GitHub will auto-organize items by status labels`);

    console.log(`\n🎯 Your kanban board is now ready for team collaboration!`);

    return syncResult;
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const completeSync = new CompleteKanbanSync();

  completeSync.runCompleteSync()
    .then(() => {
      console.log('\n🎉 Complete kanban sync workflow finished successfully!');
      console.log('🚀 Your GitHub kanban board is ready to use!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Complete kanban sync workflow failed:', error.message);
      console.error('💡 Make sure you have CLASSIC_GITHUB_TOKEN set in your environment');
      process.exit(1);
    });
}

export default CompleteKanbanSync;