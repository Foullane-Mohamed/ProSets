# Project Execution Plan: Digital Assets Marketplace (ResQ/ProSets Architecture)
**Role:** Senior Full Stack Engineer & Architect
**Stack:** NestJS (Backend), Next.js App Router (Frontend), PostgreSQL (Prisma), Auth0, Stripe, AWS S3
**Current State:** `backend` (NestJS) and `frontend` (Next.js) folders are initialized.

---

## Goals
- Build a secure marketplace for digital assets (3D models, code snippets, templates).
- Provide user auth (Auth0), payment flow (Stripe), file storage (S3), and a clean API (NestJS + Prisma).
- Fast developer DX with local dev scripts, seed data, and clear env var requirements.

## High-level Architecture
- Frontend: Next.js (App Router) — UI, client-side hooks for auth, pages for library, dashboard, sell flows. Uses `@auth0/nextjs-auth0` client/server pieces.
- Backend: NestJS API — REST or GraphQL endpoints for assets, orders, payments, storage signed-URLs; uses Prisma for PostgreSQL access.
- Auth: Auth0 for authentication and sessions.
- Payments: Stripe for checkout and webhooks handled by backend.
- Storage: AWS S3 for asset files; backend issues pre-signed URLs for uploads/downloads.

## Repo / Folder summary
- `backend/` — NestJS app
  - `src/` — controllers, modules (asset, auth, order, payment, storage), Prisma integration
  - `prisma/` — schema.prisma, seed.ts, migrations
  - `package.json`, tsconfig, README
- `frontend/` — Next.js App Router
  - `app/` — routes, API routes under `app/api/` (Auth0 token endpoints, auth hooks)
  - `lib/` — helpers (notably `auth0.ts` and `api-client.ts`)
  - `components/`, `public/`, `styles`
  - `proxy.ts` — middleware proxying to Auth0 middleware

## Required environment variables (local & production)
**Frontend (.env)**:
- AUTH0_SECRET — **critical**: a long random secret (64 hex chars) used by Auth0 SDK for session encryption/signing
- AUTH0_ISSUER_BASE_URL — Your Auth0 domain (e.g., https://dev-abc123.us.auth0.com)
- AUTH0_BASE_URL — Your application's base URL (e.g., http://localhost:3000 for local dev)
- AUTH0_CLIENT_ID — Your Auth0 application client ID
- AUTH0_CLIENT_SECRET — Your Auth0 application client secret
- AUTH0_AUDIENCE — (optional) Your Auth0 API identifier for access tokens
- NEXT_PUBLIC_BASE_URL — Frontend URL (for your app logic)
- NEXT_PUBLIC_API_URL — Backend API URL (e.g., http://localhost:3001)
- NEXT_PUBLIC_STRIPE_KEY — Stripe publishable key (pk_test_... or pk_live_...)

**Backend (.env)**:
- DATABASE_URL — PostgreSQL connection string (Prisma)
- AUTH0_ISSUER_URL — Your Auth0 domain (for JWT validation)
- AUTH0_AUDIENCE — Your Auth0 API identifier
- STRIPE_SECRET_KEY — Stripe secret key (sk_test_... or sk_live_...)
- STRIPE_WEBHOOK_SECRET — Stripe webhook signing secret (whsec_...)
- AWS_ACCESS_KEY_ID — AWS access key for S3
- AWS_SECRET_ACCESS_KEY — AWS secret key for S3
- AWS_REGION — AWS region (e.g., us-east-1)
- AWS_S3_BUCKET — S3 bucket name
- PORT — Backend port (default: 3001)

**Important**: The Auth0 SDK expects specific variable names. Using the wrong names (like `NEXT_PUBLIC_BASE_URL` instead of `AUTH0_BASE_URL`) will cause errors like "Missing: appBaseUrl" or "JWEInvalid".

Note: `AUTH0_SECRET` must be a string (e.g. 64 hex characters). If missing or invalid you can encounter crypto errors like: "'ikm' must be an instance of Uint8Array or a string". See Troubleshooting below.

## Local setup (Windows / cmd.exe)
1. Install dependencies (both root projects):
   - Backend: open a terminal in `backend` and run:
     - npm install
   - Frontend: open a terminal in `frontend` and run:
     - npm install

2. Generate an `AUTH0_SECRET` (one-off):
   - Using Node (works in cmd.exe):
     - node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   - Set for current session:
     - set AUTH0_SECRET=your_generated_secret
   - Persist (Windows):
     - setx AUTH0_SECRET "your_generated_secret"

3. Set other env vars in your terminal or via a .env file consumed by tooling (Next.js will load .env.local). Example `.env.local` at `frontend`:
   ```env
   AUTH0_SECRET=the_hex_secret_from_step_2
   AUTH0_ISSUER_BASE_URL=https://dev-tqdtd5i3kwmtcij6.us.auth0.com
   AUTH0_BASE_URL=http://localhost:3000
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   AUTH0_AUDIENCE=https://dev-tqdtd5i3kwmtcij6.us.auth0.com/api/v2/
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```
   
   **Important**: Use `AUTH0_BASE_URL` (not `APP_BASE_URL` or `NEXT_PUBLIC_BASE_URL`) for the Auth0 SDK.

4. Run dev servers:
   - Backend (from `backend`): npm run start:dev (or npm run start)
   - Frontend (from `frontend`): npm run dev

## How to run the app
- Start backend and frontend concurrently in separate terminals.
- Visit frontend at http://localhost:3000 and use Auth0 login flow for protected routes.

## Auth0: common pitfalls & the "'ikm' must be an instance of Uint8Array or a string" error
- Root cause: the Auth0 SDK needs a valid secret for cryptographic operations. If `AUTH0_SECRET` is undefined or not a valid string/bytes, the underlying crypto primitives will throw opaque errors referencing internal parameter names like `ikm`.
- Fix: ensure `AUTH0_SECRET` is set (see generation above). Do not pass `undefined`.
- Also ensure you use the correct Auth0 SDK construct for your runtime (server vs edge). The project currently uses the server SDK (`@auth0/nextjs-auth0/server`) and the middleware call path expects an exported `auth0` client with `.middleware()`.

## Code fixes applied in this workspace (what I changed to improve error handling)
- `frontend/lib/auth0.ts`
  - Simplified to export auth0Config object with environment variables
  - Removed dependency on Auth0Client which had missing methods
- `frontend/app/api/auth/login/route.ts`
  - Created simple login route that redirects to Auth0 authorization endpoint
- `frontend/app/api/auth/logout/route.ts`
  - Created logout route that clears session cookies and redirects to home
- `frontend/app/api/auth/callback/route.ts`
  - Created callback route to handle Auth0 OAuth callback (TODO: complete token exchange)
- `frontend/app/api/auth/[auth0]/route.ts`
  - Simplified to temporary handler (being replaced by specific routes above)
- `frontend/proxy.ts`
  - This file exists but is not currently used in the middleware chain

**Note**: The Auth0 integration is now using basic OAuth 2.0 flow with manual routes. The `@auth0/nextjs-auth0` SDK v4.14.1 has a different API structure than expected. For production, consider:
1. Using the SDK's built-in handlers if available in newer versions
2. Completing the token exchange in the callback route
3. Implementing proper session management with encrypted cookies

If you still see the original runtime TypeError after setting `AUTH0_SECRET`:
- Restart the Next.js dev server (environment variables are read at process start).
- Confirm `process.env.AUTH0_SECRET` is defined inside the running process (e.g., add a temporary console.log in `frontend/lib/auth0.ts`).

## Backend: Prisma / DB
- Migrations are present under `backend/prisma/migrations/`.
- Use `npx prisma migrate dev` (run from `backend`) to apply and generate the client.
- Seed script present at `backend/prisma/seed.ts` — run as configured in `package.json` (e.g., `npm run prisma:seed`).

## Payments / Stripe
- Backend contains payment modules and Stripe integration. Configure `STRIPE_KEY` and `STRIPE_WEBHOOK_SECRET`.
- Use Stripe CLI for local webhook testing or ngrok to expose webhook endpoints.

## Storage (AWS S3)
- Backend `storage` module returns pre-signed upload URLs.
- Configure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `S3_BUCKET`.

## Testing
- Backend: jest/e2e tests in `backend/test`.
- Frontend: add React Testing Library / Playwright as needed.

## Deployment notes
- Build steps:
  - Backend: npm run build then start with a process manager (PM2, Docker, or serverless depending on target).
  - Frontend: next build then next start (or deploy to Vercel / Cloudflare Pages).
- Ensure production env vars are set (AUTH0_SECRET, DB, STRIPE, AWS).

## Troubleshooting checklist for Auth0 errors

### Error: "'ikm' must be an instance of Uint8Array or a string"
**Cause**: `AUTH0_SECRET` is missing or undefined.
**Fix**: 
1. Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Add to `frontend/.env`: `AUTH0_SECRET="generated-hex-string"`
3. Restart the dev server

### Error: "Missing: domain" or "Missing: appBaseUrl"
**Cause**: Auth0 SDK can't find required configuration.
**Fix**: Ensure these variables are set in `frontend/.env`:
- `AUTH0_ISSUER_BASE_URL="https://your-domain.auth0.com"` (for domain)
- `AUTH0_BASE_URL="http://localhost:3000"` (for appBaseUrl)

**Note**: The SDK looks for `AUTH0_BASE_URL`, NOT `APP_BASE_URL` or `NEXT_PUBLIC_BASE_URL`.

### Error: "JWEInvalid: Invalid Compact JWE"
**Cause**: Auth0 SDK is misconfigured or missing required env vars.
**Fix**:
1. Verify all required Auth0 env vars are set (see list above)
2. Ensure `AUTH0_BASE_URL` matches your frontend URL
3. Restart the Next.js dev server
4. Clear browser cookies and try logging in again

### General checklist:
1. Verify `AUTH0_SECRET` is set (not empty). If empty, generate one (see Local setup).
2. Verify `AUTH0_BASE_URL` is set to your frontend URL (e.g., http://localhost:3000)
3. Restart the frontend dev server after setting env vars.
4. Confirm `frontend/lib/auth0.ts` exports `auth0` and `frontend/proxy.ts` calls `auth0.middleware(request)`.
5. If running into module resolution issues for edge vs server SDKs, ensure `@auth0/nextjs-auth0` version installed supports your chosen environment and imports (`/server` vs `/edge`).

---

If anything else needs to be documented (CI/CD, Docker, environment-specific guides), state the target platform and I will extend this plan accordingly.

