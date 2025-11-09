# Dual Store Explorer Web UI

A modern, responsive web interface for exploring and searching all Promethean dual stores.

## Features

### 📊 Real-time Data Exploration

- **Session Messages**: View user/assistant conversations with role-based styling
- **Agent Tasks**: Monitor task progress, status, and input/output data
- **OpenCode Events**: Track system events with severity levels and metadata

### 🔍 Advanced Search & Filtering

- **Global Search**: Search across all collections simultaneously
- **Collection Filtering**: Focus on specific data types
- **Session ID Filtering**: Filter by specific session identifiers
- **Date Range Filtering**: Explore data within time periods
- **Real-time Updates**: Auto-refresh every 30 seconds

### 📈 Statistics Dashboard

- **Collection Counts**: Live counts for each data type
- **Last Updated**: Track data freshness
- **Visual Indicators**: Color-coded status and severity badges

### 🎨 Modern UI/UX

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Support**: Clean, accessible interface
- **Smooth Animations**: Fade-in effects and transitions
- **Loading States**: Skeleton loaders and spinners
- **Toast Notifications**: Non-intrusive feedback system

## Quick Start

### 1. Start the Dual Store API

```bash
cd packages/dualstore-http
pnpm dev
```

This starts the API server on `http://localhost:3000`

### 2. Start the Web UI

```bash
cd packages/dualstore-http
pnpm web-ui
```

This starts the web UI on `http://localhost:8080`

### 3. Open Your Browser

Navigate to `http://localhost:8080` to access the explorer.

## API Endpoints Used

The web UI connects to these dualstore-http API endpoints:

### Collections

- `GET /api/v1/session_messages` - Session messages
- `GET /api/v1/agent_tasks` - Agent tasks
- `GET /api/v1/opencode_events` - OpenCode events

### Query Parameters

- `session_id` - Filter by session ID
- `created_after` - Filter by creation date (ISO string)
- `created_before` - Filter by creation date (ISO string)
- `limit` - Maximum results per page (default: 50)
- `offset` - Pagination offset (default: 0)
- `sort_by` - Sort field (default: created_at)
- `sort_order` - Sort direction: asc/desc (default: desc)

## Data Models

### Session Message

```typescript
{
  id: string;
  created_at: string;
  updated_at: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
}
```

### Agent Task

```typescript
{
  id: string;
  created_at: string;
  updated_at: string;
  session_id: string;
  agent_id: string;
  task_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
}
```

### OpenCode Event

```typescript
{
  id: string;
  created_at: string;
  updated_at: string;
  session_id: string;
  event_type: string;
  event_data: Record<string, any>;
  source: string;
  severity: 'info' | 'warning' | 'error' | 'debug';
}
```

## UI Components

### Status Badges

- **Running**: Green badge for active tasks
- **Completed**: Blue badge for finished tasks
- **Failed**: Red badge for failed tasks
- **Pending**: Yellow badge for queued tasks
- **Idle**: Gray badge for inactive tasks

### Severity Indicators

- **Info**: Blue border and background
- **Warning**: Yellow border and background
- **Error**: Red border and background
- **Critical**: Purple border and background

### Search Features

- **Debounced Search**: 300ms delay to prevent excessive API calls
- **Multi-field Search**: Searches across relevant fields for each collection
- **Real-time Filtering**: Instant results as you type

## Configuration

### API Endpoint

The web UI automatically detects the API endpoint. You can change it in the header:

- Default: `http://localhost:3000`
- Stored in localStorage for persistence

### Auto-refresh

- **Interval**: Every 30 seconds
- **Manual Refresh**: Click the refresh button in the header
- **Loading Indicators**: Spinners show during data updates

## Browser Support

- **Chrome/Chromium**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

Required features:

- ES6 Modules (for Alpine.js)
- Fetch API
- CSS Grid and Flexbox
- CSS Custom Properties

## Development

### File Structure

```
src/web-ui/
├── index.html          # Main HTML file with embedded CSS/JS
├── server.js           # Simple Node.js server for development
└── README.md           # This documentation
```

### Technologies Used

- **Alpine.js**: Reactive JavaScript framework
- **Tailwind CSS**: Utility-first CSS framework
- **HTMX**: Enhanced HTML interactions (loaded via CDN)
- **Font Awesome**: Icon library
- **Node.js**: Development server

### Customization

The UI is built with customization in mind:

- **Colors**: Modify Tailwind color classes
- **Layout**: Adjust grid and flexbox classes
- **Components**: Alpine.js components are modular
- **Styling**: Custom CSS can be added alongside Tailwind

## Troubleshooting

### Common Issues

1. **"Failed to load data"**

   - Ensure the dualstore-http API is running on port 3000
   - Check browser console for CORS errors
   - Verify API endpoint configuration

2. **"No data found"**

   - Check if the mock data store has data
   - Try clearing search filters
   - Verify date range filters

3. **"Connection refused"**
   - Start the dualstore-http API first: `pnpm dev`
   - Check if port 3000 is available
   - Verify no firewall blocking the connection

### Debug Mode

Open browser developer tools to see:

- Network requests and responses
- Console errors and warnings
- Alpine.js reactivity logs

## Performance

### Optimization Features

- **Debounced Search**: Reduces API calls
- **Virtual Scrolling**: Handles large datasets (future enhancement)
- **Lazy Loading**: Loads data on demand
- **Caching**: Browser cache for static assets

### Recommended Limits

- **Search Results**: 100 items per request
- **Auto-refresh**: 30-second intervals
- **Date Range**: Maximum 1 year for performance

## Security

### Considerations

- **CORS**: Enabled for development
- **Authentication**: Bearer token support in API
- **Data Exposure**: No sensitive data in UI
- **XSS Protection**: Content properly escaped

### Production Deployment

- Use HTTPS in production
- Enable authentication tokens
- Configure appropriate CORS origins
- Set up monitoring and logging

## Future Enhancements

### Planned Features

- **Real-time WebSocket Updates**: Live data streaming
- **Advanced Analytics**: Charts and graphs
- **Export Functionality**: CSV/JSON export
- **User Preferences**: Customizable UI settings
- **Mobile App**: React Native version
- **Data Visualization**: Timeline and flow views

### API Extensions

- **GraphQL Support**: Efficient data queries
- **Webhook Integration**: Event notifications
- **Bulk Operations**: Batch data management
- **Advanced Filtering**: More query options

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review browser console for errors
3. Verify API server status
4. Consult the main dualstore-http documentation

---

**Built with ❤️ for the Promethean ecosystem**
