/**
 * Management UI types for the Pantheon Agent Framework
 */

export type UIComponent = {
  readonly id: string;
  readonly type: ComponentType;
  readonly props: Readonly<Record<string, unknown>>;
  readonly children?: readonly UIComponent[];
  readonly layout?: LayoutConfig;
};

export enum ComponentType {
  AGENT_CARD = 'agent_card',
  AGENT_LIST = 'agent_list',
  WORKFLOW_DIAGRAM = 'workflow_diagram',
  METRICS_DASHBOARD = 'metrics_dashboard',
  LOG_VIEWER = 'log_viewer',
  CONFIG_EDITOR = 'config_editor',
}

export type LayoutConfig = {
  readonly width?: number;
  readonly height?: number;
  readonly x?: number;
  readonly y?: number;
  readonly flex?: number;
  readonly direction?: 'row' | 'column';
};
