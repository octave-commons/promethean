#!/usr/bin/env node

// Test script using CLASSIC_GITHUB_TOKEN for Projects API
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class ClassicTokenProjectTester {
  constructor() {
    // Use CLASSIC_GITHUB_TOKEN if available, fall back to regular GITHUB_TOKEN
    this.GITHUB_TOKEN = process.env.CLASSIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    this.GITHUB_OWNER = process.env.GITHUB_OWNER || 'riatzukiza';
    this.GITHUB_REPO = process.env.GITHUB_REPO || 'promethean';
    this.PROJECT_NAME = process.env.PROJECT_NAME || 'generated';

    if (!this.GITHUB_TOKEN) {
      throw new Error('No GitHub token available');
    }

    console.log(`🔑 Using token type: ${process.env.CLASSIC_GITHUB_TOKEN ? 'CLASSIC_GITHUB_TOKEN' : 'GITHUB_TOKEN'}`);
    console.log(`🎯 Target: ${this.GITHUB_OWNER}/${this.GITHUB_REPO}`);
    console.log(`📋 Project Name: ${this.PROJECT_NAME}\n`);

    this.headers = {
      'Authorization': `token ${this.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  async graphQLRequest(query, variables = {}) {
    console.log(`🔍 GraphQL Query: ${query.substring(0, 80)}...`);

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
      console.error(`❌ GraphQL HTTP Error: ${response.statusText} - ${errorText}`);
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('❌ GraphQL Errors:', JSON.stringify(data.errors, null, 2));
      throw new Error(`GraphQL error: ${data.errors[0].message}`);
    }

    return data;
  }

  async testUserProjectsAccess() {
    console.log('1️⃣ Testing user-level Projects v2 access...');

    const query = `
      query($username: String!) {
        user(login: $username) {
          projectsV2(first: 5) {
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

    try {
      const data = await this.graphQLRequest(query, {
        username: this.GITHUB_OWNER
      });

      const projects = data.data.user.projectsV2.nodes.filter(p => p !== null);
      console.log(`✅ User Projects accessible: Found ${projects.length} projects`);

      projects.forEach(project => {
        console.log(`   📋 ${project.title} (${project.closed ? 'Closed' : 'Open'})`);
        console.log(`      🔗 ${project.url}`);
      });

      return projects;
    } catch (error) {
      console.log(`❌ User Projects access failed: ${error.message}`);
      return [];
    }
  }

  async testProjectCreation() {
    console.log('\n2️⃣ Testing project creation...');

    // First get user ID
    const userQuery = `
      query($username: String!) {
        user(login: $username) {
          id
        }
      }
    `;

    try {
      const userData = await this.graphQLRequest(userQuery, {
        username: this.GITHUB_OWNER
      });

      const userId = userData.data.user.id;
      console.log(`👤 User ID: ${userId}`);

      // Try to create a test project
      const createQuery = `
        mutation($ownerId: ID!, $title: String!) {
          createProjectV2(input: {
            ownerId: $ownerId
            title: $title
          }) {
            projectV2 {
              id
              title
              url
              number
            }
          }
        }
      `;

      const projectData = await this.graphQLRequest(createQuery, {
        ownerId: userId,
        title: `${this.PROJECT_NAME} - Test ${Date.now()}`
      });

      const project = projectData.data.createProjectV2.projectV2;
      console.log(`✅ Project creation successful!`);
      console.log(`   📋 Project: ${project.title}`);
      console.log(`   🔗 URL: ${project.url}`);
      console.log(`   🆔 ID: ${project.id}`);

      return project;
    } catch (error) {
      console.log(`❌ Project creation failed: ${error.message}`);
      return null;
    }
  }

  async testRepositoryProjectAccess() {
    console.log('\n3️⃣ Testing repository-level project access...');

    const repoQuery = `
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          id
          projectsV2(first: 5) {
            nodes {
              id
              title
              url
              number
            }
          }
        }
      }
    `;

    try {
      const data = await this.graphQLRequest(repoQuery, {
        owner: this.GITHUB_OWNER,
        repo: this.GITHUB_REPO
      });

      const projects = data.data.repository.projectsV2.nodes.filter(p => p !== null);
      console.log(`✅ Repository Projects accessible: Found ${projects.length} projects`);

      projects.forEach(project => {
        console.log(`   📋 ${project.title}`);
        console.log(`      🔗 ${project.url}`);
      });

      return data.data.repository;
    } catch (error) {
      console.log(`❌ Repository Projects access failed: ${error.message}`);
      return null;
    }
  }

  async runFullTest() {
    console.log(`🚀 Testing GitHub Projects v2 API with Classic Token\n`);

    // Test user projects
    const userProjects = await this.testUserProjectsAccess();

    // Test repository projects
    const repositoryInfo = await this.testRepositoryProjectAccess();

    // Test project creation
    const testProject = await this.testProjectCreation();

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 Classic Token Test Results:`);
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ User Projects: ${userProjects.length > 0 ? 'Accessible' : 'Not accessible'}`);
    console.log(`✅ Repository Projects: ${repositoryInfo ? 'Accessible' : 'Not accessible'}`);
    console.log(`✅ Project Creation: ${testProject ? 'Working' : 'Not working'}`);

    if (testProject) {
      console.log(`\n🎉 SUCCESS! Classic token can create GitHub Projects!`);
      console.log(`📋 Test project created: ${testProject.url}`);
      console.log(`🔥 Ready to run full kanban sync with Projects v2!`);
    } else {
      console.log(`\n❌ Classic token cannot create projects either`);
      console.log(`💡 This might be a repository permissions issue`);
    }

    return {
      userProjects,
      repositoryInfo,
      testProject,
      success: !!testProject
    };
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ClassicTokenProjectTester();

  tester.runFullTest()
    .then((result) => {
      console.log('\n🎉 Classic token testing completed!');
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n❌ Classic token testing failed:', error.message);
      process.exit(1);
    });
}

export default ClassicTokenProjectTester;