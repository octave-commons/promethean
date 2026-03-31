// Basic ECS types and utilities for Pantheon framework

export interface Entity {
  readonly id: string;
  readonly type: string;
}

export interface Component {
  readonly id: string;
  readonly type: string;
  readonly entityId: string;
}

export interface System {
  readonly id: string;
  readonly entities: ReadonlyArray<Entity>;
  readonly components: ReadonlyArray<Component>;
  update?(
    entities: ReadonlyArray<Entity>,
    components: ReadonlyArray<Component>,
    deltaTime: number,
  ): void;
}

export class EntityComponentSystem {
  private readonly entities = new Map<string, Entity>();
  private readonly components = new Map<string, Map<string, Component>>();
  private readonly systems: System[] = [];

  addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  removeEntity(entityId: string): void {
    const entity = this.entities.get(entityId);
    if (!entity) return;

    // Remove entity from all component maps
    for (const [_, componentMap] of this.components) {
      componentMap.delete(entityId);
    }

    this.entities.delete(entityId);
  }

  addComponent(component: Component): void {
    if (!this.components.has(component.type)) {
      this.components.set(component.type, new Map());
    }
    this.components.get(component.type)!.set(component.entityId, component);
  }

  removeComponent(entityId: string, componentType: string): void {
    const componentMap = this.components.get(componentType);
    if (componentMap) {
      componentMap.delete(entityId);
    }
  }

  getComponent<T extends Component>(entityId: string, componentType: string): T | undefined {
    const componentMap = this.components.get(componentType);
    return componentMap?.get(entityId) as T | undefined;
  }

  getEntity(entityId: string): Entity | undefined {
    return this.entities.get(entityId);
  }

  addSystem(system: System): void {
    this.systems.push(system);
  }

  update(deltaTime: number): void {
    for (const system of this.systems) {
      // Update system with current entities and components
      const currentEntities = Array.from(this.entities.values());
      const currentComponents = Array.from(this.components.values()).flatMap((map) =>
        Array.from(map.values()),
      );

      // Simple system update - in real implementation this would be more sophisticated
      if (typeof system.update === 'function') {
        system.update(currentEntities, currentComponents, deltaTime);
      }
    }
  }
}

// Utility functions for creating common ECS objects
export function createEntity(id: string, type: string): Entity {
  return { id, type };
}

export function createComponent(id: string, type: string, entityId: string): Component {
  return { id, type, entityId };
}

export function createSystem(
  id: string,
  entities: ReadonlyArray<Entity>,
  components: ReadonlyArray<Component>,
): System {
  return { id, entities, components };
}
