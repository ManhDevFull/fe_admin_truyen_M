# Admin Frontend (Next.js)

## Prerequisites
- Node.js 20+
- npm

## Config
Copy env file and edit:
- `cp .env.example .env.local`

Environment variables:
- `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`)

## Run Local
From `admin-frontend/`:
- Install deps: `npm install`
- Dev server: `npm run dev`

App URL:
- http://localhost:3001

## Test Local
No automated tests yet.

## Build
From `admin-frontend/`:
- `npm run build`
- `npm start -p 3001`

## Deploy (Docker)
From repo root:
- `docker compose up -d --build admin-frontend`

## Notes
- Admin UI uses the same login endpoint as public.
- You need an admin role user in the database.
- Allowed roles: `owner`, `admin`, `staff`.
