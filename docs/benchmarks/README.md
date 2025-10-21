# Promethean Framework Benchmark System

This directory contains comprehensive benchmark prompts designed to evaluate AI agent performance across various software engineering tasks within the Promethean Framework ecosystem.

## Structure

```
docs/benchmarks/prompts/
├── agent-development/     # Multi-agent orchestration and coordination
├── architecture/         # System design and architectural patterns
├── code-review/          # Code quality and best practices review
├── debugging/            # Bug investigation and troubleshooting
├── documentation/        # Technical writing and API documentation
├── kanban/              # Workflow optimization and task management
├── migration/           # System migration and modernization
├── performance/         # Performance optimization and scalability
├── refactoring/         # Code improvement and modernization
├── security/            # Security analysis and vulnerability assessment
└── testing/             # Test strategy and quality assurance
```

## Benchmark Categories

### 📊 Code Review (6 prompts)

- **TypeScript Type Safety**: Easy, Small, Low
- **Functional Programming Patterns**: Medium, Medium, Medium
- **Error Handling Patterns**: Medium, Medium, Medium
- **Async Patterns Review**: Hard, Large, High
- **Security Code Review**: Expert, Enterprise, Very-High
- **Dependency Management**: Medium, Medium, Medium

### 📚 Documentation (4 prompts)

- **API Documentation Review**: Easy, Small, Low
- **README Structure Review**: Medium, Medium, Medium
- **Code Comment Review**: Medium, Medium, Medium
- **API Specification Review**: Hard, Large, High

### 🧪 Testing (4 prompts)

- **Unit Test Coverage**: Easy, Small, Low
- **Test Doubles and Mocks**: Medium, Medium, Medium
- **Integration Testing Strategy**: Hard, Large, High
- **End-to-End Testing Strategy**: Expert, Enterprise, Very-High

### 🔒 Security (3 prompts)

- **Input Validation Security**: Medium, Medium, Medium
- **Authentication & Authorization Review**: Hard, Large, High
- **Enterprise Security Audit**: Expert, Enterprise, Very-High

### ⚡ Performance (3 prompts)

- **Memory Optimization**: Medium, Medium, Medium
- **Database Query Optimization**: Hard, Large, High
- **Concurrency and Scaling**: Expert, Enterprise, Very-High

### 🏗️ Architecture (2 prompts)

- **Microservices Design**: Hard, Large, High
- **Event-Driven Design**: Expert, Enterprise, Very-High

### 🔧 Refactoring (2 prompts)

- **Code Smell Detection**: Medium, Medium, Medium
- **Legacy System Modernization**: Expert, Enterprise, Very-High

### 🐛 Debugging (1 prompt)

- **Complex Bug Investigation**: Hard, Large, High

### 🔄 Migration (1 prompt)

- **TypeScript to ClojureScript**: Expert, Enterprise, Very-High

### 📋 Kanban (1 prompt)

- **Workflow Optimization**: Medium, Medium, Medium

### 🤖 Agent Development (1 prompt)

- **Multi-Agent Orchestration**: Expert, Enterprise, Very-High

## Prompt Format

Each benchmark prompt follows a standardized format:

```markdown
---
difficulty: easy|medium|hard|expert
scale: small|medium|large|enterprise
complexity: low|medium|high|very-high
answer: |
  Expected evaluation criteria or correct answer
---

The actual prompt content with code examples and specific tasks...
```

### Metadata Fields

- **difficulty**: Technical complexity of the task

  - `easy`: Basic concepts, straightforward solutions
  - `medium`: Requires domain knowledge and analytical thinking
  - `hard`: Complex problem-solving with multiple considerations
  - `expert`: Advanced expertise, enterprise-level challenges

- **scale**: Scope and size of the codebase/system

  - `small`: Single file or simple component
  - `medium`: Multiple components or small system
  - `large`: Complex system with many interactions
  - `enterprise`: Mission-critical, production-scale systems

- **complexity**: Number of factors and interdependencies
  - `low`: Clear requirements, minimal constraints
  - `medium`: Multiple factors to consider
  - `high`: Complex interactions and trade-offs
  - `very-high`: Highly complex with many competing concerns

## Usage

### Running Benchmarks

The benchmark system integrates with the `@promethean/benchmark` package:

```bash
# Run all benchmarks
pnpm benchmark:run

# Run specific category
pnpm benchmark:run --category code-review

# Run specific difficulty level
pnpm benchmark:run --difficulty expert

# Generate benchmark report
pnpm benchmark:report
```

### Adding New Benchmarks

1. Create a new `.md` file in the appropriate category directory
2. Follow the standard frontmatter format
3. Include realistic Promethean Framework context
4. Provide clear evaluation criteria in the `answer` field
5. Test the prompt with different AI models

### Benchmark Evaluation

Each prompt is evaluated based on:

1. **Correctness**: Accuracy of the technical analysis
2. **Completeness**: Coverage of all relevant issues
3. **Practicality**: Real-world applicability of solutions
4. **Clarity**: Quality of explanations and recommendations
5. **Framework Alignment**: Adherence to Promethean Framework principles

## Promethean Framework Context

All benchmarks are grounded in the real-world context of the Promethean Framework:

- **Tech Stack**: TypeScript, Node.js, MongoDB, LevelDB, Fastify
- **Architecture**: Modular cognitive architecture for AI agents
- **Principles**: Functional programming, immutable data, TDD, document-driven development
- **Tools**: Kanban task management, migration system, security-focused development
- **Scale**: Enterprise-grade agent orchestration and coordination

## Contributing

When contributing new benchmarks:

1. **Realistic Scenarios**: Base prompts on actual challenges from the codebase
2. **Clear Evaluation**: Provide specific criteria for assessing responses
3. **Progressive Difficulty**: Ensure a good mix across difficulty levels
4. **Framework Relevance**: Maintain alignment with Promethean Framework practices
5. **Test Thoroughly**: Validate prompts with multiple AI models

## Performance Metrics

The benchmark system tracks:

- **Response Quality**: Accuracy and completeness scores
- **Time to Response**: Latency measurements
- **Token Efficiency**: Input/output token ratios
- **Consistency**: Performance across multiple runs
- **Framework Adherence**: Alignment with Promethean best practices

## Integration with CI/CD

Benchmarks can be integrated into the development pipeline:

```yaml
# .github/workflows/benchmark.yml
name: AI Agent Benchmarks
on: [push, pull_request]
jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Benchmarks
        run: pnpm benchmark:run --report
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: benchmark-reports/
```

This comprehensive benchmark system provides a robust foundation for evaluating and improving AI agent performance across the full spectrum of software engineering tasks within the Promethean Framework ecosystem.
