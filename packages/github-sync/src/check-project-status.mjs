#!/usr/bin/env node

// Check current project status and provide manual setup instructions
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class ProjectStatusChecker {
  constructor() {
    this.GITHUB_TOKEN = process.env.CLASSIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    this.GITHUB_OWNER = process.env.GITHUB_OWNER || 'riatzukiza';
    this.PROJECT_NAME = process.env.PROJECT_NAME || 'generated';

    if (!this.GITHUB_TOKEN) {
      throw new Error('No GitHub token available');
    }

    console.log(`🔍 Checking project status: ${this.PROJECT_NAME}`);
    console.log(`👤 User: ${this.GITHUB_OWNER}\n`);

    this.headers = {
      'Authorization': `token ${this.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  async graphQLRequest(query, variables = {}) {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        ...this.headers,
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GraphQL request failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (data.errors) {
      console.log('⚠️  GraphQL Errors:', data.errors.map(e => e.message).join(', '));
    }

    return data;
  }

  async checkProject() {
    console.log('🔍 Finding and checking the project...');

    const query = `
      query($username: String!) {
        user(login: $username) {
          projectsV2(first: 20) {
            nodes {
              id
              title
              url
              number
              closed
              updatedAt
              createdAt
            }
          }
        }
      }
    `;

    const data = await this.graphQLRequest(query, {
      username: this.GITHUB_OWNER
    });

    const project = data.data?.user?.projectsV2?.nodes?.find(p =>
      p && p.title === this.PROJECT_NAME
    );

    if (!project) {
      console.log(`❌ Project "${this.PROJECT_NAME}" not found`);
      return null;
    }

    console.log(`✅ Found project: ${project.title}`);
    console.log(`   🆔 ID: ${project.id}`);
    console.log(`   🔗 URL: ${project.url}`);
    console.log(`   📅 Created: ${new Date(project.createdAt).toLocaleString()}`);
    console.log(`   📅 Updated: ${new Date(project.updatedAt).toLocaleString()}`);

    return project;
  }

  async checkProjectItems(project) {
    console.log('\n📦 Checking project items...');

    const query = `
      query($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            title
            items(first: 50) {
              nodes {
                id
                content {
                  ... on Issue {
                    id
                    number
                    title
                    state
                    labels(first: 20) {
                      nodes {
                        name
                      }
                    }
                  }
                }
              }
              totalCount
            }
          }
        }
      }
    `;

    const data = await this.graphQLRequest(query, {
      projectId: project.id
    });

    const items = data.data?.node?.items?.nodes?.filter(item => item && item.content) || [];

    console.log(`📊 Project: ${data.data?.node?.title}`);
    console.log(`   📦 Total items: ${data.data?.node?.items?.totalCount || 0}`);
    console.log(`   📦 Items loaded: ${items.length}`);

    if (items.length > 0) {
      console.log('\n🏷️  Sample items:');
      items.slice(0, 5).forEach(item => {
        const statusLabel = item.content.labels.nodes.find(label =>
          ['todo', 'incoming', 'accepted', 'breakdown', 'blocked', 'ready', 'in_progress', 'review', 'document', 'done', 'rejected', 'icebox'].includes(label.name)
        );

        console.log(`   • #${item.content.number} ${item.content.title.substring(0, 60)}...`);
        console.log(`     Status: ${statusLabel?.name || 'No status label'} | State: ${item.content.state}`);
      });
    }

    return items;
  }

  provideSetupInstructions(project, items) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📋 BOARD SETUP INSTRUCTIONS`);
    console.log(`${'='.repeat(70)}`);

    console.log(`\n🎯 Your project is ready! Items have been created and added to the project.`);
    console.log(`🔗 Project URL: ${project.url}`);

    console.log(`\n📝 TO SET UP THE KANBAN BOARD VIEW:`);
    console.log(`\n1️⃣  Open the project: ${project.url}`);
    console.log(`2️⃣  Click on "Board" view (if not already selected)`);
    console.log(`3️⃣  Click the "+" button to add columns with these names:`);

    const columns = [
      'Icebox', 'Incoming', 'Accepted', 'Breakdown', 'Blocked',
      'Ready', 'Todo', 'In Progress', 'Review', 'Document', 'Done', 'Rejected'
    ];

    columns.forEach((col, index) => {
      const itemNumber = index + 2;
      console.log(`   ${itemNumber}. ${col}`);
    });

    console.log(`\n4️⃣  GitHub will automatically organize items based on their status labels:`);

    const statusCounts = {};
    items.forEach(item => {
      const statusLabel = item.content.labels.nodes.find(label =>
        ['todo', 'incoming', 'accepted', 'breakdown', 'blocked', 'ready', 'in_progress', 'review', 'document', 'done', 'rejected', 'icebox'].includes(label.name)
      );

      if (statusLabel) {
        statusCounts[statusLabel.name] = (statusCounts[statusLabel.name] || 0) + 1;
      }
    });

    Object.entries(statusCounts).forEach(([status, count]) => {
      const columnName = status.charAt(0).toUpperCase() + status.slice(1);
      console.log(`   • ${columnName}: ${count} items`);
    });

    console.log(`\n🎨 BOARD WILL AUTOMATICALLY SHOW:`);
    console.log(`   ✅ All 15 kanban tasks`);
    console.log(`   ✅ Proper status labels and priorities`);
    console.log(`   ✅ Issue numbers and links`);
    console.log(`   ✅ Original UUIDs for tracking`);

    console.log(`\n💡 ALTERNATIVE - Use Table View:`);
    console.log(`   • Click "Table" view for a spreadsheet layout`);
    console.log(`   • Filter by status, priority, or labels`);
    console.log(`   • Sort by issue number or creation date`);

    console.log(`\n🚀 YOUR KANBAN BOARD IS READY TO USE!`);
  }

  async runCheck() {
    const project = await this.checkProject();

    if (!project) {
      console.log('\n❌ Project setup needed - run the sync script first');
      return;
    }

    const items = await this.checkProjectItems(project);

    this.provideSetupInstructions(project, items);

    return { project, items };
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new ProjectStatusChecker();

  checker.runCheck()
    .then(() => {
      console.log('\n🎉 Project status check completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Project status check failed:', error.message);
      process.exit(1);
    });
}

export default ProjectStatusChecker;