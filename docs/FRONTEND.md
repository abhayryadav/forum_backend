# Frontend (Next.js) Notes

Location: `my-app/`

This project uses Next.js (app router) and React components. The UI provides authentication, task creation/listing, and commenting.

## Structure (key files)

- `src/app/page.js` — Main app container; checks session, renders header, and mounts TaskForm and TaskList.
- `src/app/layout.js` — Global layout and CSS imports.
- `src/app/components/CommentSection.js` — Fetches and displays comments for a task; allows posting and deletion with permission checks.
- `src/app/components/CommentForm.js` — Simple form used to submit new comments.
- `src/app/TaskList/` — Task listing pages and components.

## Environment notes

- The frontend uses `NEXT_PUBLIC_URL` in some places to build API URLs.
- Several files currently contain hard-coded backend host (`http://13.222.160.28:5000`). Replace these with `process.env.NEXT_PUBLIC_URL` (and include port) for easier local dev.

## Authentication flow (client-side)

1. User logs in via a Login component which calls backend auth endpoint.
2. Backend returns JWT which the client stores in `localStorage` under key `tftoken` and user info in `tfuser`.
3. The main app checks `tftoken` on mount by calling `/api/auth/verify-token` on backend.
4. Components include the token in `Authorization` headers for protected API requests.

## Key UI behaviours

- Comments: The `CommentSection` component:
  - GETs comments for a task using `/api/comments/task/:taskId`.
  - POSTs to `/api/comments` for creating.
  - Deletes via `/api/comments/:id` when owner/admin.
  - Uses `tfuser` from localStorage to determine ownership and email.

## Running & building

- Install: `npm install`
- Dev: `npm run dev`
- Build for production: `npm run build` and `npm run start` to serve.

## Improvements

- Externalize API base URL fully via `NEXT_PUBLIC_URL`.
- Validate and sanitize user input before sending to backend.
- Replace localStorage usage with a secure solution if deploying to production (secure cookies for JWT recommended).
