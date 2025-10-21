---
difficulty: expert
scale: enterprise
complexity: very-high
answer: |
  The agent should identify:
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
18. No security metrics and KPI tracking
---

Perform a comprehensive enterprise security audit of this Promethean Framework deployment:

```typescript
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
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    const user = await this.db.query(query);
    
    if (user) {
      // Weak token generation
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
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
    return `/files/${fileName}`;
  }
  
  async serveFile(fileName: string): Promise<string> {
    // No access control
    const filePath = path.join('/uploads', fileName);
    return fs.readFileSync(filePath, 'utf8');
  }
}
```

Identify all security vulnerabilities and design a comprehensive enterprise security framework including:
1. Secure configuration management
2. Robust authentication and authorization
3. Data encryption and protection
4. Network security and hardening
5. Monitoring and threat detection
6. Compliance and audit requirements
7. Security testing and validation
8. Incident response procedures