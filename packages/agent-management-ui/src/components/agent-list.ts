/**
 * Agent List Component - Displays agents in a list format
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { formatDistanceToNow } from 'luxon';
import type { Agent } from '../types.js';
import { agentStatusConfig, agentTypeConfig } from '../design-system.js';

@customElement('agent-list')
export class AgentList extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: white;
      border-radius: var(--agent-borderRadius, 8px);
      overflow: hidden;
      box-shadow: var(--agent-shadowSmall);
    }

    .list-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 120px;
      gap: var(--agent-spacingMedium, 8px);
      padding: var(--agent-spacingMedium, 8px) var(--agent-spacingLarge, 16px);
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .list-item {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 120px;
      gap: var(--agent-spacingMedium, 8px);
      padding: var(--agent-spacingMedium, 8px) var(--agent-spacingLarge, 16px);
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: var(--agent-transitionFast);
      align-items: center;
    }

    .list-item:hover {
      background: #f9fafb;
    }

    .list-item:last-child {
      border-bottom: none;
    }

    .list-item[selected] {
      background: #eff6ff;
      border-left: 3px solid var(--agent-colorPrimary, #4A90E2);
    }

    .agent-name {
      display: flex;
      align-items: center;
      gap: var(--agent-spacingSmall, 4px);
      font-weight: 500;
      color: #1f2937;
    }

    .agent-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }

    .status-badge {
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 2px;
      white-space: nowrap;
    }

    .type-badge {
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 2px;
      white-space: nowrap;
    }

    .metric {
      font-size: 13px;
      color: #374151;
    }

    .metric-value {
      font-weight: 600;
    }

    .metric-unit {
      font-size: 11px;
      color: #6b7280;
    }

    .actions {
      display: flex;
      gap: 2px;
      justify-content: flex-end;
    }

    .action-button {
      background: none;
      border: none;
      padding: 4px;
      border-radius: 4px;
      cursor: pointer;
      color: #6b7280;
      transition: var(--agent-transitionFast);
      font-size: 12px;
    }

    .action-button:hover {
      background: #f3f4f6;
      color: #1f2937;
    }

    .last-active {
      font-size: 11px;
      color: #6b7280;
    }

    .error-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ef4444;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Responsive design */
    @media (max-width: 1024px) {
      .list-header,
      .list-item {
        grid-template-columns: 2fr 1fr 1fr 80px;
      }

      .list-header > :nth-child(4),
      .list-header > :nth-child(5),
      .list-item > :nth-child(4),
      .list-item > :nth-child(5) {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .list-header,
      .list-item {
        grid-template-columns: 1fr 60px;
      }

      .list-header > :nth-child(2),
      .list-header > :nth-child(3),
      .list-item > :nth-child(2),
      .list-item > :nth-child(3) {
        display: none;
      }
    }
  `;

  @property({ type: Array })
  agents: Agent[] = [];

  @property({ type: String })
  selectedAgentId?: string;

  @property({ type: Boolean })
  compact = false;

  private handleItemClick(agent: Agent, event: Event) {
    this.dispatchEvent(new CustomEvent('agent-selected', {
      detail: { agent },
      bubbles: true,
      composed: true
    }));
  }

  private handleActionClick(agent: Agent, action: string, event: Event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('agent-action', {
      detail: { agent, action },
      bubbles: true,
      composed: true
    }));
  }

  private formatLastActive(date?: Date): string {
    if (!date) return 'Never';
    return formatDistanceToNow(date, { addSuffix: true });
  }

  render() {
    if (this.agents.length === 0) {
      return html`
        <div style="padding: 32px; text-align: center; color: #6b7280;">
          <div style="font-size: 48px; margin-bottom: 16px;">🤖</div>
          <div style="font-size: 16px; font-weight: 500;">No agents found</div>
          <div style="font-size: 14px; margin-top: 4px;">Create your first agent to get started</div>
        </div>
      `;
    }

    return html`
      <div class="list-header">
        <div>Agent</div>
        <div>Status</div>
        <div>Type</div>
        <div>Tasks</div>
        <div>Performance</div>
        <div>Actions</div>
      </div>

      ${this.agents.map(agent => {
        const statusConfig = agentStatusConfig[agent.status];
        const typeConfig = agentTypeConfig[agent.type];
        const isSelected = agent.id === this.selectedAgentId;

        return html`
          <div 
            class="list-item" 
            ?selected=${isSelected}
            @click=${(e: Event) => this.handleItemClick(agent, e)}
          >
            <div class="agent-name">
              <div 
                class="agent-icon" 
                style="background: ${typeConfig.color}20; color: ${typeConfig.color}"
              >
                ${typeConfig.icon}
              </div>
              <span>${agent.name}</span>
              ${agent.status === 'error' ? html`<div class="error-indicator"></div>` : ''}
            </div>

            <div>
              <div 
                class="status-badge" 
                style="background: ${statusConfig.color}20; color: ${statusConfig.color}"
              >
                <span>${statusConfig.icon}</span>
                <span>${statusConfig.label}</span>
              </div>
            </div>

            <div>
              <div 
                class="type-badge" 
                style="background: ${typeConfig.color}20; color: ${typeConfig.color}"
              >
                <span>${typeConfig.icon}</span>
                <span>${typeConfig.label}</span>
              </div>
            </div>

            <div class="metric">
              <span class="metric-value">${agent.metrics.tasksCompleted}</span>
              <span class="metric-unit">tasks</span>
            </div>

            <div class="metric">
              <span class="metric-value">${Math.round(agent.metrics.averageResponseTime)}ms</span>
              <span class="metric-unit">avg</span>
            </div>

            <div class="actions">
              <button 
                class="action-button" 
                @click=${(e: Event) => this.handleActionClick(agent, 'restart', e)}
                title="Restart Agent"
              >
                🔄
              </button>
              <button 
                class="action-button" 
                @click=${(e: Event) => this.handleActionClick(agent, 'configure', e)}
                title="Configure Agent"
              >
                ⚙️
              </button>
              <button 
                class="action-button" 
                @click=${(e: Event) => this.handleActionClick(agent, 'logs', e)}
                title="View Logs"
              >
                📄
              </button>
            </div>
          </div>
        `;
      })}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'agent-list': AgentList;
  }
}