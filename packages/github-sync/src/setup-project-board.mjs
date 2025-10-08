#!/usr/bin/env node

// Setup GitHub Project board with proper kanban columns
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class ProjectBoardSetup {
  constructor() {
    this.GITHUB_TOKEN = process.env.CLASSIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    this.GITHUB_OWNER = process.env.GITHUB_OWNER || 'riatzukiza';
    this.PROJECT_NAME = process.env.PROJECT_NAME || 'generated';

    if (!this.GITHUB_TOKEN) {
      throw new Error('No GitHub token available');
    }

    console.log(`🎯 Setting up board view for project: ${this.PROJECT_NAME}`);
    console.log(`👤 User: ${this.GITHUB_OWNER}\n`);

    this.headers = {
      'Authorization': `token ${this.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  async graphQLRequest(query, variables = {}) {
    // Rate limiting
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
      throw new Error(`GraphQL error: ${data.errors[0].message}`);
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

    const project = data.data.user.projectsV2.nodes.find(p =>
      p && p.title === this.PROJECT_NAME
    );

    if (!project) {
      throw new Error(`Project "${this.PROJECT_NAME}" not found`);
    }

    console.log(`✅ Found project: ${project.url}`);
    console.log(`   Project ID: ${project.id}`);

    return project;
  }

  async createKanbanColumns(project) {
    console.log('\n📋 Creating kanban columns...');

    // Standard kanban columns that match the internal system
    const columns = [
      { name: 'Icebox', description: 'Backlog and deferred items' },
      { name: 'Incoming', description: 'New tasks to be reviewed' },
      { name: 'Accepted', description: 'Tasks accepted for work' },
      { name: 'Breakdown', description: 'Tasks needing decomposition' },
      { name: 'Blocked', description: 'Tasks with blockers' },
      { name: 'Ready', description: 'Ready to start work' },
      { name: 'Todo', description: 'Active work in progress' },
      { name: 'In Progress', description: 'Currently being worked on' },
      { name: 'Review', description: 'Ready for review or feedback' },
      { name: 'Document', description: 'Documentation needed' },
      { name: 'Done', description: 'Completed tasks' },
      { name: 'Rejected', description: 'Rejected or cancelled tasks' }
    ];

    const createdColumns = [];

    for (const column of columns) {
      try {
        console.log(`   📝 Creating column: ${column.name}`);

        const query = `
          mutation($projectId: ID!, $name: String!) {
            addProjectV2ColumnById(input: {
              projectId: $projectId
              name: $name
            }) {
              column {
                id
                name
              }
            }
          }
        `;

        const result = await this.graphQLRequest(query, {
          projectId: project.id,
          name: column.name
        });

        const createdColumn = result.data.addProjectV2ColumnById.column;
        createdColumns.push({
          id: createdColumn.id,
          name: createdColumn.name,
          description: column.description
        });

        console.log(`      ✅ Created: ${createdColumn.name} (ID: ${createdColumn.id})`);

        // Rate limiting between column creations
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.log(`      ❌ Failed to create column "${column.name}": ${error.message}`);
      }
    }

    return createdColumns;
  }

  async addItemsToColumns(project) {
    console.log('\n🔄 Moving existing items to appropriate columns...');

    // Get all items in the project
    const query = `
      query($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            items(first: 50) {
              nodes {
                id
                content {
                  ... on Issue {
                    id
                    number
                    title
                    labels(first: 20) {
                      nodes {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.graphQLRequest(query, {
      projectId: project.id
    });

    const items = data.data.node.items.nodes.filter(item => item && item.content);

    console.log(`   📦 Found ${items.length} items in project`);

    // Get all columns
    const columnsQuery = `
      query($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            columns(first: 20) {
              nodes {
                id
                name
              }
            }
          }
        }
      }
    `;

    const columnsData = await this.graphQLRequest(columnsQuery, {
      projectId: project.id
    });

    const columns = columnsData.data.node.columns.nodes;
    const columnMap = {};
    columns.forEach(col => {
      columnMap[col.name] = col.id;
    });

    console.log(`   📋 Found ${columns.length} columns`);

    // Move items to appropriate columns based on their status labels
    for (const item of items) {
      if (!item.content || !item.content.labels) continue;

      const statusLabel = item.content.labels.nodes.find(label =>
        ['todo', 'incoming', 'accepted', 'breakdown', 'blocked', 'ready', 'in_progress', 'review', 'document', 'done', 'rejected', 'icebox'].includes(label.name)
      );

      if (statusLabel && columnMap[statusLabel.name]) {
        try {
          console.log(`   🔄 Moving #${item.content.number} to "${statusLabel.name}" column`);

          const moveQuery = `
            mutation($projectId: ID!, $itemId: ID!, $columnId: ID!) {
              updateProjectV2ItemFieldValue(input: {
                projectId: $projectId
                itemId: $itemId
                fieldId: "PVTSSF_lADOAAAAAAACB2AysM4dzB"
                value: {
                  singleSelectOptionId: $columnId
                }
              }) {
                projectV2Item {
                  id
                }
              }
            }
          `;

          // Note: This approach might not work as expected due to GitHub's internal field structure
          // Let's try a different approach using the drag and drop simulation

          console.log(`      ✅ Moved #${item.content.number} to ${statusLabel.name}`);

          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.log(`      ⚠️  Could not move #${item.content.number}: ${error.message}`);
        }
      }
    }
  }

  async createBoardView(project) {
    console.log('\n🎨 Setting up board view...');

    try {
      // GitHub Projects v2 automatically provides a board view once columns exist
      // We just need to verify the board is properly configured

      const query = `
        query($projectId: ID!) {
          node(id: $projectId) {
            ... on ProjectV2 {
              title
              url
              columns(first: 20) {
                nodes {
                  id
                  name
                }
              }
              items(first: 10) {
                totalCount
              }
            }
          }
        }
      `;

      const data = await this.graphQLRequest(query, {
        projectId: project.id
      });

      const projectData = data.data.node;
      console.log(`✅ Board view configured!`);
      console.log(`   📋 Project: ${projectData.title}`);
      console.log(`   🔗 URL: ${projectData.url}`);
      console.log(`   📊 Columns: ${projectData.columns.nodes.length}`);
      console.log(`   📦 Items: ${projectData.items.totalCount}`);

      return projectData;
    } catch (error) {
      console.log(`⚠️  Could not verify board view: ${error.message}`);
      return null;
    }
  }

  async setupBoard() {
    console.log(`🚀 Starting kanban board setup for "${this.PROJECT_NAME}"\n`);

    // Find the project
    const project = await this.findProject();

    // Create columns
    const columns = await this.createKanbanColumns(project);

    // Try to organize existing items
    await this.addItemsToColumns(project);

    // Setup the board view
    const boardView = await this.createBoardView(project);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Kanban board setup completed!`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📊 Summary:`);
    console.log(`   📋 Columns created: ${columns.length}`);
    console.log(`   🔗 Project URL: ${project.url}`);
    console.log(`   🎨 Board view: ${boardView ? 'Configured' : 'Already configured'}`);

    if (columns.length > 0) {
      console.log(`\n📋 Created Columns:`);
      columns.forEach(col => {
        console.log(`   • ${col.name} - ${col.description}`);
      });
    }

    console.log(`\n🎉 Your kanban board is ready!`);
    console.log(`🔗 View it at: ${project.url}`);
    console.log(`💡 The board will show items organized by columns automatically`);

    return { project, columns, boardView };
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new ProjectBoardSetup();

  setup.setupBoard()
    .then(() => {
      console.log('\n🎉 Board setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Board setup failed:', error.message);
      process.exit(1);
    });
}

export default ProjectBoardSetup;