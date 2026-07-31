# Architecture

## Overview

The repository contains Laravel at the root and two independent client applications:

- repository root is the Laravel API. Its Composer manifest and only PHP dependency directory are `composer.json` and `vendor/`.
- `frontend-web/` is the Vite/React application. Its Worker configuration, when used, is also contained in this project.
- `mobile-native/` is the independent React Native application.

The root no longer owns a Composer application or a PHP vendor directory.

## Frontend layout

```text
frontend-web/
  src/
  app/                 application composition and route registration
  components/          reusable, presentation-oriented components
    ui/                shared primitives
    layout/            header and footer
    routing/           route guards and route helpers
    notification/      cross-feature notification presentation
    pwa/               PWA integration
  features/            business domains
    auth/
    consultation/
    dashboard/
    doctors/
    home/
    marketing/
    membership/
    mobile/
    profile/
    reservation/
  shared/
    lib/               API clients, session utilities, formatting and cross-feature helpers
  styles/              global styles
  worker/              Cloudflare Worker entry point
  main.tsx             browser entry point
```

## Design rules

- Put domain pages, feature-specific components, and domain API orchestration in `features/<domain>/`.
- Put generic and reusable presentation components in `components/`. They must not import feature business logic.
- Put cross-feature infrastructure in `shared/lib/`; it must not import feature UI.
- Keep routing registration in `app/App.tsx` and browser bootstrap in `main.tsx`.
- Use the `@/` alias for all frontend imports. It resolves to `src/` in Vite and TypeScript.
- Use PascalCase for React component files and camelCase for utility modules.

## Compatibility and tooling

The Vite and TypeScript configuration contain explicit aliases for legacy grouping names such as `@/components/dashboard` and `@/pages/booking`. They resolve to their feature locations, allowing incremental migration while keeping behavior unchanged. New code should import from the physical `features/` or `components/` path.

Tailwind scans all `frontend-web/src/` source files. The frontend build remains
`npm run build` from `frontend-web/` and writes deployable assets to
`../public_html/`; Laravel commands run from the repository root. In shared
hosting, `deploy.sh` serves API requests through `/api` and static uploads
through `/storage`.
