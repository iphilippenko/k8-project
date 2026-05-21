## Context

This change introduces a small full-stack application rather than extending an existing capability. The frontend must use React without an additional state manager, and the backend must use Node.js with Fastify and PostgreSQL configured through `DATABASE_URL`. The app also needs operational endpoints for liveness and readiness so it can run cleanly in orchestrated environments.

## Goals / Non-Goals

**Goals:**
- Provide a minimal bookmark workflow: list, create, and delete bookmarks.
- Keep the frontend state model simple by using component-local React state and direct `fetch` calls.
- Persist bookmarks in PostgreSQL with a schema that stores URL, optional title, and creation timestamp.
- Expose a lightweight liveness endpoint and a readiness endpoint that verifies database connectivity.

**Non-Goals:**
- Editing bookmarks after creation.
- Authentication, per-user data isolation, or sharing.
- Pagination, filtering, tagging, or bulk actions.
- Optimistic UI updates or advanced client-side caching.

## Decisions

Use a two-part architecture with a React SPA frontend and a Fastify JSON API backend. This matches the requested stack directly and keeps responsibilities separated: the browser renders and manages user interactions while Fastify validates input, talks to PostgreSQL, and returns normalized JSON responses.

Store bookmarks in a single PostgreSQL table with an auto-generated identifier, required URL, nullable title, and server-generated creation timestamp. Using the database timestamp avoids clock skew between clients and makes the displayed "date of addition" consistent regardless of where the request originated.

Implement the frontend with local React state only: one state bucket for the current form values, one for the bookmarks list, and lightweight loading or error flags if needed. This satisfies the "no extra state managers" requirement and keeps the code easy to audit for a small feature set.

Use basic `fetch` calls for `GET /bookmarks`, `POST /bookmarks`, and `DELETE /bookmarks/:id`. After a successful create, the frontend should reset the form state and refresh or update the list immediately. After a successful delete, the removed item should disappear from the rendered list without any confirmation modal.

Expose `GET /health` as a pure process-level liveness check that returns success if the application can serve requests. Expose `GET /ready` as a dependency-aware readiness check that performs a fast database validation query. Splitting these endpoints keeps liveness stable while still allowing the platform to stop routing traffic when PostgreSQL is unavailable.

## Risks / Trade-offs

- Database-first persistence adds setup overhead for a small app -> Mitigation: keep the schema to one table and minimize migration complexity.
- Refreshing the list after mutations is simpler than optimistic updates but may add an extra request -> Mitigation: accept the extra round trip for clarity and correctness in a minimal app.
- Readiness checks that hit the database can create probe load -> Mitigation: use a trivial query and keep the endpoint implementation lightweight.
- URL validation can become over-engineered -> Mitigation: validate only that the link is present and structurally usable as a URL, without adding broad normalization rules in the first version.

## Migration Plan

Create the bookmarks table before starting the service in shared environments. Deploy the backend with `DATABASE_URL` configured, verify `/health` returns success, and verify `/ready` transitions to success once PostgreSQL is reachable. The frontend can then be deployed against the API base URL. Rollback is straightforward because the feature is additive; the application can be reverted to the previous version and the new table can remain unused if necessary.

## Open Questions

- None at proposal time; the minimal requirements are specific enough to implement directly.
