# Technical Decisions — OmniList

**Live URLs**
- Frontend: https://omni-list-frontend.vercel.app
- Backend API: https://omnilist.onrender.com/api
- Swagger Docs: https://omnilist.onrender.com/api/docs

---

## Backend Framework — NestJS

I went with NestJS because I wanted structure out of the box. When you're building something with auth, roles, and multiple resource types, having a clear module/controller/service pattern matters. It also plays well with TypeScript natively, and the decorator-based approach made things like `@Roles()` and `@UseGuards()` feel clean rather than bolted on.

## State Management

Auth state lives in **Zustand** — small setup, persists to localStorage, no boilerplate. For everything else (listings, favorites, metrics) I used **TanStack Query** since it handles caching and refetching out of the box. No need to manually track loading states or stale data.

## Access Control

Three layers:
1. JWT guard checks if the token is valid
2. Roles guard checks if the user's role is allowed on that route
3. Inside the service, ownership is verified — so an OWNER can't touch another OWNER's listing even if they have the right role

Admins bypass ownership checks entirely.

## Hardest Challenge

CORS. Everything looked fine locally, but in production, POST requests (login, upload) were silently blocked while GET requests worked. The issue was a mismatch between what Vercel was sending as the `Origin` header and what Render had in `FRONTEND_ORIGIN`. Took some time to diagnose because the error only shows up in the browser console, not in backend logs.
