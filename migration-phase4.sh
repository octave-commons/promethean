#!/bin/bash

# Pantheon Migration Script - Phase 4
# Documentation updates and final cleanup

set -e

echo "📚 Phase 4: Updating documentation and final cleanup"
echo "================================================="

# Phase 1: Update main README.md
echo "📝 Updating main README.md..."

if [[ -f "README.md" ]]; then
    echo "  📝 Updating main README.md with Pantheon branding"
    
    # Create backup
    cp README.md README.md.backup
    
    # Update agent references to pantheon
    sed -i.bak \
        -e "s/agent-\([a-zA-Z-]*\)/pantheon-\1/g" \
        -e "s/Agent \([a-zA-Z-]*\)/Pantheon \1/g" \
        -e "s/agent package/pantheon package/g" \
        -e "s/@promethean-os\/agent-\([^(]*\)/@promethean-os\/pantheon-\1/g" \
        -e "s/agents-workflow/pantheon-workflow/g" \
        README.md
    
    rm -f README.md.bak
    echo "  ✅ Updated main README.md"
fi

# Phase 2: Update agents README.md
echo ""
echo "📖 Updating agents documentation..."

if [[ -f "packages/agents/README.md" ]]; then
    echo "  📝 Creating new Pantheon packages README"
    
    # Create new pantheon packages README
    cat > packages/pantheon-packages.md << 'EOF'
# Pantheon Agent Management Framework

> _Comprehensive Pantheon ecosystem for autonomous AI systems_

A collection of packages that provide the foundation for building, coordinating, and managing autonomous AI agents in the Promethean OS ecosystem, now consolidated under the Pantheon branding.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  pantheon-ecs   │    │ pantheon-workflow │    │ pantheon-coord. │
│  (Voice/Real)   │    │ (Orchestration)  │    │ (Task Mgmt)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│pantheon-protocol│    │pantheon-os-protocol│    │ pantheon-state  │
│ (Transports)   │    │  (Messaging)    │    │(Event Sourcing)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │pantheon-generator│
                    │ (Code Gen)      │
                    └─────────────────┘
```

## 📦 Package Overview

### Core Packages

#### @promethean-os/pantheon-core
Core functional library for actors, behaviors, context, and orchestration.

#### @promethean-os/pantheon
Main framework with CLI, UI, and adapters.

### Migrated Agent Packages

#### @promethean-os/pantheon-ecs ⭐
Entity Component System for agent orchestration.
- **Status**: 🟢 Production-ready
- **Features**: Voice Activity Detection, Speech arbitration, Real-time voice processing
- **Use Case**: Multi-agent voice coordination and real-time systems

#### @promethean-os/pantheon-state 💾
Agent state management via event sourcing.
- **Status**: 🟢 Production-ready  
- **Features**: Event sourcing, Snapshot management, JWT authentication
- **Use Case**: Persistent agent lifecycle and state management

#### @promethean-os/pantheon-protocol 📡
Transport layer for agent messaging.
- **Status**: 🟡 Functional with multiple transports
- **Features**: AMQP transport, WebSocket transport, Message envelopes
- **Use Case**: Reliable message delivery between agents

#### @promethean-os/pantheon-workflow 🔄
Workflow orchestration with self-healing.
- **Status**: 🟡 Comprehensive but needs security fixes
- **Features**: Workflow definition, Self-healing mechanisms, Provider abstraction
- **Use Case**: Complex multi-agent workflows with automatic recovery

#### @promethean-os/pantheon-coordination
Agent instance management and task coordination.
- **Status**: 🔴 Type definitions only
- **Features**: Agent instance management, Task assignment algorithms
- **Use Case**: Coordinating multiple agents in complex workflows

#### @promethean-os/pantheon-generator 🔧
Automated agent instruction generation.
- **Language**: ClojureScript with Shadow-CLJS
- **Status**: 🟡 Functional with template system
- **Features**: Template-based agent generation, Cross-platform support
- **Use Case**: Programmatically creating new agent configurations

#### @promethean-os/pantheon-orchestrator
Agent orchestration system.
- **Status**: 🟡 Functional
- **Features**: Core orchestration logic
- **Use Case**: Managing agent lifecycle and coordination

#### @promethean-os/pantheon-ui
UI for agent management.
- **Status**: 🟡 Functional
- **Features**: Management interface components
- **Use Case**: Visual agent management and monitoring

### Adapter Packages

#### @promethean-os/pantheon-persistence
Persistence adapter wrapping @promethean-os/persistence for Pantheon context port.

#### @promethean-os/pantheon-mcp
MCP tool adapter for Pantheon Agent Management Framework.

#### @promethean-os/pantheon-llm-openai
OpenAI LLM adapter for Pantheon.

#### @promethean-os/pantheon-llm-claude
Claude LLM adapter for Pantheon.

#### @promethean-os/pantheon-llm-opencode
Opencode LLM adapter for Pantheon.

## 🚀 Quick Start

### Basic Pantheon Setup

```typescript
import { makeAgentStateManager } from '@promethean-os/pantheon-state';
import { AMQPTransport } from '@promethean-os/pantheon-protocol';
import { DefaultWorkflowHealingIntegration } from '@promethean-os/pantheon-workflow';

// Initialize state management
const stateManager = makeAgentStateManager({
  eventStore: new PostgresEventStore(db),
  snapshotStore: new PostgresSnapshotStore(db),
});

// Setup messaging
const transport = new AMQPTransport({
  url: 'amqp://localhost:5672',
  exchanges: ['pantheon.events', 'pantheon.commands'],
});

// Configure workflow healing
const healing = new DefaultWorkflowHealingIntegration();
await healing.initialize({
  enabled: true,
  automationLevel: 'automated',
  autoHealingEnabled: true,
});
```

### Voice-Enabled Pantheon (ECS)

```typescript
import { World, System } from '@promethean-os/pantheon-ecs';

// Create pantheon world
const world = new World();

// Add voice processing system
const voiceSystem = new VoiceSystem({
  vad: new VoiceActivityDetector(),
  arbiter: new SpeechArbiter(),
});

world.addSystem(voiceSystem);
world.start();
```

## 🔧 Installation

```bash
# Install core packages
pnpm add @promethean-os/pantheon-state @promethean-os/pantheon-protocol

# Install for voice/real-time systems
pnpm add @promethean-os/pantheon-ecs

# Install for workflow orchestration
pnpm add @promethean-os/pantheon-workflow

# Install for agent generation
pnpm add @promethean-os/pantheon-generator
```

## 🧪 Testing

```bash
# Test all pantheon packages
pnpm --filter "@promethean-os/pantheon-*" test

# Test specific package
pnpm --filter @promethean-os/pantheon-ecs test

# Type checking
pnpm --filter "@promethean-os/pantheon-*" typecheck

# Linting
pnpm --filter "@promethean-os/pantheon-*" lint
```

## 📄 License

All Pantheon packages are licensed under the GPL-3.0 License.
EOF
    
    echo "  ✅ Created pantheon-packages.md"
fi

# Phase 3: Update package.json scripts
echo ""
echo "🔧 Updating package.json scripts..."

if [[ -f "package.json" ]]; then
    echo "  📝 Adding pantheon-specific scripts to package.json"
    
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Add pantheon-specific scripts
    pkg.scripts = pkg.scripts || {};
    pkg.scripts['test:pantheon'] = 'pnpm --filter \"@promethean-os/pantheon-*\" test';
    pkg.scripts['build:pantheon'] = 'pnpm --filter \"@promethean-os/pantheon-*\" build';
    pkg.scripts['typecheck:pantheon'] = 'pnpm --filter \"@promethean-os/pantheon-*\" typecheck';
    pkg.scripts['lint:pantheon'] = 'pnpm --filter \"@promethean-os/pantheon-*\" lint';
    pkg.scripts['clean:pantheon'] = 'pnpm --filter \"@promethean-os/pantheon-*\" clean';
    
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    console.log('  ✅ Added pantheon scripts to package.json');
    "
fi

# Phase 4: Create migration guide
echo ""
echo "📚 Creating migration guide..."

cat > MIGRATION_GUIDE.md << 'EOF'
# Migration Guide: Agent Packages to Pantheon Packages

This guide helps you migrate from the old `@promethean-os/agent-*` packages to the new `@promethean-os/pantheon-*` packages.

## Package Mapping

| Old Package | New Package | Status |
|-------------|--------------|---------|
| `@promethean-os/agent-ecs` | `@promethean-os/pantheon-ecs` | ✅ Direct replacement |
| `@promethean-os/agent-state` | `@promethean-os/pantheon-state` | ✅ Direct replacement |
| `@promethean-os/agent-protocol` | `@promethean-os/pantheon-protocol` | ✅ Direct replacement |
| `@promethean-os/agents-workflow` | `@promethean-os/pantheon-workflow` | ✅ Direct replacement |
| `@promethean-os/agent-coordination` | `@promethean-os/pantheon-coordination` | ✅ Direct replacement |
| `@promethean-os/agent-generator` | `@promethean-os/pantheon-generator` | ✅ Direct replacement |
| `@promethean-os/agent-orchestrator` | `@promethean-os/pantheon-orchestrator` | ✅ Direct replacement |
| `@promethean-os/agent-management-ui` | `@promethean-os/pantheon-ui` | ✅ Direct replacement |
| `@promethean-os/agent-os-protocol` | `@promethean-os/pantheon-protocol` | ✅ Merged into pantheon-protocol |
| `@promethean-os/agent` | DEPRECATED | ⚠️ Use specific pantheon packages |

## Step-by-Step Migration

### 1. Update Dependencies

Update your `package.json`:

```json
{
  "dependencies": {
    "@promethean-os/pantheon-ecs": "workspace:*",
    "@promethean-os/pantheon-state": "workspace:*",
    "@promethean-os/pantheon-protocol": "workspace:*"
  }
}
```

### 2. Update Import Statements

Replace all imports in your source code:

```typescript
// Before
import { World } from '@promethean-os/agent-ecs';
import { makeAgentStateManager } from '@promethean-os/agent-state';
import { AMQPTransport } from '@promethean-os/agent-protocol';

// After
import { World } from '@promethean-os/pantheon-ecs';
import { makeAgentStateManager } from '@promethean-os/pantheon-state';
import { AMQPTransport } from '@promethean-os/pantheon-protocol';
```

### 3. Update Package References

Update any configuration files, documentation, or scripts:

```bash
# Before
pnpm --filter "@promethean-os/agent-*" test

# After
pnpm --filter "@promethean-os/pantheon-*" test
```

### 4. Install New Dependencies

```bash
pnpm install
```

### 5. Test Your Application

```bash
pnpm build
pnpm test
```

## Compatibility Shims

During the transition period, compatibility shims are provided:

- Old packages will re-export from new pantheon packages
- Deprecation warnings will be shown in development
- All existing functionality is preserved

## Breaking Changes

### Minimal Breaking Changes

- Package names have changed
- Import paths have changed
- No API changes within packages

### Removed Packages

- `@promethean-os/agent` - Minimal functionality, use specific pantheon packages instead

## Timeline

- **Phase 1** (Current): Compatibility shims available
- **Phase 2** (Next 3 months): Deprecation warnings added
- **Phase 3** (Next 6 months): Old packages removed

## Need Help?

- Check individual package documentation
- Review existing [GitHub issues](https://github.com/promethean-os/promethean/issues)
- Create new issues with detailed reproduction steps
EOF

    echo "  ✅ Created MIGRATION_GUIDE.md"
fi

# Phase 5: Update CI/CD files
echo ""
echo "🔄 Updating CI/CD configuration..."

# Update GitHub workflows if they exist
if [[ -d ".github/workflows" ]]; then
    echo "  🔄 Updating GitHub workflows..."
    
    find .github/workflows -name "*.yml" -o -name "*.yaml" | while read workflow; do
        if grep -q "agent-" "$workflow"; then
            echo "    📝 Updating $(basename $workflow)"
            sed -i.bak \
                -e "s/@promethean-os\/agent-\([^)]*\)/@promethean-os\/pantheon-\1/g" \
                -e "s/agent-\([a-zA-Z-]*\)/pantheon-\1/g" \
                "$workflow"
            rm -f "$workflow.bak"
        fi
    done
fi

# Phase 6: Clean up old agent packages (optional)
echo ""
echo "🧹 Final cleanup options..."
echo ""
echo "The following old agent packages can be removed after migration is complete:"
echo ""
for agent_pkg in agent-ecs agent-state agent-protocol agents-workflow agent-coordination agent-generator agent-orchestrator agent-management-ui agent-os-protocol agent; do
    if [[ -d "packages/agents/$agent_pkg" ]]; then
        echo "  📁 packages/agents/$agent_pkg"
    fi
done
echo ""
echo "⚠️  WARNING: Only remove these packages after:"
echo "   1. All dependent packages have been updated"
echo "   2. All tests pass with new pantheon packages"
echo "   3. Migration period (3-6 months) has passed"
echo ""
echo "To remove old packages:"
echo "  rm -rf packages/agents/$agent_pkg"

echo ""
echo "✅ Phase 4 completed: Documentation updated and migration guide created"
echo ""
echo "🎉 Migration Complete!"
echo ""
echo "📋 Summary of actions completed:"
echo "   ✅ Created new pantheon packages"
echo "   ✅ Migrated source code and updated imports"
echo "   ✅ Updated dependent packages"
echo "   ✅ Created compatibility shims"
echo "   ✅ Updated documentation"
echo "   ✅ Created migration guide"
echo ""
echo "🔄 Next steps:"
echo "   1. Run 'pnpm install' to update workspace"
echo "   2. Run 'pnpm build:pantheon' to build new packages"
echo "   3. Run 'pnpm test:pantheon' to verify functionality"
echo "   4. Fix any remaining issues"
echo "   5. Communicate migration to team"
echo ""
echo "📚 For detailed migration instructions, see MIGRATION_GUIDE.md"