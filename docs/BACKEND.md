# Backend Architecture and Notes

Location: `backend/`

This section explains the key parts of the Express backend and important implementation notes.

## Structure (important files)

- `server.js` — Entry point that loads `app.js` and starts the HTTP server.
- `app.js` — Express application configuration, middleware (CORS, body parser), mongoose connection, and route mounting.
- `routes/` — Route definitions for auth, tasks, comments.
- `controllers/` — Controllers with route handlers (example: `commentController.js`).
- `models/` — Mongoose models: `User.js`, `Task.js`, `Comment.js`.
- `services/` — Business logic and DB operations (e.g., `commentService.js`).
- `middleware/auth.js` — JWT generation and verification middleware that populates `req.user` and `req.superuser`.

## Data models (high-level)

- Comment (from `models/Comment.js`):
  - text: String (required)
  - task: ObjectId -> Task (required)
  - createdBy: ObjectId -> User (required)
  - createdAt: Date (default now)

- Task and User models exist under `models/` — see those files for exact fields.

## Services and controllers

The project follows a simple separation: controllers handle HTTP layer (req/res), while services encapsulate DB operations. Example: `commentController` calls `commentService.createComment`.

## Authentication

- JWT-based auth uses `auth.requireAuth` middleware.
- Tokens are expected in `Authorization: Bearer <token>` header.
- Middleware attaches `req.user` (user document without password) and `req.superuser` (boolean if user.role === 'admin').

## Patterns and notes

- Many routes populate fields (e.g., populate `createdBy`) to return user-friendly info.
- Error handling: controllers catch errors and return 500 with message. Improve by centralizing error handler if needed.

## Running & testing

- Install: `npm install`
- Dev server: `npx nodemon server.js` or `node server.js`
- Tests: `npm test` (exists in `devDependencies` as jest + supertest)

## TODOs / Improvements

- Use consistent environment variable usage in frontend instead of hard-coded backend host.
- Add unit tests for services (mock mongoose) and more integration tests.
- Add central error-handling middleware.
