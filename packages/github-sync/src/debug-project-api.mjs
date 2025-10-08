#!/usr/bin/env node

class ProjectAPIDebugger {
  constructor() {
    this.GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    this.GITHUB_OWNER = process.env.GITHUB_OWNER || 'riatzukiza';
    this.GITHUB_REPO = process.env.GITHUB_REPO || 'promethean';

    if (!this.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }

    this.headers = {
      'Authorization': `token ${this.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  async graphQLRequest(query, variables = {}) {
    console.log(`🔍 GraphQL Query: ${query.substring(0, 100)}...`);
    console.log(`🔍 Variables: ${JSON.stringify(variables, null, 2)}`);

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
    console.log(`✅ GraphQL Response:`, JSON.stringify(data, null, 2));

    if (data.errors) {
      console.error('❌ GraphQL Errors:', JSON.stringify(data.errors, null, 2));
      throw new Error(`GraphQL error: ${data.errors[0].message}`);
    }

    return data;
  }

  async testProjectAccess() {
    console.log('🧪 Testing GitHub Projects v2 API Access...\n');

    // Test 1: Check if user can view organization projects
    console.log('1️⃣ Testing organization project access...');
    try {
      const orgQuery = `
        query($owner: String!) {
          organization(login: $owner) {
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

      const orgData = await this.graphQLRequest(orgQuery, {
        owner: this.GITHUB_OWNER
      });

      console.log('✅ Organization projects accessible');
    } catch (error) {
      console.log(`❌ Organization projects not accessible: ${error.message}`);
    }

    // Test 2: Check user-level projects
    console.log('\n2️⃣ Testing user project access...');
    try {
      const userQuery = `
        query($username: String!) {
          user(login: $username) {
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

      const userData = await this.graphQLRequest(userQuery, {
        username: this.GITHUB_OWNER
      });

      console.log('✅ User projects accessible');
    } catch (error) {
      console.log(`❌ User projects not accessible: ${error.message}`);
    }

    // Test 3: Check repository projects with different approach
    console.log('\n3️⃣ Testing repository project access...');
    try {
      const repoQuery = `
        query($owner: String!, $repo: String!) {
          repository(owner: $owner, name: $repo) {
            id
            owner {
              id
              __typename
            }
          }
        }
      `;

      const repoData = await this.graphQLRequest(repoQuery, {
        owner: this.GITHUB_OWNER,
        repo: this.GITHUB_REPO
      });

      console.log('✅ Repository accessible');
      console.log(`   Repository ID: ${repoData.data.repository.id}`);
      console.log(`   Owner ID: ${repoData.data.repository.owner.id}`);
      console.log(`   Owner Type: ${repoData.data.repository.owner.__typename}`);

      return {
        repositoryId: repoData.data.repository.id,
        ownerId: repoData.data.repository.owner.id,
        ownerType: repoData.data.repository.owner.__typename
      };
    } catch (error) {
      console.log(`❌ Repository not accessible: ${error.message}`);
      return null;
    }
  }

  async testProjectCreation(repositoryInfo) {
    if (!repositoryInfo) {
      console.log('\n❌ Cannot test project creation without repository access');
      return;
    }

    console.log('\n4️⃣ Testing project creation...');

    // Try creating a user-level project first
    try {
      console.log('   Trying user-level project creation...');
      const userProjectQuery = `
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

      const projectData = await this.graphQLRequest(userProjectQuery, {
        ownerId: repositoryInfo.ownerId,
        title: 'Test Project API Access'
      });

      console.log('✅ User project creation successful!');
      console.log(`   Project URL: ${projectData.data.createProjectV2.projectV2.url}`);
      return projectData.data.createProjectV2.projectV2;
    } catch (error) {
      console.log(`❌ User project creation failed: ${error.message}`);

      // Try repository-level project creation
      try {
        console.log('   Trying repository-level project creation...');
        const repoProjectQuery = `
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

        const projectData = await this.graphQLRequest(repoProjectQuery, {
          ownerId: repositoryInfo.repositoryId,
          title: 'Test Repository Project'
        });

        console.log('✅ Repository project creation successful!');
        console.log(`   Project URL: ${projectData.data.createProjectV2.projectV2.url}`);
        return projectData.data.createProjectV2.projectV2;
      } catch (repoError) {
        console.log(`❌ Repository project creation failed: ${repoError.message}`);
      }
    }

    return null;
  }

  async runDebugSuite() {
    console.log(`🔍 Debugging GitHub Projects v2 API for ${this.GITHUB_OWNER}/${this.GITHUB_REPO}\n`);

    const repositoryInfo = await this.testProjectAccess();
    const project = await this.testProjectCreation(repositoryInfo);

    if (project) {
      console.log('\n🎉 Project creation successful!');
      console.log(`📋 Project URL: ${project.url}`);
      console.log(`🆔 Project ID: ${project.id}`);
      console.log(`📝 Project Title: ${project.title}`);
    } else {
      console.log('\n❌ Project creation failed');
      console.log('💡 Suggestions:');
      console.log('   1. Check if your fine-grained token has "Repository Projects" permission');
      console.log('   2. Try creating a classic personal access token with "repo" and "project" scopes');
      console.log('   3. Verify you have admin access to the repository');
    }
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const apiDebugger = new ProjectAPIDebugger();

  apiDebugger.runDebugSuite()
    .then(() => {
      console.log('\n🎉 API debugging completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ API debugging failed:', error.message);
      process.exit(1);
    });
}

export default ProjectAPIDebugger;