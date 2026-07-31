# Authentication

Handles login and session management for all application roles (user, doctor, clinic).

## Used By

- Guest

## Pages

- Login (`Login.tsx`)
- Mobile Login (`MobileLogin.tsx`)

## Services

- `demoAuth` - demo credential store, session persistence, login/register/reset
- `sessionTtl` - session expiry and last-active tracking

## Notes

- Role type (`DemoRole`) is an alias of `AppRole` from `src/authorization/roles.ts`.
- Default dashboard paths are owned by `src/authorization/roles.ts`.
