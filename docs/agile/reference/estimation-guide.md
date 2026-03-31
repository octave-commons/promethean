# Story Point Estimation Guide

## 🎯 Overview

Use **story points** (not time) for task estimation. Story points measure relative complexity, effort, and uncertainty.

## 📏 Fibonacci Scale

```
1  - Trivial: Quick fix, minimal risk
2  - Small: Simple changes, low uncertainty
3  - Medium: Moderate complexity, some research
5  - Large: Multiple components, moderate uncertainty
8  - Extra Large: Complex, high uncertainty, may need breakdown
13 - Very Large: Epic-level, extensive planning
21 - Massive: Must be broken down
```

## 🧠 Estimation Factors

### Complexity

- **Technical challenges**: Algorithmic difficulty, new technologies
- **Integration complexity**: Multiple systems, APIs, or components
- **Code complexity**: Intricate logic, state management, data flow

### Effort

- **Lines of code**: Estimated implementation size
- **Files touched**: Number of components requiring changes
- **Test coverage**: Amount of testing needed

### Uncertainty

- **Research needed**: Unknown requirements or technologies
- **Dependencies**: External factors or blocked work
- **Risks**: Potential obstacles or failure points

### Dependencies

- **Cross-team coordination**: Work requiring multiple teams
- **System dependencies**: Reliance on other services/components
- **Prerequisite work**: Tasks that must be completed first

## 🔄 Estimation Process

### 1. Understand Requirements

- Ask clarifying questions about unclear requirements
- Identify acceptance criteria and success metrics
- Note any assumptions or constraints

### 2. Identify Components

- Break down the task into smaller pieces
- Identify all systems, files, or components affected
- Consider both frontend and backend implications

### 3. Assess Complexity

- Evaluate technical challenges and algorithms
- Consider integration requirements
- Assess code complexity and refactoring needs

### 4. Evaluate Uncertainty

- Identify research requirements
- Assess dependency risks
- Consider potential obstacles

### 5. Compare to Baseline

- Use recently completed tasks as reference
- Consider similar past work
- Adjust for differences in complexity

### 6. Choose Point Value

- Select the **lowest** point value that fits the task
- When in doubt, choose the higher value
- Consider breaking down tasks >8 points

## ✅ Best Practices

### DO ✅

- **Discuss tasks** before estimating with team members
- **Use recent tasks** as reference points for comparison
- **Break down tasks** >8 points into smaller pieces
- **Re-estimate** when requirements change significantly
- **Track velocity** for continuous improvement

### DON'T ❌

- **Convert points to hours** - they measure complexity, not time
- **Estimate under pressure** - take time to think through requirements
- **Ignore uncertainty/risk** - factor these into your estimates
- **Use same value** for similar tasks without considering differences
- **Forget to update** estimates when scope changes

## 📈 Key Concepts

### Velocity

- **Definition**: Average points completed per iteration/sprint
- **Usage**: Helps predict capacity for future iterations
- **Calculation**: Total points completed ÷ number of iterations

### Capacity

- **Definition**: Maximum points team can complete per iteration
- **Factors**: Team size, availability, historical velocity
- **Planning**: Use for realistic sprint commitments

### Sprint Planning

- **Historical velocity**: Use past performance for future planning
- **Buffer time**: Leave room for unexpected issues
- **Priority ordering**: Consider both value and effort

## 🎯 Estimation Examples

### 1-Point Tasks

- Fix simple UI bug with clear reproduction steps
- Add straightforward validation to existing form
- Update documentation for minor API change

### 3-Point Tasks

- Implement new feature with 2-3 components
- Add comprehensive test coverage to existing module
- Refactor medium-sized code section for performance

### 5-Point Tasks

- Integrate new third-party service
- Implement complex feature with multiple components
- Major refactoring of existing system

### 8+ Point Tasks

- Epic-level features requiring extensive planning
- Cross-system integration projects
- Tasks requiring significant research or prototyping

## 🔄 Continuous Improvement

### Review Estimates

- Compare actual vs. estimated complexity
- Identify patterns in over/under estimation
- Adjust estimation factors based on experience

### Team Calibration

- Regular estimation discussions to align understanding
- Review completed tasks for accuracy
- Adjust scale if needed (rare)

## 📚 Additional Resources

- [[velocity-tracking|velocity-guide.md]] - Measuring team performance
- [[task-breakdown|task-breakdown.md]] - Decomposing large tasks
- [[sprint-planning|sprint-planning.md]] - Iteration planning guide
