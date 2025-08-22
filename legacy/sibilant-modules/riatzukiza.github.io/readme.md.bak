# Portfolio Games and Framework

This repository hosts the source for my portfolio site at <https://riatzukiza.github.io>. The site showcases browser-based demos built with a custom game framework written in [Sibilant](https://sibilant.org/).

## Project Overview

Sibilant modules and HTML templates in `src/` compile into the `static/` directory. A small Node server under `src/server/` serves the compiled files. Shared modules in `src/shared/` implement an entity–component–system, math utilities and rendering helpers. Client-side games live in `src/client/`.

Build scripts in `dev/` bundle dependencies, compile Sibilant modules to JavaScript and watch for changes. The generated site can be viewed locally or deployed from the `static/` directory.

## Repository Layout

```
dev/            – build and watch scripts
docs/           – auto-generated documentation
inc/            – Sibilant macros and utilities
headers/        – macro header files
scripts/        – entry points for development
server/         – compiled server code
src/
    client/     – browser games
    server/     – Sibilant server implementation
    shared/     – game framework modules
    templates/  – HTML templates
static/         – compiled HTML/JS for deployment
```

## Getting Started

Install dependencies and start the development environment:

```bash
npm install
npm run dev:start      # start the server
npm run dev:watch       # watch and recompile on changes
```

The site will be available at `http://localhost:5000` when running locally.

## Kanban

Project progress is tracked using a [kanban board](kanban/board.md). See [project details](kanban/project.md) for more information.

## License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
