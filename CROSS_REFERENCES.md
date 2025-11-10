# Promethean Cross-Reference Documentation

> _"Stealing fire from the gods to grant man the gift of knowledge and wisdom."_
> Using **cloud LLMs** to make **local LLMs** smarter, specialized, and autonomous.

## 🔗 Repository Cross-References

This document provides comprehensive cross-references to all related repositories in the development ecosystem, enabling agents to navigate between related tools and dependencies seamlessly.

### 🏗️ Development Infrastructure Dependencies

#### **Agent Development & Orchestration**
- **[agent-shell](https://github.com/riatzukiza/agent-shell)** - Emacs-based agent shell for ACP (Agent Client Protocol)
  - [AGENTS.md](https://github.com/riatzukiza/agent-shell/blob/main/AGENTS.md)
  - [README.md](https://github.com/riatzukiza/agent-shell/blob/main/README.org)
  - **Integration**: Use agent-shell for interactive agent development and ACP protocol testing

- **[clojure-mcp](https://github.com/bhauman/clojure-mcp)** - MCP server for Clojure REPL-driven development
  - [AGENTS.md](https://github.com/bhauman/clojure-mcp/blob/main/AGENTS.md)
  - [README.md](https://github.com/bhauman/clojure-mcp/blob/main/README.md)
  - **Integration**: Leverage Clojure REPL patterns for Promethean agent development

#### **Authentication & Security**
- **[opencode-openai-codex-auth](https://github.com/numman-ali/opencode-openai-codex-auth)** - OpenAI Codex OAuth authentication plugin
  - [AGENTS.md](https://github.com/numman-ali/opencode-openai-codex-auth/blob/main/AGENTS.md)
  - [README.md](https://github.com/numman-ali/opencode-openai-codex-auth/blob/main/README.md)
  - **Integration**: Authentication patterns for cloud LLM integration

### 🔧 Tooling & SDK Dependencies

#### **TypeScript SDK Integration**
- **[moofone/codex-ts-sdk](https://github.com/moofone/codex-ts-sdk)** - TypeScript SDK for OpenAI Codex with cloud tasks
  - [AGENTS.md](https://github.com/moofone/codex-ts-sdk/blob/main/AGENTS.md)
  - [README.md](https://github.com/moofone/codex-ts-sdk/blob/main/README.md)
  - **Integration**: Use for TypeScript-based cloud task management and Codex integration

#### **Rust-Based Runtime**
- **[openai/codex](https://github.com/openai/codex)** - Rust-based Codex CLI and runtime
  - [AGENTS.md](https://github.com/openai/codex/blob/main/AGENTS.md)
  - [README.md](https://github.com/openai/codex/blob/main/README.md)
  - **Integration**: Low-level runtime integration for performance-critical operations

### 🌐 Web & Frontend Integration

#### **OpenCode Development**
- **[stt](https://github.com/riatzukiza/devel/tree/main/stt)** - Multiple opencode development branches and experiments
  - [AGENTS.md](https://github.com/riatzukiza/devel/blob/main/stt/AGENTS.md)
  - **Integration**: Web-based agent interfaces and development tools

- **[opencode-hub](https://github.com/riatzukiza/devel/tree/main/opencode-hub)** - Centralized opencode coordination and distribution
  - [AGENTS.md](https://github.com/riatzukiza/devel/blob/main/opencode-hub/AGENTS.md)
  - [README.md](https://github.com/riatzukiza/devel/blob/main/opencode-hub/README.md)
  - **Integration**: Package management and distribution for Promethean tools

#### **Full-Stack Applications**
- **[riatzukiza/openhax](https://github.com/riatzukiza/openhax)** - Full-stack application with Reactant + Fastify
  - [AGENTS.md](https://github.com/riatzukiza/openhax/blob/main/AGENTS.md)
  - **Integration**: Full-stack patterns for agent-based applications

### ⚙️ Configuration & Environment

#### **System Configuration**
- **[dotfiles](https://github.com/riatzukiza/devel/tree/main/dotfiles)** - System configuration and environment setup
  - [AGENTS.md](https://github.com/riatzukiza/devel/blob/main/dotfiles/.config/opencode/AGENTS.md)
  - **Integration**: Environment setup for Promethean development workflows

## 🔄 Integration Patterns

### **Agent Development Workflow**
1. **Prototype**: Use [agent-shell](https://github.com/riatzukiza/agent-shell) for rapid agent prototyping
2. **Authenticate**: Integrate [opencode-openai-codex-auth](https://github.com/numman-ali/opencode-openai-codex-auth) for cloud LLM access
3. **Scale**: Deploy with [moofone/codex-ts-sdk](https://github.com/moofone/codex-ts-sdk) for production TypeScript environments
4. **Optimize**: Use [openai/codex](https://github.com/openai/codex) for performance-critical Rust components

### **REPL-Driven Development**
- Combine [clojure-mcp](https://github.com/bhauman/clojure-mcp) patterns with Promethean agent orchestration
- Leverage interactive development for agent behavior refinement

### **Web Integration**
- Use [stt](https://github.com/riatzukiza/devel/tree/main/stt) for web-based agent interfaces
- Distribute through [opencode-hub](https://github.com/riatzukiza/devel/tree/main/opencode-hub)
- Build full applications with [riatzukiza/openhax](https://github.com/riatzukiza/openhax) patterns

## 📋 Quick Reference Commands

### **Cross-Repository Development**
```bash
# Agent development with agent-shell
cd ../agent-shell && emacs agent-shell.el

# Clojure MCP integration
cd ../clojure-mcp && pnpm install && pnpm test

# TypeScript SDK development
cd ../moofone/codex-ts-sdk && pnpm build

# OpenCode development
cd ../stt/opencode && bun dev

# Full-stack application patterns
cd ../riatzukiza/openhax && pnpm install
```

### **Authentication Setup**
```bash
# OpenAI Codex Auth
cd ../opencode-openai-codex-auth
pnpm install && pnpm build
```

## 🎯 Decision Trees for Agents

### **Choosing the Right Tool**
- **Need interactive agent development?** → [agent-shell](https://github.com/riatzukiza/agent-shell)
- **Need Clojure REPL integration?** → [clojure-mcp](https://github.com/bhauman/clojure-mcp)
- **Need TypeScript cloud tasks?** → [moofone/codex-ts-sdk](https://github.com/moofone/codex-ts-sdk)
- **Need Rust performance?** → [openai/codex](https://github.com/openai/codex)
- **Need web interfaces?** → [stt](https://github.com/riatzukiza/devel/tree/main/stt)
- **Need package distribution?** → [opencode-hub](https://github.com/riatzukiza/devel/tree/main/opencode-hub)

### **Integration Complexity**
- **Simple**: Start with [agent-shell](https://github.com/riatzukiza/agent-shell) + [clojure-mcp](https://github.com/bhauman/clojure-mcp)
- **Medium**: Add [moofone/codex-ts-sdk](https://github.com/moofone/codex-ts-sdk) for cloud integration
- **Complex**: Full stack with [stt](https://github.com/riatzukiza/devel/tree/main/stt) + [opencode-hub](https://github.com/riatzukiza/devel/tree/main/opencode-hub) + [riatzukiza/openhax](https://github.com/riatzukiza/openhax)

## 📚 Additional Documentation

- **[Workspace Documentation](https://github.com/riatzukiza/devel/blob/main/AGENTS.md)** - Main workspace coordination
- **[Repository Index](https://github.com/riatzukiza/devel/blob/main/REPOSITORY_INDEX.md)** - Complete repository overview
- **[Git Submodules Documentation](https://github.com/riatzukiza/devel/blob/main/docs/reports/research/git-submodules-documentation.md)** - Technical submodule details

---

## ⚖️ License

All packages use:
```
"license": "GPL-3.0-only"
```