/**
 * Centralized state management for the Agent Management UI
 */

import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import type { 
  Agent, 
  AgentTask, 
  AgentEvent, 
  DashboardFilters, 
  UIState, 
  SystemMetrics,
  AgentAction 
} from '../types.js';

export class StateManager {
  private agents$ = new BehaviorSubject<Agent[]>([]);
  private tasks$ = new BehaviorSubject<AgentTask[]>([]);
  private events$ = new BehaviorSubject<AgentEvent[]>([]);
  private filters$ = new BehaviorSubject<DashboardFilters>({
    status: [],
    type: [],
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  private uiState$ = new BehaviorSubject<UIState>({
    sidebarOpen: true,
    theme: 'auto',
    view: 'grid',
    autoRefresh: true,
    refreshInterval: 5000
  });
  private systemMetrics$ = new BehaviorSubject<SystemMetrics>({
    totalAgents: 0,
    activeAgents: 0,
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    systemLoad: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    uptime: 0
  });

  // Public observables
  readonly agents = this.agents$.asObservable();
  readonly tasks = this.tasks$.asObservable();
  readonly events = this.events$.asObservable();
  readonly filters = this.filters$.asObservable();
  readonly uiState = this.uiState$.asObservable();
  readonly systemMetrics = this.systemMetrics$.asObservable();

  // Computed observables
  readonly filteredAgents$ = combineLatest([
    this.agents$,
    this.filters$
  ]).pipe(
    map(([agents, filters]) => this.filterAgents(agents, filters)),
    distinctUntilChanged()
  );

  readonly activeTasks$ = this.tasks$.pipe(
    map(tasks => tasks.filter(task => task.status === 'running' || task.status === 'pending'))
  );

  readonly recentEvents$ = this.events$.pipe(
    map(events => events.slice(0, 50).reverse())
  );

  readonly selectedAgent$ = combineLatest([
    this.agents$,
    this.uiState$
  ]).pipe(
    map(([agents, uiState]) => agents.find(agent => agent.id === uiState.selectedAgent))
  );

  constructor() {
    this.initializeAutoRefresh();
  }

  // Agent management
  updateAgents(agents: Agent[]): void {
    this.agents$.next(agents);
    this.updateSystemMetrics(agents);
  }

  addAgent(agent: Agent): void {
    const current = this.agents$.value;
    this.agents$.next([...current, agent]);
    this.updateSystemMetrics([...current, agent]);
  }

  updateAgent(agentId: string, updates: Partial<Agent>): void {
    const current = this.agents$.value;
    const index = current.findIndex(agent => agent.id === agentId);
    if (index !== -1) {
      const updated = [...current];
      updated[index] = { ...updated[index], ...updates, updatedAt: new Date() };
      this.agents$.next(updated);
      this.updateSystemMetrics(updated);
    }
  }

  removeAgent(agentId: string): void {
    const current = this.agents$.value;
    const filtered = current.filter(agent => agent.id !== agentId);
    this.agents$.next(filtered);
    this.updateSystemMetrics(filtered);
  }

  // Task management
  updateTasks(tasks: AgentTask[]): void {
    this.tasks$.next(tasks);
  }

  addTask(task: AgentTask): void {
    const current = this.tasks$.value;
    this.tasks$.next([...current, task]);
  }

  updateTask(taskId: string, updates: Partial<AgentTask>): void {
    const current = this.tasks$.value;
    const index = current.findIndex(task => task.id === taskId);
    if (index !== -1) {
      const updated = [...current];
      updated[index] = { ...updated[index], ...updates };
      this.tasks$.next(updated);
    }
  }

  // Event management
  addEvent(event: AgentEvent): void {
    const current = this.events$.value;
    this.events$.next([event, ...current].slice(0, 1000)); // Keep last 1000 events
  }

  clearEvents(): void {
    this.events$.next([]);
  }

  // Filter management
  updateFilters(filters: Partial<DashboardFilters>): void {
    const current = this.filters$.value;
    this.filters$.next({ ...current, ...filters });
  }

  clearFilters(): void {
    this.filters$.next({
      status: [],
      type: [],
      search: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  }

  // UI state management
  updateUIState(updates: Partial<UIState>): void {
    const current = this.uiState$.value;
    this.uiState$.next({ ...current, ...updates });
  }

  selectAgent(agentId?: string): void {
    this.updateUIState({ selectedAgent: agentId });
  }

  selectTask(taskId?: string): void {
    this.updateUIState({ selectedTask: taskId });
  }

  toggleSidebar(): void {
    const current = this.uiState$.value;
    this.updateUIState({ sidebarOpen: !current.sidebarOpen });
  }

  setView(view: 'grid' | 'list' | 'metrics'): void {
    this.updateUIState({ view });
  }

  // Action dispatch
  dispatchAction(action: AgentAction): void {
    this.handleAction(action);
  }

  // Private methods
  private filterAgents(agents: Agent[], filters: DashboardFilters): Agent[] {
    let filtered = agents;

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(agent => filters.status.includes(agent.status));
    }

    // Type filter
    if (filters.type.length > 0) {
      filtered = filtered.filter(agent => filters.type.includes(agent.type));
    }

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(search) ||
        agent.capabilities.some(cap => cap.toLowerCase().includes(search))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = this.getSortValue(a, filters.sortBy);
      const bValue = this.getSortValue(b, filters.sortBy);
      
      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }

  private getSortValue(agent: Agent, field: string): any {
    switch (field) {
      case 'name': return agent.name;
      case 'status': return agent.status;
      case 'type': return agent.type;
      case 'lastActive': return agent.lastActive?.getTime() || 0;
      case 'tasksCompleted': return agent.metrics.tasksCompleted;
      case 'errorRate': return agent.metrics.errorRate;
      default: return agent.name;
    }
  }

  private updateSystemMetrics(agents: Agent[]): void {
    const tasks = this.tasks$.value;
    const activeAgents = agents.filter(agent => 
      agent.status === 'active' || agent.status === 'busy'
    ).length;

    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const failedTasks = tasks.filter(task => task.status === 'failed').length;

    this.systemMetrics$.next({
      totalAgents: agents.length,
      activeAgents,
      totalTasks: tasks.length,
      completedTasks,
      failedTasks,
      systemLoad: 0, // Would be populated by monitoring system
      memoryUsage: 0, // Would be populated by monitoring system
      cpuUsage: 0, // Would be populated by monitoring system
      uptime: 0 // Would be populated by monitoring system
    });
  }

  private handleAction(action: AgentAction): void {
    switch (action.type) {
      case 'start':
        this.updateAgent(action.agentId, { status: 'starting' });
        break;
      case 'stop':
        this.updateAgent(action.agentId, { status: 'stopping' });
        break;
      case 'restart':
        this.updateAgent(action.agentId, { status: 'starting' });
        break;
      case 'configure':
        // Handle configuration update
        break;
      case 'assign_task':
        // Handle task assignment
        break;
      case 'cancel_task':
        // Handle task cancellation
        break;
      case 'update_config':
        // Handle config update
        break;
      case 'clear_logs':
        // Handle log clearing
        break;
    }
  }

  private initializeAutoRefresh(): void {
    this.uiState$.pipe(
      map(state => state.autoRefresh),
      distinctUntilChanged()
    ).subscribe(autoRefresh => {
      if (autoRefresh) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    });
  }

  private refreshInterval?: NodeJS.Timeout;

  private startAutoRefresh(): void {
    const interval = this.uiState$.value.refreshInterval;
    this.refreshInterval = setInterval(() => {
      // Trigger data refresh
      this.refreshData();
    }, interval);
  }

  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }

  private async refreshData(): Promise<void> {
    // This would be implemented to fetch fresh data from the backend
    // For now, it's a placeholder
    console.log('Refreshing data...');
  }

  // Cleanup
  destroy(): void {
    this.stopAutoRefresh();
    this.agents$.complete();
    this.tasks$.complete();
    this.events$.complete();
    this.filters$.complete();
    this.uiState$.complete();
    this.systemMetrics$.complete();
  }
}

// Global state instance
export const stateManager = new StateManager();