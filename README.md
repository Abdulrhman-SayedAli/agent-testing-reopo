# Safari Social API

Modular backend scaffold for a Facebook-like demo social-network API.

## Requirements

- Node.js 20 or newer
- npm

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Review the required configuration values:

   ```bash
   $EDITOR .env
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Check the health endpoint:

   ```bash
   curl http://localhost:3000/health
   ```

The endpoint should return `200 OK` with a small JSON payload. During startup, the API verifies PostgreSQL connectivity before it begins listening.

## Docker Local Development

Docker Compose can start the API, PostgreSQL, and Redis together for local development.

1. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

2. Review `.env` and replace local-only placeholders before sharing the file or using it outside development. The Compose stack reads `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`, `REDIS_PORT`, `PORT`, and the application secrets from this file.

3. Start the full stack:

   ```bash
   docker compose up --build
   ```

4. Check the API health endpoint:

   ```bash
   curl http://localhost:3000/health
   ```

5. Stop the stack while keeping database and cache data:

   ```bash
   docker compose down
   ```

6. Start it again with the persisted local data:

   ```bash
   docker compose up
   ```

The API container uses Docker service hostnames for internal networking: `postgres` for PostgreSQL and `redis` for Redis. `docker-compose.yml` overrides `DATABASE_URL` and `REDIS_URL` for the API container, so host-based values in `.env.example` continue to work for direct `npm run dev` usage.

Useful Docker commands:

- `docker compose ps` shows service status and health checks.
- `docker compose logs -f api` streams API logs.
- `docker compose down --volumes` removes local PostgreSQL and Redis data volumes.

## Scripts

- `npm run dev` starts the API in watch mode.
- `npm run build` compiles TypeScript into `dist/`.
- `npm start` runs the compiled production build.
- `npm run lint` checks code style with ESLint.
- `npm run format` checks formatting with Prettier.
- `npm run format:write` formats files with Prettier.
- `npm test` runs the test suite.

## Environment Variables

Environment variables are documented in `.env.example`, `docs/configuration.md`, and `docs/database.md`. Do not commit real `.env` files or secret values.

The application loads configuration through `src/config/env.ts`, validates required values at startup, and exposes grouped config sections for app, database, authentication, cache, security, logging, and storage settings.

## Database

PostgreSQL connection pooling, startup validation, graceful shutdown, and Docker connection behavior are documented in `docs/database.md`.

## Project Structure

```text
src/
  common/          Shared response helpers, errors, and cross-cutting primitives
  config/          Environment loading and application configuration
  database/        Database connection and migration placeholders
  middlewares/     Express middleware such as error handling and request context
  modules/         Feature modules such as auth, users, posts, and feed
  routes/          Route registration and top-level API composition
  utils/           Small utility functions
  validation/      Request validation schemas and helpers
tests/             Unit and integration tests
```
