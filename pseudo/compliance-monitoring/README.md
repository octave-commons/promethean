# Automated Compliance Monitoring System

A comprehensive real-time compliance monitoring system for the Promethean framework that provides automated violation detection, multi-channel alerting, and interactive dashboard visualization.

## 🎯 Features

### Real-time Monitoring
- **WIP Limit Compliance**: Continuous monitoring of kanban column capacity
- **Process Flow Validation**: Automated detection of illegal transitions and workflow violations
- **Security Task Monitoring**: Specialized monitoring for P0 priority security tasks
- **Performance Metrics**: Real-time calculation of compliance scores and trends

### Multi-Channel Alerting
- **Email Notifications**: Configurable email alerts for violations
- **Slack Integration**: Real-time Slack notifications for critical issues
- **Webhook Support**: Custom webhook integration for external systems
- **Dashboard Alerts**: Real-time in-app notifications

### Interactive Dashboard
- **Real-time Updates**: Live dashboard with WebSocket connections
- **Compliance Metrics**: Visual representation of compliance scores
- **Event History**: Detailed log of all compliance events
- **Trend Analysis**: Charts and graphs for compliance trends

### Advanced Features
- **Automated Scanning**: Configurable scan intervals for continuous monitoring
- **Custom Rules**: Flexible rule engine for custom compliance requirements
- **Report Generation**: Automated daily, weekly, and monthly reports
- **API Integration**: RESTful API for integration with other systems

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Start the compliance monitoring system
pnpm start
```

### Basic Usage

```bash
# Start with default configuration
compliance-monitor start

# Start with custom port
compliance-monitor start --port 8080

# Start with email alerts enabled
compliance-monitor start --email

# Start with Slack alerts enabled
compliance-monitor start --slack --webhook https://hooks.slack.com/your-webhook

# Generate default configuration
compliance-monitor config --generate

# Trigger manual scan
compliance-monitor scan

# View system status
compliance-monitor status

# Generate daily report
compliance-monitor report --type daily

# List recent events
compliance-monitor events --limit 10 --severity CRITICAL,HIGH
```

## ⚙️ Configuration

### Default Configuration

```json
{
  "enabled": true,
  "scanInterval": 300,
  "wipThresholds": {
    "warning": 80,
    "critical": 95
  },
  "security": {
    "p0RequiredStatuses": ["in_progress", "testing", "review"],
    "scanInterval": 600,
    "tools": ["semgrep", "snyk", "eslint-security"]
  },
  "alerts": {
    "email": {
      "enabled": false,
      "recipients": ["admin@example.com"]
    },
    "slack": {
      "enabled": false,
      "webhook": "https://hooks.slack.com/services/...",
      "channel": "#compliance"
    },
    "webhook": {
      "enabled": false,
      "url": "https://your-system.com/webhook"
    }
  },
  "retention": {
    "events": 30,
    "metrics": 90
  }
}
```

### Environment Variables

```bash
# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=compliance@yourcompany.com

# Slack configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Custom webhook
WEBHOOK_URL=https://your-system.com/webhook
```

## 📊 Dashboard

Access the interactive dashboard at `http://localhost:3001` (or your configured port).

### Dashboard Features

- **Real-time Metrics**: Live compliance scores and system status
- **Event Stream**: Real-time feed of compliance events
- **Interactive Charts**: Violation trends and compliance breakdowns
- **Event Management**: Resolve events and add resolution notes
- **Configuration**: Update system settings through the web interface

### WebSocket API

Connect to `ws://localhost:3001/ws` for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

// Subscribe to specific event types
ws.send(JSON.stringify({
  type: 'subscribe',
  filters: ['VIOLATION', 'ALERT']
}));
```

## 🔌 API Reference

### REST API Endpoints

#### System Status
```http
GET /health
GET /api/status
```

#### Metrics and Events
```http
GET /api/metrics
GET /api/events?severity=CRITICAL&limit=50
GET /api/scan-result
```

#### Configuration
```http
GET /api/config
POST /api/config
```

#### Operations
```http
POST /api/scan
POST /api/events/:eventId/resolve
```

#### Dashboard Data
```http
GET /api/dashboard
GET /dashboard/
```

### Event Types

- **VIOLATION**: Compliance rule violations
- **ALERT**: System alerts and notifications
- **METRIC**: Metric updates and changes
- **RESOLVED**: Event resolution notifications

### Severity Levels

- **CRITICAL**: Immediate action required (P0 security issues, WIP violations)
- **HIGH**: Urgent attention needed (process violations, high WIP utilization)
- **MEDIUM**: Should be addressed soon (missing metadata, minor violations)
- **LOW**: Informational (trend alerts, summary notifications)

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/tests/compliance-engine.test.ts
```

## 📁 Project Structure

```
src/
├── index.ts                 # Main entry point
├── cli.ts                   # Command-line interface
├── types.ts                 # TypeScript type definitions
├── compliance-engine.ts     # Core monitoring engine
├── alert-system.ts         # Multi-channel alerting
├── dashboard-server.ts     # Real-time dashboard
└── tests/                  # Test suite
    ├── compliance-engine.test.ts
    ├── alert-system.test.ts
    └── dashboard-server.test.ts
```

## 🔧 Development

### Building

```bash
# Build for production
pnpm build

# Watch mode for development
pnpm dev

# Start development server
pnpm start:dev
```

### Code Quality

```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type checking
pnpm typecheck
```

## 🚨 Alert Examples

### Security Violation Alert
```
🚨 SECURITY VIOLATION DETECTED

Task: Fix critical path traversal vulnerability
UUID: 3c6a52c7-ee4d-4aa5-9d51-69e3eb1fdf4a
Issue: P0 task marked as todo instead of in_progress
Impact: Critical vulnerability remains unaddressed
Action Required: Immediately move task to in_progress status
Priority: URGENT - Response within 1 hour
```

### WIP Limit Violation Alert
```
⚠️ WIP LIMIT VIOLATION

Column: Testing
Current: 8 tasks
Limit: 5 tasks
Utilization: 160%
Status: VIOLATION
Action Required: Move 3 tasks to create capacity
Impact: New task intake blocked
```

### Process Violation Alert
```
❌ PROCESS VIOLATION DETECTED

Violation: Illegal transition attempted
Task: Design Agent OS Core Message Protocol
From: breakdown
To: testing
Issue: Design work cannot move to testing without implementation
Action Required: Move task to todo status
Priority: HIGH - Response within 4 hours
```

## 📈 Metrics and Reporting

### Compliance Score Calculation

The system calculates compliance scores across four dimensions:

1. **WIP Compliance**: Percentage of columns within WIP limits
2. **Process Compliance**: Percentage of tasks following proper workflow
3. **Security Compliance**: P0 task compliance and security gate status
4. **Overall Compliance**: Weighted average of all dimensions

### Automated Reports

- **Daily Reports**: Summary of daily violations and resolutions
- **Weekly Reports**: Trend analysis and compliance metrics
- **Monthly Reports**: Strategic compliance overview and recommendations

### Key Performance Indicators

- **Violation Detection Time**: Average time to detect violations
- **Resolution Time**: Average time to resolve violations
- **False Positive Rate**: Percentage of invalid violations
- **Compliance Trend**: Improvement or degradation over time

## 🛠️ Integration

### Kanban Integration

The system integrates seamlessly with the Promethean kanban system:

- **Real-time Board Monitoring**: Watches kanban board changes
- **Task Validation**: Validates task metadata and status
- **Transition Enforcement**: Ensures proper workflow transitions
- **WIP Limit Monitoring**: Tracks column capacity in real-time

### Security Tool Integration

Integrates with existing security scanning tools:

- **Semgrep**: Static analysis security scanning
- **Snyk**: Dependency vulnerability scanning
- **ESLint Security**: JavaScript/TypeScript security rules
- **Custom Tools**: Extensible framework for additional tools

### External System Integration

- **Webhook Support**: Send alerts to external systems
- **API Access**: RESTful API for system integration
- **Event Streaming**: Real-time event streaming via WebSocket
- **Custom Alerts**: Configurable alert rules and templates

## 🔒 Security Considerations

- **Access Control**: Dashboard access can be restricted
- **Data Privacy**: Sensitive task information is protected
- **Audit Trail**: Complete audit log of all compliance activities
- **Secure Communication**: HTTPS/WSS for secure communications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and support:

1. Check the [Issues](https://github.com/promethean/compliance-monitoring/issues) page
2. Review the [Documentation](https://docs.promethean.local/compliance-monitoring)
3. Contact the compliance team at compliance@promethean.local

---

**Automated Compliance Monitoring System** - Keeping your workflow compliant and secure, 24/7.