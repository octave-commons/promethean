import fs from 'fs/promises';
import path from 'path';

async function createBenchmarkFile(category, name, difficulty, scale, complexity, content, answer) {
  const dir = `/home/err/devel/promethean/docs/benchmarks/prompts/${category}`;

  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  const filePath = path.join(dir, `${name}.md`);

  const fileContent = `---
difficulty: ${difficulty}
scale: ${scale}
complexity: ${complexity}
answer: |
  ${answer}
---

${content}`;

  try {
    await fs.writeFile(filePath, fileContent, 'utf8');
    console.log(`Generated: ${filePath}`);
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

// Additional Code Review Prompts
await createBenchmarkFile(
  'code-review',
  'dependency-management',
  'medium',
  'medium',
  'medium',
  `Review this dependency management in a Promethean Framework package:

\`\`\`typescript
// package.json
{
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.21",
    "moment": "^2.29.4",
    "request": "^2.88.2",
    "bluebird": "^3.7.2"
  },
  "devDependencies": {
    "@types/lodash": "^4.14.182",
    "@types/moment": "^2.13.0"
  }
}

// Usage in code
import _ from 'lodash';
import moment from 'moment';
import request from 'request';
import Promise from 'bluebird';

export class DataService {
  async processData(data: any[]): Promise<any[]> {
    // Using lodash for simple array operations
    const filtered = _.filter(data, item => item.active);
    const sorted = _.sortBy(filtered, 'createdAt');
    const grouped = _.groupBy(sorted, 'category');
    
    // Using moment for date formatting
    const processed = _.map(sorted, item => ({
      ...item,
      formattedDate: moment(item.createdAt).format('YYYY-MM-DD'),
      daysAgo: moment().diff(moment(item.createdAt), 'days')
    }));
    
    return processed;
  }
  
  async fetchExternalData(url: string): Promise<any> {
    // Using deprecated request library
    return new Promise((resolve, reject) => {
      request.get(url, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(body));
        }
      });
    });
  }
}
\`\`\`

Identify dependency management issues and suggest improvements following modern JavaScript/TypeScript best practices.`,
  `The agent should identify:
1. Use of deprecated libraries (request, moment, bluebird)
2. Missing native alternatives (fetch, native Date, native Promise)
3. Unnecessary lodash usage for simple operations
4. Missing security updates for dependencies
5. No dependency auditing or vulnerability scanning
6. Missing tree-shaking optimization opportunities
7. No peer dependency management
8. Missing bundle size optimization
9. No dependency version pinning strategy
10. Missing development vs production dependency separation`,
);

// Additional Documentation Prompts
await createBenchmarkFile(
  'documentation',
  'api-specification-review',
  'hard',
  'large',
  'high',
  `Review this API specification for the Promethean Framework's agent management system:

\`\`\`yaml
# agent-api.yaml
openapi: 3.0.0
info:
  title: Agent Management API
  version: 1.0.0

paths:
  /agents:
    get:
      summary: Get all agents
      responses:
        '200':
          description: List of agents
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Agent'
    
    post:
      summary: Create agent
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AgentInput'
      responses:
        '201':
          description: Agent created
        '400':
          description: Bad request

  /agents/{id}:
    get:
      summary: Get agent by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Agent details
        '404':
          description: Agent not found

components:
  schemas:
    Agent:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        status:
          type: string
        config:
          type: object
    AgentInput:
      type: object
      properties:
        name:
          type: string
        config:
          type: object
\`\`\`

Identify API specification issues and improve it for enterprise-grade documentation and developer experience.`,
  `The agent should identify:
1. Missing detailed parameter and response descriptions
2. No example values or schemas
3. Missing error response schemas
4. No authentication and security documentation
5. Missing pagination and filtering specifications
6. No rate limiting information
7. Missing API versioning strategy
8. No request/response validation rules
9. Missing callback or webhook specifications
10. No SDK generation considerations
11. Missing testing and mock data examples
12. No performance characteristics documentation
13. Missing change management and deprecation policies
14. No integration examples and tutorials`,
);

// Additional Testing Prompts
await createBenchmarkFile(
  'testing',
  'end-to-end-testing-strategy',
  'expert',
  'enterprise',
  'very-high',
  `Design an end-to-end testing strategy for the Promethean Framework's complete agent workflow:

**System Components:**
- Agent orchestration service
- Task management system
- Kanban board interface
- Notification system
- Database layer
- External API integrations

**Current E2E Test:**
\`\`\`typescript
test('Complete agent workflow', async t => {
  // Setup test environment
  const testDb = await createTestDatabase();
  const testApp = await startTestApp(testDb);
  
  // Create agent
  const agentResponse = await request(testApp)
    .post('/agents')
    .send({ name: 'Test Agent', type: 'processor' });
  
  const agentId = agentResponse.body.id;
  
  // Create task
  const taskResponse = await request(testApp)
    .post('/tasks')
    .send({ title: 'Test Task', priority: 'P1' });
  
  const taskId = taskResponse.body.id;
  
  // Assign task to agent
  await request(testApp)
    .post('/agents/' + agentId + '/tasks')
    .send({ taskId });
  
  // Wait for processing (brittle)
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Check results
  const taskStatus = await request(testApp)
    .get('/tasks/' + taskId);
  
  t.is(taskStatus.body.status, 'done');
  
  // Cleanup
  await testApp.close();
  await testDb.close();
});
\`\`\`

Identify E2E testing anti-patterns and design a comprehensive testing strategy for reliable, maintainable end-to-end tests.`,
  `The agent should identify:
1. Brittle timing-based assertions
2. Missing test isolation and cleanup
3. No test data management strategy
4. Missing environment configuration management
5. No parallel test execution support
6. Missing visual/UI testing components
7. No API contract testing
8. Missing performance and load testing in E2E
9. No cross-browser/device testing
10. Missing accessibility testing
11. No security testing in E2E flows
12. Missing error scenario and failure testing
13. No test reporting and analytics
14. Missing test data privacy and compliance
15. No integration with CI/CD pipeline optimization`,
);

// Additional Security Prompts
await createBenchmarkFile(
  'security',
  'enterprise-security-audit',
  'expert',
  'enterprise',
  'very-high',
  `Perform a comprehensive enterprise security audit of this Promethean Framework deployment:

\`\`\`typescript
// Configuration Management
export class ConfigService {
  private config: any = {};
  
  constructor() {
    // Load from environment variables
    this.config = {
      database: {
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD, // Plain text password
        ssl: process.env.DB_SSL === 'true'
      },
      api: {
        key: process.env.API_KEY, // API key in env var
        secret: process.env.API_SECRET
      },
      jwt: {
        secret: process.env.JWT_SECRET || 'default-secret' // Weak default
      }
    };
  }
  
  getConfig(): any {
    return this.config; // Returns sensitive data
  }
}

// Authentication Service
export class AuthService {
  async authenticateUser(username: string, password: string): Promise<User> {
    // SQL injection vulnerability
    const query = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`;
    const user = await this.db.query(query);
    
    if (user) {
      // Weak token generation
      const token = Buffer.from(\`\${username}:\${Date.now()}\`).toString('base64');
      return { ...user, token };
    }
    
    throw new Error('Authentication failed');
  }
  
  // No rate limiting
  async resetPassword(email: string): Promise<void> {
    const user = await this.db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    // Information disclosure
    if (user) {
      console.log('Password reset sent to:', email);
      // Send password reset link without expiration
    } else {
      console.log('Email not found'); // Reveals user existence
    }
  }
}

// File Upload Service
export class FileService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    // No file type validation
    const fileName = file.originalname;
    const filePath = path.join('/uploads', fileName);
    
    // Path traversal vulnerability
    fs.writeFileSync(filePath, file.buffer);
    
    // No virus scanning
    return \`/files/\${fileName}\`;
  }
  
  async serveFile(fileName: string): Promise<string> {
    // No access control
    const filePath = path.join('/uploads', fileName);
    return fs.readFileSync(filePath, 'utf8');
  }
}
\`\`\`

Identify all security vulnerabilities and design a comprehensive enterprise security framework including:
1. Secure configuration management
2. Robust authentication and authorization
3. Data encryption and protection
4. Network security and hardening
5. Monitoring and threat detection
6. Compliance and audit requirements
7. Security testing and validation
8. Incident response procedures`,
  `The agent should identify:
1. SQL injection vulnerabilities in authentication
2. Plain text password storage and transmission
3. Weak JWT secret and token generation
4. Missing input validation and sanitization
5. Path traversal vulnerabilities in file handling
6. No rate limiting or brute force protection
7. Missing security headers and CSP
8. Insecure direct object references
9. Missing encryption for sensitive data
10. No audit logging for security events
11. Missing security testing in CI/CD
12. No vulnerability scanning and management
13. Missing compliance frameworks (GDPR, SOC2, etc.)
14. No incident response and recovery procedures
15. Missing security training and awareness programs
16. No third-party security assessments
17. Missing disaster recovery and business continuity
18. No security metrics and KPI tracking`,
);

console.log('Additional benchmarks generated successfully!');
