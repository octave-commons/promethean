#!/usr/bin/env node

// Organize project board items by moving them to correct columns based on status labels
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class ProjectBoardOrganizer {
  constructor() {
    this.GITHUB_TOKEN = process.env.CLASSIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    this.GITHUB_OWNER = process.env.GITHUB_OWNER || 'riatzukiza';
    this.PROJECT_NAME = process.env.PROJECT_NAME || 'generated';

    if (!this.GITHUB_TOKEN) {
      throw new Error('No GitHub token available');
    }

    console.log(`🎯 Organizing project board: ${this.PROJECT_NAME}`);
    console.log(`👤 User: ${this.GITHUB_OWNER}\n`);

    this.headers = {
      'Authorization': `token ${this.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  async graphQLRequest(query, variables = {}) {
    await new Promise(resolve => setTimeout(resolve, 500));

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

  async findProject() {
    console.log('🔍 Finding the project...');

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
      throw new Error(`Project "${this.PROJECT_NAME}" not found`);
    }

    console.log(`✅ Found project: ${project.title}`);
    console.log(`   🔗 URL: ${project.url}`);

    return project;
  }

  async getProjectDetails(project) {
    console.log('\n📋 Getting project details...');

    const query = `
      query($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            id
            title
            url
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

    console.log(`   📦 Total items: ${data.data?.node?.items?.totalCount || 0}`);
    console.log(`   📦 Items loaded: ${items.length}`);

    return { project: data.data.node, items };
  }

  analyzeItemStatuses(items) {
    console.log('\n📊 Analyzing item status labels...');

    const statusMap = {
      'icebox': 'Icebox',
      'incoming': 'Incoming',
      'accepted': 'Accepted',
      'breakdown': 'Breakdown',
      'blocked': 'Blocked',
      'ready': 'Ready',
      'todo': 'Todo',
      'in_progress': 'In Progress',
      'review': 'Review',
      'document': 'Document',
      'done': 'Done',
      'rejected': 'Rejected'
    };

    const analysis = {
      byStatus: {},
      unorganized: [],
      statusCounts: {}
    };

    items.forEach(item => {
      const statusLabel = item.content.labels.nodes.find(label =>
        Object.keys(statusMap).includes(label.name)
      );

      if (statusLabel) {
        const targetColumn = statusMap[statusLabel.name];
        if (!analysis.byStatus[targetColumn]) {
          analysis.byStatus[targetColumn] = [];
        }
        analysis.byStatus[targetColumn].push(item);
        analysis.statusCounts[targetColumn] = (analysis.statusCounts[targetColumn] || 0) + 1;
      } else {
        analysis.unorganized.push(item);
      }
    });

    console.log('\n📋 Items by target column:');
    Object.entries(analysis.statusCounts).forEach(([column, count]) => {
      console.log(`   ${column}: ${count} items`);
    });

    if (analysis.unorganized.length > 0) {
      console.log(`\n⚠️  Unorganized items: ${analysis.unorganized.length}`);
      analysis.unorganized.forEach(item => {
        console.log(`   • #${item.content.number} ${item.content.title.substring(0, 50)}...`);
      });
    }

    return analysis;
  }

  provideOrganizationInstructions(analysis, project) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📝 MANUAL ORGANIZATION INSTRUCTIONS`);
    console.log(`${'='.repeat(70)}`);

    console.log(`\n🎯 GitHub Projects v2 requires manual organization initially.`);
    console.log(`🔗 Open your board: ${project.url}`);

    console.log(`\n📋 STEP-BY-STEP ORGANIZATION:`);

    Object.entries(analysis.byStatus).forEach(([column, items]) => {
      if (items.length > 0) {
        console.log(`\n📍 ${column.toUpperCase()} (${items.length} items):`);
        items.forEach(item => {
          console.log(`   • Drag #${item.content.number} "${item.content.title.substring(0, 60)}..."`);
          console.log(`     From: Current location → To: ${column} column`);
        });
      }
    });

    if (analysis.unorganized.length > 0) {
      console.log(`\n⚠️  UNORGANIZED ITEMS (${analysis.unorganized.length}):`);
      analysis.unorganized.forEach(item => {
        console.log(`   • #${item.content.number} "${item.content.title.substring(0, 60)}..."`);
        console.log(`     Status: No clear status label - add to appropriate column`);
      });
    }

    console.log(`\n💡 QUICK TIPS:`);
    console.log(`   1️⃣  Open ${project.url}`);
    console.log(`   2️⃣  Use Board view`);
    console.log(`   3️⃣  Drag items to their target columns as listed above`);
    console.log(`   4️⃣  Items are color-coded by priority (P1=red, P2=yellow, P3=green)`);

    console.log(`\n🎯 EXPECTED FINAL BOARD:`);
    console.log(`   • Icebox: Backlog items`);
    console.log(`   • Incoming: New tasks to review`);
    console.log(`   • Ready: Ready to start work`);
    console.log(`   • Todo: Active work in progress`);
    console.log(`   • In Progress: Currently being worked on`);
    console.log(`   • Review: Ready for review/feedback`);
    console.log(`   • Done: Completed tasks ✅`);
  }

  async organizeBoard() {
    console.log(`🚀 Starting project board organization analysis\n`);

    // Find project
    const project = await this.findProject();

    // Get project details and items
    const { items } = await this.getProjectDetails(project);

    if (items.length === 0) {
      console.log('❌ No items found in project to organize');
      return;
    }

    // Analyze item statuses
    const analysis = this.analyzeItemStatuses(items);

    // Provide manual organization instructions
    this.provideOrganizationInstructions(analysis, project);

    return analysis;
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const organizer = new ProjectBoardOrganizer();

  organizer.organizeBoard()
    .then(() => {
      console.log('\n🎉 Board organization analysis completed!');
      console.log('📋 Follow the instructions above to organize your kanban board manually.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Board organization analysis failed:', error.message);
      process.exit(1);
    });
}

export default ProjectBoardOrganizer;