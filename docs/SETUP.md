# Setup and Environment (Windows / PowerShell)

This file explains how to set up the project locally on Windows (PowerShell). Adjust commands and ports if you run services on different hosts.

## Prerequisites

- Node.js (18+) and npm installed
- Git
- MongoDB (local or a remote URI you can access)

## Backend (Express + MongoDB)

1. Open PowerShell and go to the backend folder:

   cd d:\var\backend

2. Copy `.env.example` to `.env` (if `.env.example` doesn't exist, create `.env`):

   # Example entries (create or update according to your environment)
   MONGODB_URI=mongodb://localhost:27017/taskflow
   JWT_SECRET=changeme
   PORT=5000

3. Install dependencies:

   npm install

4. Run in development with auto-reload (if `nodemon` is available):

   npx nodemon server.js

or just:

   node server.js

The server listens on the port defined in `PORT` (defaults to 5000).

## Frontend (Next.js)

1. Open a new PowerShell window and go to the frontend folder:

   cd d:\var\my-app

2. Create a local env file for Next (if necessary):

   # Example environment variables used in code
   NEXT_PUBLIC_URL=localhost

3. Install dependencies and run dev server:

   npm install
   npm run dev

The Next dev server runs on http://localhost:3000 by default. The frontend expects to reach the backend API at http://{BACKEND_HOST}:5000. By default, some components call `http://13.222.160.28:5000` — adjust to `http://localhost:5000` or your backend host by setting `NEXT_PUBLIC_URL` and/or updating fetch URLs.

## Notes on API host configuration

- Some frontend files include hard-coded backend addresses (e.g., `http://13.222.160.28:5000`). Search and replace with your backend host or change the code to use `process.env.NEXT_PUBLIC_URL` consistently.

## Running tests

From `d:\var\backend` run:

   npm test

This will run Jest tests (if any). Ensure MongoDB is running or tests mock the DB.

## Troubleshooting

- MongoDB connection errors: verify `MONGODB_URI` and connectivity.
- Invalid JWT errors: ensure `JWT_SECRET` is the same for token generation and verification.
- Frontend fetch failing: ensure backend CORS is enabled and frontend requests the correct host/port.
