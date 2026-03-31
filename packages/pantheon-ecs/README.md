# @promethean-os/pantheon-ecs

Entity Component System for Pantheon framework.

## Features

- **Entity Management**: Create and manage entities
- **Component System**: Add/remove components from entities
- **System Management**: Update systems with entities and components
- **Type Safety**: Full TypeScript support
- **Performance**: Efficient data structures and updates

## Installation

```bash
pnpm add @promethean-os/pantheon-ecs
```

## Usage

```typescript
import {
  EntityComponentSystem,
  createEntity,
  createComponent,
  createSystem,
  Entity,
  Component,
  System,
} from '@promethean-os/pantheon-ecs';

// Create ECS instance
const ecs = new EntityComponentSystem();

// Create entity
const player = createEntity('player-1', 'player');
ecs.addEntity(player);

// Add component to entity
const position = createComponent('pos-1', 'position', player.id);
ecs.addComponent(position);

// Get component
const playerPosition = ecs.getComponent(player.id, 'position');

// Create and add system
const movementSystem = createSystem('movement', [], []);
ecs.addSystem(movementSystem);

// Update all systems
ecs.update(16.67); // delta time in milliseconds
```

## API

### EntityComponentSystem

Main ECS class for managing entities, components, and systems.

**Methods:**

- `addEntity(entity)`: Add an entity to the system
- `removeEntity(entityId)`: Remove an entity by ID
- `addComponent(component)`: Add a component to an entity
- `removeComponent(entityId, componentType)`: Remove a component from an entity
- `getComponent(entityId, componentType)`: Get a component from an entity
- `getEntity(entityId)`: Get an entity by ID
- `addSystem(system)`: Add a system to be updated
- `update(deltaTime)`: Update all systems

### Utility Functions

- `createEntity(id, type)`: Create a new entity
- `createComponent(id, type, entityId)`: Create a new component
- `createSystem(id, entities, components)`: Create a new system

## Types

### Entity

```typescript
interface Entity {
  readonly id: string;
  readonly type: string;
}
```

### Component

```typescript
interface Component {
  readonly id: string;
  readonly type: string;
  readonly entityId: string;
}
```

### System

```typescript
interface System {
  readonly id: string;
  readonly entities: ReadonlyArray<Entity>;
  readonly components: ReadonlyArray<Component>;
  update?(entities, components, deltaTime): void;
}
```

## License

GPL-3.0-only
