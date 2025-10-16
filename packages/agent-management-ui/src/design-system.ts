/**
 * Design system for Agent Management UI
 * Extends base Promethean design tokens with agent-specific theming
 */

import { designTokens as baseTokens } from '@promethean/ui-components';

export const agentDesignTokens = {
  ...baseTokens,
  
  // Agent Status Colors
  statusIdle: '#6B7280',
  statusActive: '#10B981',
  statusBusy: '#F59E0B',
  statusError: '#EF4444',
  statusOffline: '#374151',
  statusMaintenance: '#8B5CF6',
  statusStarting: '#3B82F6',
  statusStopping: '#F97316',
  
  // Agent Type Colors
  typeGeneral: '#6366F1',
  typeSpecialist: '#EC4899',
  typeOrchestrator: '#14B8A6',
  typeMonitor: '#F59E0B',
  typeWorkflow: '#8B5CF6',
  typeUI: '#10B981',
  typeBackend: '#EF4444',
  
  // Priority Colors
  priorityLow: '#6B7280',
  priorityMedium: '#F59E0B',
  priorityHigh: '#F97316',
  priorityCritical: '#DC2626',
  
  // Metrics Colors
  metricsSuccess: '#10B981',
  metricsWarning: '#F59E0B',
  metricsError: '#EF4444',
  metricsInfo: '#3B82F6',
  
  // Layout
  sidebarWidth: '280px',
  headerHeight: '64px',
  cardGap: '16px',
  borderRadius: '8px',
  
  // Spacing (extends base)
  spacingXSmall: '2px',
  spacingSmall: '4px',
  spacingMedium: '8px',
  spacingLarge: '16px',
  spacingXLarge: '24px',
  spacingXXLarge: '32px',
  
  // Typography
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontFamilyMono: 'JetBrains Mono, Consolas, monospace',
  
  // Shadows
  shadowSmall: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  shadowMedium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  shadowLarge: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  
  // Animations
  transitionFast: '150ms ease-in-out',
  transitionNormal: '250ms ease-in-out',
  transitionSlow: '350ms ease-in-out',
  
  // Z-index
  zIndexDropdown: 1000,
  zIndexModal: 1050,
  zIndexToast: 1100,
  zIndexTooltip: 1200,
} as const;

export const agentStatusConfig = {
  idle: {
    color: agentDesignTokens.statusIdle,
    label: 'Idle',
    icon: '⏸️',
    description: 'Agent is idle and waiting for tasks'
  },
  active: {
    color: agentDesignTokens.statusActive,
    label: 'Active',
    icon: '✅',
    description: 'Agent is actively processing tasks'
  },
  busy: {
    color: agentDesignTokens.statusBusy,
    label: 'Busy',
    icon: '🔄',
    description: 'Agent is busy with multiple tasks'
  },
  error: {
    color: agentDesignTokens.statusError,
    label: 'Error',
    icon: '❌',
    description: 'Agent has encountered an error'
  },
  offline: {
    color: agentDesignTokens.statusOffline,
    label: 'Offline',
    icon: '🔌',
    description: 'Agent is offline'
  },
  maintenance: {
    color: agentDesignTokens.statusMaintenance,
    label: 'Maintenance',
    icon: '🔧',
    description: 'Agent is under maintenance'
  },
  starting: {
    color: agentDesignTokens.statusStarting,
    label: 'Starting',
    icon: '🚀',
    description: 'Agent is starting up'
  },
  stopping: {
    color: agentDesignTokens.statusStopping,
    label: 'Stopping',
    icon: '🛑',
    description: 'Agent is shutting down'
  }
} as const;

export const agentTypeConfig = {
  general: {
    color: agentDesignTokens.typeGeneral,
    label: 'General',
    icon: '🤖',
    description: 'General purpose agent'
  },
  specialist: {
    color: agentDesignTokens.typeSpecialist,
    label: 'Specialist',
    icon: '🎯',
    description: 'Specialized agent for specific tasks'
  },
  orchestrator: {
    color: agentDesignTokens.typeOrchestrator,
    label: 'Orchestrator',
    icon: '🎼',
    description: 'Orchestrates other agents'
  },
  monitor: {
    color: agentDesignTokens.typeMonitor,
    label: 'Monitor',
    icon: '📊',
    description: 'Monitors system health'
  },
  workflow: {
    color: agentDesignTokens.typeWorkflow,
    label: 'Workflow',
    icon: '⚡',
    description: 'Workflow automation agent'
  },
  ui: {
    color: agentDesignTokens.typeUI,
    label: 'UI',
    icon: '🎨',
    description: 'UI/UX focused agent'
  },
  backend: {
    color: agentDesignTokens.typeBackend,
    label: 'Backend',
    icon: '⚙️',
    description: 'Backend services agent'
  }
} as const;

export function applyAgentDesignTokens(
  root: HTMLElement | Document = document,
): void {
  const el = (root as Document).documentElement
    ? (root as Document).documentElement
    : root;
  if (!el || !(el as HTMLElement).style) return;
  
  Object.entries(agentDesignTokens).forEach(([k, v]) => {
    const kebabKey = k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
    (el as HTMLElement).style.setProperty(`--agent-${kebabKey}`, String(v));
  });
}

export function getStatusColor(status: string): string {
  return agentStatusConfig[status as keyof typeof agentStatusConfig]?.color || agentDesignTokens.statusIdle;
}

export function getTypeColor(type: string): string {
  return agentTypeConfig[type as keyof typeof agentTypeConfig]?.color || agentDesignTokens.typeGeneral;
}

export function getPriorityColor(priority: string): string {
  const colors = {
    low: agentDesignTokens.priorityLow,
    medium: agentDesignTokens.priorityMedium,
    high: agentDesignTokens.priorityHigh,
    critical: agentDesignTokens.priorityCritical
  };
  return colors[priority as keyof typeof colors] || agentDesignTokens.priorityMedium;
}