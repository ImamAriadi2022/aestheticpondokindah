# Architecture

## Overview

The repository contains two deployable applications:

- `backend/` is the Laravel API. Its Composer manifest and only PHP dependency directory are `backend/composer.json` and `backend/vendor/`.
- `src/` is the Vite/React application. `src/worker/` remains a separate Cloudflare Worker entry point configured by `wrangler.json`.

The root no longer owns a Composer application or a PHP vendor directory.

## Frontend layout

```text
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

Tailwind scans all `src/` source files. Knip uses `src/main.tsx` and `src/worker/index.ts` as entry points. The frontend build remains `npm run build`; Laravel commands run from `backend/`.
