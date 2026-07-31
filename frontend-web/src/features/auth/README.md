# Authentication

Handles login and session management for all application roles (user, doctor, clinic).

## Used By

- Guest

## Pages

- Login (`Login.tsx`)
- Mobile Login (`MobileLogin.tsx`)

## Services

- `session` - session persistence backed by the real backend (`apident:user` in localStorage), plus `getSession`, `clearSession`, `updateSessionProfile`, `getDefaultDashboardPath`
- `sessionTtl` - session expiry and last-active tracking

## Notes

- Sessions come from the real backend (`POST /api/auth/login`, `POST /api/auth/register`); tokens are stored in `apident:token` and the serialized user in `apident:user`.
- Role type (`AuthSession`) is derived from `AppRole` in `src/authorization/roles.ts`.
- Default dashboard paths are owned by `src/authorization/roles.ts`.
