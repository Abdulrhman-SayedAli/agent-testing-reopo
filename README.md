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

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Check the health endpoint:

   ```bash
   curl http://localhost:3000/health
   ```

The endpoint should return `200 OK` with a small JSON payload.

## Scripts

- `npm run dev` starts the API in watch mode.
- `npm run build` compiles TypeScript into `dist/`.
- `npm start` runs the compiled production build.
- `npm run lint` checks code style with ESLint.
- `npm run format` checks formatting with Prettier.
- `npm run format:write` formats files with Prettier.
- `npm test` runs the test suite.

## Environment Variables

Environment variables are documented in `.env.example`. Do not commit real `.env` files or secret values.

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
