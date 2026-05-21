## Why

The project needs a minimal production-oriented bookmarks application that covers the core user flow end to end: saving links, listing them, and removing them. The same change also needs basic operational endpoints and PostgreSQL-backed persistence so the app can run in a containerized environment with health probes and secret-managed configuration.

## What Changes

- Add a React frontend that displays saved bookmarks, including the date each bookmark was added.
- Add a bookmark creation form with a required link field and an optional title field.
- Clear the form after a successful bookmark creation request without requiring a confirmation step.
- Add a delete action next to each bookmark list item without requiring a confirmation step.
- Add a Fastify backend with endpoints to list, create, and delete bookmarks.
- Persist bookmarks in PostgreSQL using `DATABASE_URL` for connection configuration.
- Add `/health` and readiness endpoints for liveness and dependency readiness checks.

## Capabilities

### New Capabilities
- `bookmark-management`: Create, list, and delete bookmarked links through a React UI backed by a Fastify API and PostgreSQL persistence.
- `service-readiness`: Expose liveness and readiness endpoints suitable for platform probes, including database readiness validation.

### Modified Capabilities
- None.

## Impact

- Adds a frontend React application using local component state and `fetch`.
- Adds a Node.js/Fastify backend API and PostgreSQL access layer.
- Requires database schema creation for bookmarks storage.
- Requires runtime configuration through `DATABASE_URL`.
