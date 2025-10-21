# Opencode ClojureScript Electron

A Spacemacs-like Opencode client built with ClojureScript, combining the power of Emacs-style editing with modern web technologies and AI agent integration.

## Overview

Opencode ClojureScript Electron is a sophisticated text editor that brings together:

- **Spacemacs-inspired UI**: Familiar keybindings and workflow for Emacs users
- **Evil mode**: Vim-style modal editing for efficient text manipulation
- **Electron framework**: Cross-platform desktop application with native file system access
- **Opencode SDK integration**: Seamless communication with AI agents and tools
- **Plugin system**: Extensible architecture with hot-reloading support
- **Multi-target builds**: Supports both desktop (Electron) and web deployment

## Features

### Core Editor Features

- **Modal editing** with Evil mode (Normal, Insert, Visual modes)
- **Spacemacs-style keybindings** with leader key sequences
- **Buffer management** with tab-based interface
- **File operations** with native file system integration
- **Search and navigation** with regex support
- **Undo/redo** system with full history tracking

### Opencode Integration

- **AI agent communication** through Opencode SDK
- **Tool execution** with real-time feedback
- **Session management** for persistent agent interactions
- **File operations** via Opencode tools
- **Command palette** integration for Opencode commands

### UI/UX Features

- **Dark/Light themes** with CSS custom properties
- **Responsive layout** with resizable panels
- **Status bar** with mode and cursor information
- **Which-key popup** for keybinding discovery
- **Minimap** for code navigation
- **Command palette** for quick command access

### Development Features

- **Hot module replacement** during development
- **Multi-target compilation** (renderer, main, preload, server)
- **Plugin system** with dynamic loading
- **Workspace persistence** with auto-save
- **Developer tools** integration

## Architecture

### Electron Process Model

The application follows Electron's multi-process architecture:

#### Main Process (`electron/main.cljs`)

- Creates and manages application windows
- Handles file system operations
- Manages plugin lifecycle
- Provides IPC (Inter-Process Communication) handlers
- Implements menu and window controls

#### Preload Script (`electron/preload.cljs`)

- Secure bridge between main and renderer processes
- Exposes safe APIs via `contextBridge`
- Handles file operations, window management, and plugin communication

#### Renderer Process (`src/main.cljs`, `src/app/`)

- User interface and editor logic
- Evil mode implementation
- Opencode SDK integration
- State management with Reagent atoms

### Core Modules

#### `app/state.cljs`

Global application state management using Reagent atoms:

- Buffer management
- Evil mode state
- UI preferences
- Opencode connection state
- Workspace persistence

#### `app/evil.cljs`

Complete Evil mode implementation:

- Modal editing (Normal, Insert, Visual)
- Text manipulation commands
- Movement operations
- Search and navigation
- Register system

#### `app/keymap.cljs`

Spacemacs-style keybinding system:

- Leader key sequences
- Mode-specific bindings
- Which-key integration
- Global keybindings

#### `app/opencode.cljs`

Opencode SDK integration:

- API communication
- Agent management
- Tool execution
- File operations through Opencode
- Session handling

#### `app/ui.cljs`

React-based UI components:

- Main application layout
- Theme system
- Component lifecycle
- Event handling

#### `app/layout.cljs`

Layout components:

- Header with menu bar
- Sidebars (file tree, plugins)
- Tab bar
- Status bar
- Command palette
- Minimap

#### `app/buffers.cljs`

Buffer management:

- File operations
- Buffer lifecycle
- Editor component
- Command palette integration

#### `app/env.cljs`

Environment abstraction:

- Platform detection
- API availability checks
- Cross-platform compatibility

## Installation

### Prerequisites

- Node.js 16+
- Clojure CLI tools
- Java 11+ (for ClojureScript compilation)

### Setup

1. **Clone and navigate to the package:**

   ```bash
   cd packages/opencode-cljs-electron
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Install Clojure dependencies:**
   ```bash
   clojure -P -M:dev
   ```

## Development

### Development Modes

#### Electron Development

```bash
# Start development with hot reload
npm run dev

# Start Electron app
npm run electron

# Or start both in parallel
npm start
```

#### Web Server Development

```bash
# Start web development server
npm run dev:server

# Start Node.js server
npm run server

# Or start both in parallel
npm run start:server
```

### Build Targets

The application supports multiple build targets configured in `shadow-cljs.edn`:

- **`:renderer`**: Browser-based UI (for web deployment)
- **`:main`**: Electron main process
- **`:preload`**: Electron preload script
- **`:server`**: Node.js HTTP server

### Building for Production

```bash
# Build Electron app
npm run build:app

# Build web version
npm run build:server

# Package Electron app
npm run pack

# Create distributable
npm run dist
```

## Usage

### Basic Editing

#### Evil Mode Basics

- **Normal mode**: Default mode for navigation
- **Insert mode**: For text editing (press `i` to enter)
- **Visual mode**: For text selection (press `v` to enter)

#### Movement

- `h`, `j`, `k`, `l`: Left, down, up, right
- `w`, `b`: Word forward/backward
- `0`, `$`: Beginning/end of line
- `gg`, `G`: Beginning/end of buffer

#### Text Editing

- `i`: Enter insert mode
- `a`: Append after cursor
- `o`, `O`: Open new line below/above
- `dd`: Delete line
- `yy`: Yank (copy) line
- `p`, `P`: Paste after/before cursor

### Spacemacs Keybindings

The application uses Spacemacs-style leader key sequences with `SPC` as the leader:

#### File Operations (`SPC f`)

- `SPC f f`: Find file
- `SPC f s`: Save file
- `SPC f w`: Save as
- `SPC f b`: Switch buffer
- `SPC f k`: Kill buffer

#### Buffer Operations (`SPC b`)

- `SPC b b`: Switch buffer
- `SPC b n`: Next buffer
- `SPC b p`: Previous buffer
- `SPC b l`: List buffers

#### Window Operations (`SPC w`)

- `SPC w w`: Other window
- `SPC w s`: Split window
- `SPC w v`: Vertical split
- `SPC w c`: Close window

#### Opencode Integration (`SPC o`)

- `SPC o c`: Connect to Opencode
- `SPC o d`: Disconnect from Opencode
- `SPC o t`: List available tools
- `SPC o a`: Spawn new agent
- `SPC o e`: Execute tool
- `SPC o s`: Show Opencode status

### Opencode Integration

#### Connecting to Opencode

1. Ensure Opencode server is running on `http://localhost:3000`
2. Use `SPC o c` or the command palette to connect
3. The editor will automatically create a session

#### Working with Agents

1. Spawn an agent: `SPC o a`
2. Choose agent type and provide prompt
3. A dedicated chat buffer will be created
4. Type messages and use `C-c C-c` to send

#### Executing Tools

1. Execute a tool: `SPC o e`
2. Enter tool name and JSON parameters
3. Results appear in a dedicated tool execution buffer

#### File Operations via Opencode

- Files can be opened and saved through Opencode tools
- Enables remote file editing and AI-assisted file operations
- Integrates with buffer management system

## Configuration

### Environment Variables

- `PORT`: HTTP server port (default: 3000)
- `HOST`: HTTP server host (default: localhost)
- `NODE_ENV`: Environment (development/production)

### Application Settings

Settings are stored in the application state and persisted to localStorage:

- Theme preferences
- Font sizes
- UI layout options
- Keybinding customizations

### Opencode Configuration

Configure Opencode connection in `app/opencode.cljs`:

- Default endpoint: `http://localhost:3000`
- Session capabilities
- Tool execution options

## Plugin Development

### Plugin Structure

Plugins are stored in the user data directory under `plugins/`:

```
plugins/
├── my-plugin/
│   ├── manifest.json
│   ├── dist/
│   │   └── index.js
│   └── src/
```

### Plugin Manifest

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My custom plugin",
  "entry": "dist/index.js",
  "main": "src/main.js",
  "permissions": ["fs", "network"]
}
```

### Plugin API

Plugins can access:

- File system operations
- Opencode SDK
- UI components
- Buffer management
- Keybinding registration

## Troubleshooting

### Common Issues

#### Electron Won't Start

- Ensure Node.js dependencies are installed
- Check that `dist/` directory exists and contains compiled files
- Verify Electron is installed: `npm list electron`

#### Opencode Connection Fails

- Verify Opencode server is running on correct port
- Check network connectivity
- Review browser console for error messages

#### Hot Reload Not Working

- Ensure `shadow-cljs` is running in watch mode
- Check that file changes are being detected
- Verify WebSocket connection is active

#### Build Failures

- Clear shadow-cljs cache: `rm -rf .shadow-cljs/`
- Check Java version compatibility
- Verify all dependencies are installed

### Debug Mode

Enable debug mode by setting environment variable:

```bash
NODE_ENV=development npm start
```

This enables:

- Detailed logging
- Developer tools
- Hot module replacement
- Error stack traces

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make changes with hot reload enabled
4. Test thoroughly in both Electron and web modes
5. Submit pull request

### Code Style

- Follow ClojureScript conventions
- Use meaningful function and variable names
- Add docstrings to public functions
- Include type hints where appropriate

### Testing

- Test in both Electron and web environments
- Verify Opencode integration works correctly
- Check Evil mode functionality
- Test plugin loading and unloading

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

- Check the troubleshooting section
- Review the code documentation
- Open an issue on the project repository
- Join the community discussions

## Related Documentation

- [Shadow-cljs Documentation](https://shadow-cljs.github.io/docs/UsersGuide.html)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Reagent Documentation](https://reagent-project.github.io/)
- [Opencode SDK Documentation](https://opencode.ai/docs)
