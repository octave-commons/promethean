/**
 * Agent Card Component - Displays agent information in a card format
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { formatDistanceToNow } from 'luxon';
import type { Agent } from '../types.js';
import { 
  agentDesignTokens, 
  agentStatusConfig, 
  agentTypeConfig,
  getStatusColor,
  getTypeColor 
} from '../design-system.js';

@customElement('agent-card')
export class AgentCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: white;
      border-radius: var(--agent-borderRadius, 8px);
      box-shadow: var(--agent-shadowMedium);
      padding: var(--agent-spacingLarge, 16px);
      transition: var(--agent-transitionNormal);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    :host(:hover) {
      box-shadow: var(--agent-shadowLarge);
      transform: translateY(-2px);
    }

    :host([selected]) {
      border: 2px solid var(--agent-colorPrimary, #4A90E2);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--agent-spacingMedium, 8px);
    }

    .agent-info {
      display: flex;
      align-items: center;
      gap: var(--agent-spacingMedium, 8px);
    }

    .agent-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      background: var(--agent-colorSecondary, #50E3C2);
    }

    .agent-details h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }

    .agent-type {
      font-size: 12px;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }

    .card-body {
      margin-bottom: var(--agent-spacingMedium, 8px);
    }

    .capabilities {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: var(--agent-spacingMedium, 8px);
    }

    .capability-tag {
      background: #f3f4f6;
      color: #374151;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 500;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--agent-spacingSmall, 4px);
    }

    .metric {
      display: flex;
      flex-direction: column;
    }

    .metric-label {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #6b7280;
    }

    .last-active {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .actions {
      display: flex;
      gap: 4px;
    }

    .action-button {
      background: none;
      border: none;
      padding: 4px;
      border-radius: 4px;
      cursor: pointer;
      color: #6b7280;
      transition: var(--agent-transitionFast);
    }

    .action-button:hover {
      background: #f3f4f6;
      color: #1f2937;
    }

    .progress-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: #e5e7eb;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--agent-colorPrimary, #4A90E2);
      transition: width var(--agent-transitionNormal);
    }

    .error-indicator {
      position: absolute;
      top: 8px;
      right: 8px;
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
    @media (max-width: 768px) {
      :host {
        padding: var(--agent-spacingMedium, 8px);
      }

      .metrics {
        grid-template-columns: 1fr;
      }

      .agent-icon {
        width: 32px;
        height: 32px;
        font-size: 16px;
      }
    }
  `;

  @property({ type: Object })
  agent!: Agent;

  @property({ type: Boolean, reflect: true })
  selected = false;

  @property({ type: Boolean })
  compact = false;

  private handleCardClick() {
    this.dispatchEvent(new CustomEvent('agent-selected', {
      detail: { agent: this.agent },
      bubbles: true,
      composed: true
    }));
  }

  private handleActionClick(action: string, event: Event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('agent-action', {
      detail: { agent: this.agent, action },
      bubbles: true,
      composed: true
    }));
  }

  private formatLastActive(date?: Date): string {
    if (!date) return 'Never';
    return formatDistanceToNow(date, { addSuffix: true });
  }

  private getTaskProgress(): number {
    const total = this.agent.metrics.tasksCompleted + this.agent.metrics.tasksFailed;
    if (total === 0) return 0;
    return (this.agent.metrics.tasksCompleted / total) * 100;
  }

  render() {
    const statusConfig = agentStatusConfig[this.agent.status];
    const typeConfig = agentTypeConfig[this.agent.type];
    const progress = this.getTaskProgress();

    return html`
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>

      ${this.agent.status === 'error' ? html`<div class="error-indicator"></div>` : ''}

      <div class="card-header">
        <div class="agent-info">
          <div class="agent-icon" style="background: ${typeConfig.color}20">
            ${typeConfig.icon}
          </div>
          <div class="agent-details">
            <h3>${this.agent.name}</h3>
            <div class="agent-type">
              <span>${typeConfig.icon}</span>
              <span>${typeConfig.label}</span>
            </div>
          </div>
        </div>
        <div class="status-badge" style="background: ${statusConfig.color}20; color: ${statusConfig.color}">
          <span>${statusConfig.icon}</span>
          <span>${statusConfig.label}</span>
        </div>
      </div>

      <div class="card-body">
        ${!this.compact ? html`
          <div class="capabilities">
            ${this.agent.capabilities.slice(0, 3).map(cap => 
              html`<span class="capability-tag">${cap}</span>`
            )}
            ${this.agent.capabilities.length > 3 ? 
              html`<span class="capability-tag">+${this.agent.capabilities.length - 3}</span>` : ''}
          </div>

          <div class="metrics">
            <div class="metric">
              <span class="metric-label">Tasks</span>
              <span class="metric-value">${this.agent.metrics.tasksCompleted}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Success Rate</span>
              <span class="metric-value">${Math.round((1 - this.agent.metrics.errorRate) * 100)}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Response Time</span>
              <span class="metric-value">${Math.round(this.agent.metrics.averageResponseTime)}ms</span>
            </div>
            <div class="metric">
              <span class="metric-label">CPU</span>
              <span class="metric-value">${Math.round(this.agent.metrics.cpuUsage)}%</span>
            </div>
          </div>
        ` : ''}
      </div>

      <div class="card-footer">
        <div class="last-active">
          <span>🕐</span>
          <span>${this.formatLastActive(this.agent.lastActive)}</span>
        </div>
        <div class="actions">
          <button 
            class="action-button" 
            @click=${(e: Event) => this.handleActionClick('restart', e)}
            title="Restart Agent"
          >
            🔄
          </button>
          <button 
            class="action-button" 
            @click=${(e: Event) => this.handleActionClick('configure', e)}
            title="Configure Agent"
          >
            ⚙️
          </button>
          <button 
            class="action-button" 
            @click=${(e: Event) => this.handleActionClick('logs', e)}
            title="View Logs"
          >
            📄
          </button>
        </div>
      </div>

      <div @click=${this.handleCardClick} style="position: absolute; inset: 0; cursor: pointer;"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'agent-card': AgentCard;
  }
}