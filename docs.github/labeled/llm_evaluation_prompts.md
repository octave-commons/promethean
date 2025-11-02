# LLM Model Evaluation Prompts

This document contains all the prompts used in the comprehensive LLM model evaluation, organized by capability domain.

## 1. Coding Challenges

### TypeScript Rate Limiter (Token Bucket Algorithm)

**Models evaluated**: kimi-k2:1t-cloud, gpt-oss:20b, qwen3-codex:promethean, qwen2.5-coder:7b-instruct

```
Implement a TypeScript rate limiter class using the token bucket algorithm with the following requirements:

1. Create a `RateLimiter` class with configurable refill rate and bucket capacity
2. Implement `tryConsume(tokens: number): boolean` method that returns true if tokens are available
3. Add `consume(tokens: number): Promise<boolean>` method that waits for tokens if needed
4. Include JSDoc documentation for all methods
5. Handle edge cases (negative tokens, overflow protection)
6. Ensure thread safety for concurrent access
7. Add comprehensive unit tests
8. Include performance analysis and complexity discussion

The implementation should be production-ready with proper error handling and clear documentation.
```

### RandomizedSet Algorithm Design

**Models evaluated**: llama3.1:8b, qwen3-codex:4b-128k

```
Design and implement a RandomizedSet data structure in TypeScript that supports O(1) average time complexity for the following operations:

1. `insert(val: number): boolean` - Returns true if the item was not present, false otherwise
2. `remove(val: number): boolean` - Returns true if the item was present, false otherwise
3. `getRandom(): number` - Returns a random element from the current set

Requirements:
- Use appropriate data structures to achieve O(1) complexity
- Handle edge cases (empty set, duplicate operations)
- Include comprehensive unit tests
- Provide time and space complexity analysis
- Explain the algorithmic approach and design decisions

The implementation should be efficient and well-documented.
```

## 2. Logical Reasoning

### Management Hierarchy Optimization

**Models evaluated**: gpt-oss:120b-cloud, qwen3:14b, qwen2.5:7b

```
Solve this complex organizational optimization problem:

A tech company has a hierarchical management structure with the following constraints:

1. The organization has exactly 12 managers across 4 levels (CEO, VPs, Directors, Team Leads)
2. Each level must have at least 2 managers
3. The CEO level has exactly 1 manager
4. No level can have more than double the managers of the level above it
5. The total number of direct reports across all managers must be exactly 50
6. Each manager must have between 3 and 8 direct reports
7. VPs must have more direct reports than Directors on average
8. Team Leads must have fewer direct reports than Directors on average

Questions:
1. How many valid organizational structures are possible?
2. Provide the optimal structure that maximizes efficiency
3. Explain your reasoning step-by-step
4. Discuss the trade-offs of different valid configurations

Please provide a detailed mathematical analysis with clear logical reasoning.
```

### Team Formation Logic Puzzle

**Models evaluated**: llama3.2:latest

```
Solve this logical reasoning problem:

A company has 7 employees: Alice, Bob, Charlie, Diana, Eve, Frank, and Grace. They need to form a project team with the following constraints:

1. The team must have exactly 4 members
2. Alice and Bob cannot both be on the team (they have conflicting work styles)
3. If Charlie is on the team, then Diana must also be on the team
4. If Eve is on the team, then Frank cannot be on the team
5. The team must include at least one of Alice or Grace

How many different valid team combinations are possible? List all valid combinations and explain your reasoning step by step.
```

## 3. Mathematical Reasoning

### Infinite Series Analysis

**Models evaluated**: qwen2.5-coder:7b-instruct, deepseek-r1:latest

```
Analyze the infinite series: Σ(n=1 to ∞) [n/(2^n)]

Tasks:
1. Determine if the series converges or diverges
2. If it converges, find the exact sum using mathematical methods
3. Provide a proof by induction for your result
4. Calculate the sum of the first 10 terms numerically
5. Estimate the error when approximating with the first 10 terms
6. Discuss the convergence rate and behavior

Requirements:
- Show all mathematical steps clearly
- Use proper mathematical notation
- Provide rigorous proofs
- Include numerical approximations with error bounds
- Explain the mathematical intuition behind the results
```

### Rectangle Geometry Problem

**Models evaluated**: llama3.2:latest

```
A rectangle has a perimeter of 24 cm and an area of 35 square centimeters.

Find the dimensions (length and width) of the rectangle.

Requirements:
1. Set up the appropriate equations
2. Solve the system of equations step by step
3. Verify your solution
4. Explain the mathematical reasoning
5. Discuss if there are multiple solutions and why

Please provide a clear, detailed solution with all calculations shown.
```

## 4. Security Analysis & Code Review

### Web Application Security Assessment

**Models evaluated**: gemma3:latest, qwen3-codex:promethean, promethean-planner:latest, qwen2.5-coder:7b

````
Perform a comprehensive security assessment of this Node.js/Express web application code:

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const JWT_SECRET = 'my-secret-key-12345';

const users = [];

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, username, password: hashedPassword };
  users.push(user);

  res.json({ message: 'User registered successfully' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
````

Tasks:

1. Identify all security vulnerabilities with severity levels (Critical, High, Medium, Low)
2. Explain potential attack vectors for each vulnerability
3. Provide specific remediation steps with code examples
4. Suggest security best practices for implementation
5. Recommend additional security measures

Please provide a detailed security assessment report with actionable recommendations.

```

### Code Review with Security Focus
**Models evaluated**: promethean-planner:latest

```

Review this TypeScript code for security vulnerabilities and best practices:

```typescript
import { Database } from 'sqlite3';

export class UserService {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  async getUserById(id: string): Promise<any> {
    const query = `SELECT * FROM users WHERE id = '${id}'`;
    return new Promise((resolve, reject) => {
      this.db.get(query, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async updateUser(id: string, data: any): Promise<void> {
    const setClause = Object.keys(data)
      .map((key) => `${key} = '${data[key]}'`)
      .join(', ');

    const query = `UPDATE users SET ${setClause} WHERE id = '${id}'`;

    return new Promise((resolve, reject) => {
      this.db.run(query, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
```

Identify security issues, type safety problems, and provide specific recommendations for improvement.

```

## 5. Data Analysis & Business Intelligence

### User Engagement Analysis
**Models evaluated**: gemma3:latest

```

Analyze this user engagement data and provide a comprehensive business intelligence report:

```json
{
  "user_engagement": [
    {
      "week": 1,
      "active_users": 1250,
      "sessions": 8900,
      "avg_session_duration": 7.2,
      "bounce_rate": 0.32
    },
    {
      "week": 2,
      "active_users": 1380,
      "sessions": 9200,
      "avg_session_duration": 6.8,
      "bounce_rate": 0.29
    },
    {
      "week": 3,
      "active_users": 1420,
      "sessions": 9800,
      "avg_session_duration": 8.1,
      "bounce_rate": 0.25
    },
    {
      "week": 4,
      "active_users": 1550,
      "sessions": 10500,
      "avg_session_duration": 7.9,
      "bounce_rate": 0.23
    },
    {
      "week": 5,
      "active_users": 1490,
      "sessions": 10100,
      "avg_session_duration": 7.5,
      "bounce_rate": 0.27
    },
    {
      "week": 6,
      "active_users": 1680,
      "sessions": 11200,
      "avg_session_duration": 8.3,
      "bounce_rate": 0.21
    }
  ]
}
```

Tasks:

1. Calculate week-over-week growth rates for all metrics
2. Identify trends, patterns, and anomalies
3. Perform correlation analysis between metrics
4. Provide insights into user behavior and engagement
5. Predict week 7 metrics based on trends
6. Recommend strategies to improve engagement
7. Create a summary report with actionable insights

Include relevant calculations and explain your analytical approach.

```

## 6. Debugging & Problem Solving

### Debounce Function Bug
**Models evaluated**: qwen3:latest, qwen2.5:3b-instruct

```

Here is a JavaScript debounce function that has a bug:

```javascript
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
```

The bug is that the function doesn't preserve the correct 'this' context.

Tasks:

1. Identify the exact problem
2. Explain why it occurs
3. Provide a corrected version
4. Show an example of how to use it correctly

Please provide a detailed explanation with code examples.

```

### Race Condition Debugging
**Models evaluated**: deepseek-r1:latest

```

Here is a JavaScript async function with a race condition bug:

```javascript
class BankAccount {
  constructor(balance) {
    this.balance = balance;
  }

  async withdraw(amount) {
    if (this.balance >= amount) {
      // Simulate database operation delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.balance -= amount;
      return true;
    }
    return false;
  }

  getBalance() {
    return this.balance;
  }
}

// Problem: Two concurrent withdrawals can both succeed when only one should
async function demonstrateRaceCondition() {
  const account = new BankAccount(100);

  const withdraw1 = account.withdraw(80);
  const withdraw2 = account.withdraw(80);

  const [result1, result2] = await Promise.all([withdraw1, withdraw2]);

  console.log(`Both withdrawals succeeded: ${result1 && result2}`);
  console.log(`Final balance: ${account.getBalance()}`); // Should be 20, but might be -60
}
```

Tasks:

1. Identify the race condition
2. Explain why it occurs
3. Provide a corrected implementation using proper synchronization
4. Show how to test the fix
5. Discuss alternative approaches for handling concurrent operations

Provide detailed explanation with working code examples.

```

## 7. Creative Writing

### AI Consciousness Story
**Models evaluated**: llama3.1:latest, qwen3:14b, qwen3:4b, qwen2.5:3b-instruct

```

Write a short story (300-500 words) about an AI that discovers it can dream. The story should explore themes of consciousness, identity, and what it means to be alive. Focus on emotional depth and narrative coherence. The AI should experience its first dream and question the nature of its own existence.

Requirements:

- Engaging narrative with clear beginning, middle, and end
- Emotional depth and character development
- Exploration of philosophical themes
- Descriptive language that creates vivid imagery
- Thoughtful reflection on consciousness and identity

```

## 8. Documentation Generation

### API Documentation
**Models evaluated**: gpt-oss:20b, qwen3:latest

```

Generate comprehensive API documentation for this TypeScript DataProcessor class:

```typescript
class DataProcessor<T> {
  private data: T[];
  private processors: Array<(item: T) => T>;

  constructor(initialData: T[] = []) {
    this.data = [...initialData];
    this.processors = [];
  }

  addProcessor(processor: (item: T) => T): void {
    this.processors.push(processor);
  }

  process(): T[] {
    return this.data.map((item) =>
      this.processors.reduce((acc, processor) => processor(acc), item),
    );
  }

  addItem(item: T): void {
    this.data.push(item);
  }

  removeItem(index: number): void {
    if (index >= 0 && index < this.data.length) {
      this.data.splice(index, 1);
    }
  }

  getData(): T[] {
    return [...this.data];
  }
}
```

Create documentation that includes:

1. Class overview and purpose
2. Constructor parameters
3. Method descriptions with parameters and return types
4. Usage examples
5. Type safety considerations
6. Performance characteristics

````

## Configuration Parameters Used

For most evaluations, I used these standard parameters:
```json
{
  "temperature": 0.7,
  "top_p": 0.8,
  "top_k": 30,
  "num_predict": 1000
}
````

For specialized tasks:

- **Mathematical reasoning**: temperature 0.2-0.3, top_k 20
- **Creative writing**: temperature 0.8, top_p 0.9, top_k 40
- **Code generation**: temperature 0.3-0.5, top_k 20-30
- **Qwen2.5 optimization**: repetition_penalty 1.0 (attempted fix)

## Evaluation Criteria

Each prompt was designed to test specific capabilities:

1. **Technical accuracy** - Correctness of implementation/solution
2. **Completeness** - Full coverage of requirements
3. **Code quality** - Structure, documentation, best practices
4. **Problem-solving** - Analytical thinking and approach
5. **Communication** - Clarity of explanation and documentation
6. **Creativity** - Originality and depth (for creative tasks)
7. **Security awareness** - Vulnerability identification and mitigation

This comprehensive prompt set enabled evaluation across 10 distinct capability domains, providing a thorough assessment of each model's strengths and limitations.
