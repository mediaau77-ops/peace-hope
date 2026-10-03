# Peace & Hope - Church Platform

## Active app status

The current repository is still running in its working single-app configuration with `npm run dev`.

A split scaffold has also been staged for the target architecture:

- `backend/` — Express.js in JavaScript
- `frontend/` — Next.js in TypeScript
- `docs/CONTRACT.md` — frozen route and endpoint contract for the future split

The live app remains usable while the migration scaffolding is introduced.

## TypeScript contract baseline

This project now follows the single-stack contract model:

- TypeScript is the only application language used in the repo.
- Shared contracts live in the `shared/` directory and are imported across frontend and backend code.
- API responses are wrapped with `ApiResult<T>` from `shared/api.ts`.
- Realtime payloads use the discriminated unions in `shared/realtime.ts`.
- The endpoint map is defined in `shared/endpoints.ts` and is the source of truth for typed API calls.
- The backend validates requests with Zod schemas from `shared/schemas/` before they reach services.

## Shared layer

The shared layer contains the canonical types used by both the app and the server:

- `shared/api.ts` — `ApiResult<T>`, `ApiError`, pagination types
- `shared/domain.ts` — domain entities and payloads
- `shared/realtime.ts` — SSE event contract
- `shared/roles.ts` — role and permission definitions
- `shared/endpoints.ts` — typed API map and request options
- `shared/schemas/` — request validation schemas
- `shared/mappers.ts` — `toCamel()` / `toSnake()` boundary helpers

## Frontend and backend contract

Frontend calls should use the typed `apiCall` helper from `lib/api-client.ts` instead of raw fetch calls. The backend route contracts are aligned with `shared/endpoints.ts`, and route handlers return the `ApiResult<T>` envelope with a consistent error contract.

## Environment configuration

Configure environment values using the canonical Next-style naming scheme, with server-only values kept private:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

## CI and verification

The pipeline runs `npm ci`, `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e`, `npm run build`, and `npm run verify:no-js`. The helper script fails if any JavaScript files appear under the application directories.

## Notes on resiliency

- The app normalizes Supabase URLs to prevent invalid path errors.
- Realtime channels degrade gracefully when unavailable.
- Public pages remain resilient via bounded error handling and isolated section boundaries.
