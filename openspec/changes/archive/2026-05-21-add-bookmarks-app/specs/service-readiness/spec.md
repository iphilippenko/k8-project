## ADDED Requirements

### Requirement: Service exposes liveness status
The backend SHALL expose a liveness endpoint at `/health` that returns a successful response when the application process is running and able to serve HTTP requests.

#### Scenario: Liveness probe succeeds
- **WHEN** a client sends a request to `/health` while the service is running
- **THEN** the service returns a success response indicating liveness

### Requirement: Service exposes readiness status
The backend SHALL expose a readiness endpoint that verifies PostgreSQL availability before reporting the service as ready to receive traffic.

#### Scenario: Readiness probe succeeds
- **WHEN** PostgreSQL is reachable through `DATABASE_URL`
- **THEN** the readiness endpoint returns a success response indicating the service is ready

#### Scenario: Readiness probe fails when database is unavailable
- **WHEN** PostgreSQL cannot be reached or validated
- **THEN** the readiness endpoint returns a non-success response indicating the service is not ready
