# Instruction File Patterns Analysis

## Executive Summary

This document analyzes existing instruction file patterns across the Promethean project to identify common structures, variable content, and template opportunities. The analysis covers AGENTS.md, CLAUDE.md, CRUSH.md, and various agent configuration files to establish a foundation for the Agent Instruction Generator system.

## File Structure Analysis

### 1. AGENTS.md - Navigation Hub Pattern

**Structure Type**: Hierarchical navigation with cross-references
**Purpose**: Central navigation hub for agents and workflows
**Length**: 147 lines

#### Key Sections:

- **Quick Start** - Essential links with `[[wikilink]]` syntax
- **Core Workflows** - Categorized by function (Task Management, Development, BuildFix & Benchmarking)
- **Estimation & Planning** - Project management resources
- **Repository Structure** - Documentation and file organization
- **Tools & Commands** - Essential and development tools
- **Maintenance & Cleanup** - Operational procedures
- **Reference Materials** - Architecture, security, performance
- **Emergency Procedures** - Crisis response and recovery
- **Reports & Analytics** - Performance and metrics
- **Agent-Specific Guides** - Role-based and tool-based guides
- **Quick Reference** - Common tasks and troubleshooting

#### Pattern Characteristics:

- **Static Content**: Section headers and organizational structure
- **Dynamic Content**: File paths, document references, tool names
- **Cross-References**: Extensive use of `[[wikilink]]` syntax
- **Hierarchical**: Multi-level organization with consistent categorization

### 2. CLAUDE.md - Comprehensive Development Guide

**Structure Type**: Linear development guide with code examples
**Purpose**: Claude Code specific instructions and environment setup
**Length**: 432 lines

#### Key Sections:

- **Development Environment** - Setup instructions and commands
- **Kanban Task Management** - Workflow integration with detailed commands
- **MCP (Model Context Protocol)** - Tool integration and API examples
- **Build System & Commands** - Core development commands
- **Architecture Overview** - System design and technology stack
- **Package Development Workflow** - Development conventions
- **Environment Configuration** - Setup and variables
- **Documentation** - Obsidian integration
- **Build Requirements** - Version and tool specifications
- **Common Patterns** - Development best practices

#### Pattern Characteristics:

- **Mixed Content**: Prose, code blocks, command examples
- **Environment-Specific**: Version numbers, paths, configurations
- **Interactive Elements**: JavaScript examples, command-line instructions
- **Progressive Disclosure**: From basic setup to advanced patterns

### 3. CRUSH.md - Quick Reference Pattern

**Structure Type**: Minimal quick reference
**Purpose**: Development environment fast reference
**Length**: 33 lines

#### Key Sections:

- **Commands** - Essential development commands
- **Code Style** - Development conventions and practices
- **Kanban** - Task management commands

#### Pattern Characteristics:

- **Concise**: Focused on essential information only
- **Command-Centric**: Emphasis on executable commands
- **Convention-Driven**: Style guidelines and best practices

### 4. Agent Configuration Files - Structured Metadata Pattern

**Structure Type**: YAML frontmatter + markdown content
**Purpose**: Individual agent configuration and behavior definition
**Variable Length**: 50-150 lines typical

#### Frontmatter Pattern:

```yaml
---
name: <agent-name>
description: <usage-description-with-examples>
model: <ai-model>
color: <visual-identifier>
tools: [<tool-list>]
security_category: <classification>
access_level: <permission-level>
audit_required: <boolean>
mode: <execution-mode>
---
```

#### Content Pattern:

- **Role Definition** - Expertise and responsibilities
- **Core Responsibilities** - Structured capability breakdown
- **Process Framework** - Decision-making and workflow steps
- **Tool Usage** - Specific tool application guidelines
- **Boundaries** - Scope limitations and delegation rules
- **Output Standards** - Format and quality requirements

## Common Patterns Identified

### 1. Hierarchical Organization

- **Consistent Section Headers**: `## 🎯 Objective`, `## 📋 Description`, `## ✅ Acceptance Criteria`
- **Emoji Usage**: Standardized emoji for section types (🚀, 📋, ✅, 🔧, 🏗️, 📊, 🔗, ⚠️, 📈)
- **Logical Flow**: Introduction → Requirements → Implementation → Deliverables → Dependencies

### 2. Cross-Reference Systems

- **Wikilink Syntax**: `[[document-name|display-text]]` format
- **Reference Sections**: Dedicated reference and further reading sections
- **Dependency Mapping**: Clear relationships between documents

### 3. Code Integration Patterns

- **Command Blocks**: Standardized bash command examples
- **Code Examples**: Language-specific implementation patterns
- **Configuration Snippets**: JSON, YAML, JavaScript examples

### 4. Metadata Patterns

- **Frontmatter**: YAML configuration with consistent fields
- **Categorization**: Labels, priorities, status tracking
- **Timestamps**: Creation and modification dates

### 5. Template-Ready Sections

#### Static Content (Template Structure):

- Section headers and organization
- Process frameworks and methodologies
- Standard operating procedures
- Quality assurance guidelines

#### Dynamic Content (Variable Substitution):

- File paths and document references
- Tool names and command examples
- Version numbers and configuration values
- Agent names and role descriptions
- Project-specific information

#### Conditional Content:

- Environment-specific instructions
- Role-based access patterns
- Feature-dependent configurations
- Platform-specific guidelines

## Variable Content Mapping

### Project Variables

- `{{PROJECT_NAME}}` - "Promethean"
- `{{PROJECT_ROOT}}` - "/home/err/devel/promethean"
- `{{PACKAGE_MANAGER}}` - "pnpm"
- `{{NODE_VERSION}}` - "20.19.4"

### Documentation Variables

- `{{DOCS_ROOT}}` - "docs/"
- `{{TASKS_DIR}}` - "docs/agile/tasks/"
- `{{BOARDS_DIR}}` - "docs/agile/boards/"
- `{{REFERENCE_DIR}}` - "docs/reference/"

### Tool Variables

- `{{KANBAN_TOOL}}` - "@promethean/kanban"
- `{{BUILD_TOOL}}` - "Nx"
- `{{TEST_RUNNER}}` - "AVA"
- `{{LINTER}}` - "ESLint"

### Agent Variables

- `{{AGENT_NAME}}` - Variable per agent
- `{{AGENT_ROLE}}` - Specialist role description
- `{{AGENT_TOOLS}}` - Tool list per agent
- `{{AGENT_MODEL}}` - AI model assignment

### Command Variables

- `{{INSTALL_CMD}}` - "pnpm install"
- `{{BUILD_CMD}}` - "pnpm build"
- `{{TEST_CMD}}` - "pnpm test:all"
- `{{LINT_CMD}}` - "pnpm lint"

## Content Categorization

### Static Content (Template Foundation)

1. **Structural Elements**

   - Section headers and organization
   - Navigation patterns
   - Standard operating procedures

2. **Process Frameworks**

   - Decision-making methodologies
   - Quality assurance processes
   - Workflow definitions

3. **Style Guidelines**
   - Formatting conventions
   - Writing standards
   - Documentation practices

### Dynamic Content (Variable Substitution)

1. **Configuration Values**

   - Version numbers
   - File paths
   - Tool names

2. **Project-Specific Information**

   - Repository structure
   - Build commands
   - Environment settings

3. **Agent-Specific Content**
   - Role descriptions
   - Tool assignments
   - Capability definitions

### Conditional Content (Context-Dependent)

1. **Environment Variations**

   - Development vs production
   - Platform-specific instructions
   - Feature flags

2. **Role-Based Content**
   - Access level restrictions
   - Specialized tool access
   - Responsibility boundaries

## Template Structure Recommendations

### 1. Modular Template System

- **Base Templates**: Common structure and organization
- **Section Templates**: Reusable content blocks
- **Variable Templates**: Dynamic content insertion

### 2. Variable Naming Conventions

- **UPPER_SNAKE_CASE** for configuration variables
- **Descriptive names** with clear purpose
- **Hierarchical naming** for nested content

### 3. Conditional Rendering

- **Environment flags** for context-dependent content
- **Role-based conditions** for agent-specific sections
- **Feature toggles** for optional content

### 4. Cross-Reference Management

- **Automatic link generation** for document references
- **Dependency tracking** for related content
- **Validation** for reference integrity

## Implementation Considerations

### 1. Template Syntax

- **Mustache-style**: `{{variable}}` for simple substitution
- **Conditional blocks**: `{{#condition}}...{{/condition}}`
- **Iteration**: `{{#array}}...{{/array}}` for lists

### 2. Data Sources

- **Configuration files**: JSON/YAML project configuration
- **Environment variables**: Runtime context
- **File system analysis**: Dynamic content discovery

### 3. Validation Rules

- **Required variables**: Essential content validation
- **Reference integrity**: Link and dependency checking
- **Format compliance**: Style and structure validation

## Next Steps

This analysis provides the foundation for designing the Agent Instruction Generator template system. The next phase should focus on:

1. **Template Engine Selection**: Choose appropriate templating technology
2. **Variable Schema Design**: Define comprehensive variable taxonomy
3. **Template Creation**: Develop reusable template components
4. **Generation Pipeline**: Build automated generation workflow
5. **Validation Framework**: Implement quality assurance checks

The patterns identified here will inform the template system design, ensuring it can handle the full spectrum of instruction file types while maintaining consistency and reducing manual maintenance overhead.
