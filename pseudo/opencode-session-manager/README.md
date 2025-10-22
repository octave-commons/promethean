# OpenCode Session Manager

A web components-based session management interface built with ClojureScript and the OpenCode SDK.

## 🚀 Features

- **Web Components**: Framework-agnostic custom elements for maximum reusability
- **ClojureScript**: Functional programming with Reagent and Re-frame
- **OpenCode SDK Integration**: Full API integration for session management
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Real-time Updates**: Live session status and messaging
- **Modern UI**: Clean, intuitive interface with smooth animations

## 📦 Components

### `<session-manager>`

The main component that displays and manages all sessions.

**Attributes:**

- `sessions` - Array of session objects
- `loading` - Boolean loading state
- `error` - Error message string

**Events:**

- `session-created` - Fired when a new session is created
- `session-deleted` - Fired when a session is deleted
- `session-selected` - Fired when a session is selected

### `<session-card>`

Individual session display with actions.

**Attributes:**

- `session` - Session object
- `selected` - Boolean selection state

**Events:**

- `click` - Session selection
- `delete` - Session deletion
- `prompt` - Send prompt to session

### `<create-session-modal>`

Modal for creating new sessions.

**Attributes:**

- `visible` - Boolean visibility state

**Events:**

- `create` - Session creation
- `cancel` - Modal cancellation

## 🛠 Installation

```bash
# Clone the repository
git clone <repository-url>
cd opencode-session-manager

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 Usage

### Basic Setup

```html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="css/styles.css" />
  </head>
  <body>
    <session-manager id="manager"></session-manager>
    <script src="js/main.js"></script>
  </body>
</html>
```

### JavaScript Integration

```javascript
// Get the session manager element
const manager = document.querySelector('session-manager');

// Load sessions from OpenCode
const { createOpencodeClient } = await import('@opencode-ai/sdk');
const client = await createOpencodeClient();
const sessions = await client.session.list();

// Set sessions on the manager
manager.sessions = sessions;

// Listen for events
manager.addEventListener('session-created', async (e) => {
  const sessionData = e.detail;
  const newSession = await client.session.create({ body: sessionData });
  console.log('Session created:', newSession);
});

// Handle session creation
manager.onCreateSession = async (sessionData) => {
  return await client.session.create({ body: sessionData });
};
```

### ClojureScript Integration

```clojure
(ns my-app.core
  (:require [reagent.core :as r]
            [re-frame.core :as rf]))

(defn session-manager []
  (let [sessions (rf/subscribe [::subs/sessions])
        loading? (rf/subscribe [::subs/loading?])]
    [:session-manager
     {:sessions @sessions
      :loading @loading?
      :on-create-session #(rf/dispatch [::events/create-session %])
      :on-delete-session #(rf/dispatch [::events/delete-session %])}]))
```

## 🎯 Development

### Project Structure

```
src/
├── app/
│   ├── core.cljs              # Main application entry point
│   ├── events.cljs            # Re-frame events
│   ├── subs.cljs              # Re-frame subscriptions
│   ├── views.cljs             # Reagent components
│   ├── opencode/
│   │   └── client.cljs        # OpenCode SDK wrapper
│   └── webcomponents/
│       ├── session_manager.cljs
│       ├── session_card.cljs
│       └── create_session_modal.cljs
public/
├── index.html                 # Main HTML file
├── css/
│   └── styles.css             # Application styles
└── js/                        # Compiled JavaScript output
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run repl` - Start ClojureScript REPL
- `npm run server` - Start Shadow-CLJS server

### Configuration

The project uses Shadow-CLJS for compilation. See `shadow-cljs.edn` for configuration options.

## 🔌 OpenCode Integration

This session manager requires a running OpenCode server. Make sure you have:

1. OpenCode installed: `npm install -g @opencode-ai/cli`
2. Server running: `opencode`
3. Proper authentication configured

### SDK Methods Used

- `client.session.list()` - List all sessions
- `client.session.create()` - Create new session
- `client.session.delete()` - Delete session
- `client.session.get()` - Get session details
- `client.session.prompt()` - Send prompt to session

## 🎨 Styling

The components use CSS custom properties for theming:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --background-color: #f5f5f5;
  --text-color: #333;
  --border-radius: 8px;
  --transition: all 0.3s ease;
}
```

## 📱 Responsive Design

The interface is fully responsive with breakpoints at:

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Related Projects

- [OpenCode](https://opencode.ai) - AI-powered development environment
- [Reagent](https://reagent-project.github.io/) - ClojureScript wrapper for React
- [Re-frame](https://github.com/day8/re-frame) - ClojureScript framework for data-driven applications
- [Shadow-CLJS](https://shadow-cljs.org/) - ClojureScript compilation tool
