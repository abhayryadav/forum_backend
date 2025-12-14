# API Reference

This document describes the HTTP API exposed by the backend in `backend/`. The API is mounted under `/api/*`.

Note: All endpoints that modify or read user-specific data require authentication using a Bearer JWT token passed in the `Authorization` header.

Authorization header example:

  Authorization: Bearer <token>

## Auth endpoints

Endpoints for signing up, signing in, verifying tokens, and logging out are implemented under `/api/auth` (see `backend/routes/auth.js`). Typical flows:

- POST /api/auth/signup — create a new user.
- POST /api/auth/login — returns a JWT on successful login.
- GET /api/auth/verify-token — verify token and return user data.
- POST /api/auth/logout — invalidates session (if implemented).

Request/response shapes depend on backend implementation. The JWT payload contains at least `id` and `role`.

## Task endpoints

Tasks are available under `/api/tasks` (see `backend/routes/task.js`). Typical endpoints:

- GET /api/tasks — list tasks (may include user filtering)
- POST /api/tasks — create a task (authenticated)
- GET /api/tasks/:id — get task by id
- PUT /api/tasks/:id — update task (owner/admin)
- DELETE /api/tasks/:id — delete task (owner/admin)

Task schema (from models/Task.js) will define exact fields. Ensure request bodies conform to the model.

## Comment endpoints

Comments are under `/api/comments` (see `backend/routes/comments.js`).

- GET /api/comments/task/:taskId — Get all comments for a task (authenticated)
  - Response: array of comments sorted by `createdAt` desc. Each comment includes `createdBy` (populated with username/email) and `createdAt`.

- POST /api/comments — Create a new comment (authenticated)
  - Request body: { text: string, task: ObjectId }
  - Response: created comment (populated `createdBy`)

- PUT /api/comments/:id — Update comment (owner only)
  - Request body: fields to update (e.g., { text: 'new text' })

- DELETE /api/comments/:id — Delete comment (owner or admin)

Errors use conventional HTTP status codes:

- 400 — Bad request / missing fields
- 401 — Unauthorized (missing or invalid token)
- 403 — Forbidden (not owner)
- 404 — Not found
- 500 — Internal server error

## Example: Fetch comments for a task

Request:

  GET /api/comments/task/645c... 
  Authorization: Bearer <token>

Response (200):

  [
    {
      "_id": "...",
      "text": "Great task",
      "task": "645c...",
      "createdBy": { "_id": "..", "email": "user@example.com" },
      "createdAt": "2025-12-14T..."
    }
  ]

## Notes

- The backend middleware `auth.requireAuth` verifies JWTs and attaches `req.user` and `req.superuser` when valid.
- Ensure `JWT_SECRET` and `MONGODB_URI` environment variables are set in the backend.
