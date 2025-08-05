# Portfolio Site

This folder hosts the files for the personal portfolio originally maintained at [riatzukiza.github.io](https://github.com/riatzukiza/riatzukiza.github.io).
It has been migrated into Promethean as described in [docs/MIGRATION_PLAN.md](../docs/MIGRATION_PLAN.md).

## Prerequisites

The site uses Node.js and PM2. Install dependencies once after cloning:

```bash
npm install
```

## Developing Locally

Start the local server and automatic recompilation using the provided npm scripts:

```bash
npm run dev:start   # start the portfolio server via pm2
npm run dev:watch   # watch sources and rebuild on changes
```

When running, visit `http://localhost:5000` to view the portfolio.

## Building for Deployment

Compiled assets are written to the `static/` directory. If you only need a fresh build without starting the server, run:

```bash
npm run dev:compile
```

See the original repository for additional scripts and context.
