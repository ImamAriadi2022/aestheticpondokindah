# Frontend Architecture

Aesthetic Pondok Indah — Frontend Web.

This document explains the folder philosophy, role philosophy, feature philosophy, and the conventions every developer must follow. The goal is that a new developer understands the codebase in less than 10 minutes: which role owns a feature, where a new feature goes, where API calls belong, where business logic belongs, and where shared code belongs.

---

## 1. Overview

The architecture combines three styles:

- **Role-Based** — the top-level grouping inside `features/` is the application role that owns the feature.
- **Feature-Based** — each feature is isolated and owns everything related to itself.
- **Component-Based** — screens are composed of small, single-responsibility components.

Page-Based architecture is explicitly avoided. Folders are never organized by pages alone.

```
src/
├── core/
├── shared/
├── features/
│   ├── guest/
│   ├── patient/
│   ├── doctor/
│   └── admin/
└── styles/
```

---

## 2. Role Philosophy

Inside `features/`, organize by **role first**. Every feature must clearly belong to exactly one role.

```
features/
├── guest/
├── patient/
├── doctor/
└── admin/
```

Never mix features from different roles in the same folder. A developer must know which role owns a feature simply by reading the path.

### Role ownership

| Role    | Examples of owned features                                                       |
| ------- | -------------------------------------------------------------------------------- |
| guest   | home, services, doctors, articles, promotions, branches, download, contact, help, legal, onboarding, seo, reservation, chatbot |
| patient | dashboard, reservation, consultation, complaint, membership, profile, mobile      |
| doctor  | dashboard, schedule                                                              |
| admin   | dashboard, doctors, membership, content                                           |

Shared building blocks (layout, router, permissions, auth, API client) belong in `core/`, not inside any role.

---

## 3. Top-Level Structure

### `core/`

Frameworks, infrastructure, and cross-cutting concerns. Nothing role-specific lives here.

```
core/
├── api/          # apiClient, apiConfig, apiError, firebaseNotification, notificationApi, wilayahApi, analyticsApi
├── app/          # App.tsx — root component & route registration
├── router/       # ScrollToTop, RouteTransition, ErrorBoundary, ProtectedRoute, Dashboard routing hub
├── layouts/      # Header, Footer, DashboardLayout, AccountSidebar, DashboardRightPanel, Mobile layouts, NotificationCenterModal
├── providers/    # PwaManager
├── auth/         # Login/MobileLogin pages, session, sessionTtl, guestSession, feature.config
├── permissions/  # roles, menu, permissions, feature-access, index
├── constants/    # regionData, indonesiaWilayah
└── utils/        # utils, logger
```

- API calls are wrapped in services under `core/api/` (the API client is shared, not per-feature).
- Routing, guards, and auth are infrastructure — they are not "features" of any role.
- Layouts are reused across roles and therefore shared infrastructure.

### `shared/`

Reusable modules with **zero business logic**.

```
shared/
├── ui/        # Button, Card, Dialog, Select, Toast, Badge, Tabs, Table, Input, Sparkline, PullToRefresh, ...
└── pages/     # NotFoundPage, ForbiddenPage
```

Rules:

- Components in `shared/ui/` must be presentational and stateless regarding business logic.
- A shared component must not import from `features/`.
- Put a primitive here only when it is genuinely reused by multiple features.

### `features/<role>/<feature>/`

The domain of the application. Every feature is isolated inside its role folder and owns everything related to itself: pages, components, services, hooks, types, utils, constants, validation.

Standard feature structure:

```
feature-name/
├── pages/
├── components/
├── services/
├── hooks/
├── types/
├── utils/
├── constants/
├── validation/
├── feature.config.ts
└── index.ts
```

Features follow the real project's conventions (Kebab for folders, PascalCase for components/pages). Directories that are not needed for a given feature are simply omitted.

**Feature isolation rule:** no feature should directly depend on another feature. Communication between features happens only through services or shared modules (`core/`, `shared/`).

---

## 4. Page Responsibility

Pages are **composition layers only**.

A page should:

- compose components
- load hooks
- render layout

A page must never contain:

- API calls
- business rules
- huge `switch` statements
- complex validation
- large tables
- modal implementations

Ideal page size: **100–250 lines**. Maximum acceptable: **300 lines**. Anything larger must be refactored into components/hooks.

---

## 5. Component Philosophy

Split every large screen into reusable, single-responsibility components.

Example:

```
DashboardPage
└── DashboardHeader
    └── DashboardStatisticCards
        └── TodaySchedule
            └── RecentPatients
                └── QuickActions
                    └── MembershipSummary
                        └── NotificationPanel
```

Each component has a single responsibility and is colocated with the feature that owns it (or placed in `shared/ui/` when generic).

---

## 6. Services

Every API call is wrapped in a service.

```
reservationApi.ts
membershipApi.ts
doctorScheduleApi.ts
```

**No `fetch()` or `axios()` calls inside React pages or components.** Pages import services, never the API client directly.

Service locations:

- Feature-specific API calls → `features/<role>/<feature>/services/`
- Shared/infrastructure API calls → `core/api/`

---

## 7. Hooks

Complex state management belongs in hooks.

```
useReservation()
useMembership()
useDashboard()
```

Business logic is kept out of components. A component renders; a hook manages state and side effects.

---

## 8. Naming Conventions

| Item                | Convention                                    | Example                      |
| ------------------- | --------------------------------------------- | ---------------------------- |
| Folders             | kebab-case                                    | `features/guest/branch-detail` (adapt to existing: `branches/pages`) |
| Feature folders     | kebab-case                                    | `features/patient/reservation` |
| React components    | PascalCase                                    | `DashboardLayout.tsx`        |
| Pages               | PascalCase                                     | `UserDashboardNew.tsx`       |
| Hooks               | `useXxx` camelCase                            | `useReservation.ts`          |
| Services            | camelCase + `Api`/domain suffix                | `reservationApi.ts`          |
| Constants           | camelCase or SCREAMING_SNAKE per usage         | `regionData.ts`              |

Imports across the tree use the path aliases:

| Alias      | Resolves to        |
| ---------- | ------------------ |
| `@core/*`  | `./src/core/*`     |
| `@shared/*`| `./src/shared/*`   |
| `@/*`      | `./src/*`          |

Within a feature, prefer relative imports. Across boundaries, always use an alias.

---

## 9. Best Practices

- **Roles are stable boundaries.** A new feature is created under the role that owns it.
- **Features are isolated.** A feature never imports another feature directly; go through `core/` or `shared/`.
- **Pages are thin.** If a page exceeds ~300 lines, extract components and hooks.
- **API calls live in services.** Keep `fetch`/`axios` out of components and pages.
- **State lives in hooks.** Keep business logic out of JSX.
- **Shared components are dumb.** `shared/ui/*` must not contain business logic.
- **Reuse before you duplicate.** Move genuinely reused primitives into `shared/ui/`.
- **Preserve behavior.** Architecture refactors must never change business logic, APIs, or remove features.

---

## 10. Where Does X Go?

| Concern                                   | Location                                |
| ----------------------------------------- | --------------------------------------- |
| New public marketing page                 | `features/guest/<feature>/pages/`        |
| New patient feature                       | `features/patient/<feature>/`            |
| New doctor feature                        | `features/doctor/<feature>/`             |
| New admin feature                         | `features/admin/<feature>/`              |
| API call                                  | service under the owning feature, or `core/api/` |
| Business logic / state                    | hook under the owning feature            |
| Generic reusable UI                       | `shared/ui/`                             |
| Route guard, router, layout, auth         | `core/`                                  |
| Role menu, permissions, feature-access    | `core/permissions/`                      |
