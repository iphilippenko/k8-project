## 1. Project Setup

- [x] 1.1 Scaffold the React frontend and Fastify backend structure for the bookmarks application
- [x] 1.2 Add project dependencies and environment configuration support for Fastify, PostgreSQL access, and frontend API calls
- [x] 1.3 Create the bookmarks database schema or migration with id, link, optional title, and created_at fields

## 2. Backend Implementation

- [x] 2.1 Implement PostgreSQL connection initialization using `DATABASE_URL`
- [x] 2.2 Implement `GET /bookmarks` to return persisted bookmarks with id, link, optional title, and creation timestamp
- [x] 2.3 Implement `POST /bookmarks` with validation for required link input and persistence of new bookmarks
- [x] 2.4 Implement `DELETE /bookmarks/:id` to remove a saved bookmark
- [x] 2.5 Implement `/health` and readiness endpoints, including a database-backed readiness check

## 3. Frontend Implementation

- [x] 3.1 Build the bookmarks page layout with a visible add-bookmark form and bookmarks list
- [x] 3.2 Implement list loading with `fetch` and render each bookmark with link, optional title, date of addition, and adjacent delete action
- [x] 3.3 Implement bookmark creation with local React state, required-link validation, and form clearing after successful submission
- [x] 3.4 Implement bookmark deletion and update the rendered list without any confirmation flow

## 4. Validation

- [x] 4.1 Verify backend behavior for create, list, delete, liveness, and readiness endpoints
- [x] 4.2 Verify frontend behavior for required-link validation, form clearing on successful add, date visibility, and delete action placement
