# k8-project

Minimal bookmarks app with:
- React client in `client/`
- Fastify server in `server/`
- PostgreSQL persistence via `DATABASE_URL`

## Prerequisites

- Node.js 24+
- npm 11+
- PostgreSQL running locally or reachable remotely

## Environment

Copy `.env.example` values into your shell or local env file setup:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bookmarks
PORT=3000
VITE_API_BASE_URL=http://localhost:3000
```

`DATABASE_URL` is required by the server.  
`VITE_API_BASE_URL` is used by the client to call the backend.

## Install Dependencies

From the repo root:

```bash
npm install
```

## Initialize Database

Create the `bookmarks` database and run the migrations in [server/db/migrations](/server/db/migrations).

Example:

```bash
createdb bookmarks
npm run migrate --workspace server
```

## Run Server

In one terminal from the repo root:

```bash
npm run dev:server
```

Server defaults to `http://localhost:3000`.

Useful endpoints:
- `GET /health`
- `GET /ready`
- `GET /bookmarks`

## Run Client

In a second terminal from the repo root:

```bash
npm run dev:client
```

Vite will print the local client URL, typically `http://localhost:5173`.

## Run Tests

Run all tests:

```bash
npm test
```

Run frontend build:

```bash
npm run build --workspace client
```
