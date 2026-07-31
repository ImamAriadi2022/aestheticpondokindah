# Frontend Architecture

This document describes the architecture of the React frontend located in `frontend-web/`.

## Overview

The frontend follows a **Feature-Based Architecture** with a dedicated **Authorization module** that acts as the single source of truth for roles, permissions, menu visibility, route protection, and feature access.

The target structure:

```
src/
  app/             application-level configuration & routing
  authorization/   roles, permissions, feature access, menu, route guards
  features/        business domains (each is an independent feature)
  shared/          only reusable resources
  styles/          global styles
  main.tsx         application entry
```

## Folder Structure

```
src/
  main.tsx
  app/
    App.tsx                 HashRouter + route table + app-wide providers
  authorization/
    index.ts                barrel export
    roles.ts                AppRole, ROLES, ROLE_LABELS, normalizeRole, getDefaultDashboardPath
    permissions.ts          Permission type + PERMISSIONS constants
    feature-access.ts       FeatureKey, FEATURE_ROLES, FEATURE_PERMISSIONS, canAccessFeature
    menu.ts                 MenuItem, MENU, CONTENT_SUBMENU, getMenuItems
    route-guard.ts          resolveRole, canActivate, getRedirectPath
  features/
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
    components/             reusable UI (ui, layout, routing, pwa, notification, chatbot)
    pages/                  shared pages: NotFound (404), Forbidden (403)
    lib/                    shared core services & utilities
  styles/
```

## Authorization Module

`src/authorization/` is the single source of truth for RBAC:

| File              | Responsibility                                        |
| ----------------- | ----------------------------------------------------- |
| `roles.ts`        | Role type, constants, labels, normalization, dashboard paths |
| `permissions.ts`  | Permission keys used by features                      |
| `feature-access.ts` | Which roles can access which feature                 |
| `menu.ts`         | Menu items per role + content submenu                 |
| `route-guard.ts`  | Guard helpers for protected routes                    |

### Roles

- `guest` - unauthenticated visitor (landing pages)
- `user` - patient/client (maps from backend `patient`)
- `doctor` - clinic doctor
- `clinic` - clinic admin (maps from backend `clinic_admin`)

### Role Mapping (backend → frontend)

| Backend Role  | Frontend Role |
| ------------- | ------------- |
| `patient`     | `user`        |
| `doctor`      | `doctor`      |
| `clinic_admin`| `clinic`      |

Normalization is centralized in `normalizeRole()` (`authorization/roles.ts`).

## Feature Modules

Each feature lives in `src/features/<name>/` and owns its components, pages, and services.

Every feature includes:

- `feature.config.ts` - name, description, allowed roles, menu visibility
- `README.md` - feature responsibilities, used-by, pages, services
- `index.ts` - public exports of the feature
- `components/` - feature-specific components
- `pages/` - feature pages
- `services/` - feature-owned API/demo services

### Features Discovered

| Feature      | Pages                                                                  | Services                                   | Roles                     |
| ------------ | ---------------------------------------------------------------------- | ------------------------------------------ | ------------------------- |
| `auth`       | Login, MobileLogin                                                      | `demoAuth`, `sessionTtl`                   | guest                     |
| `dashboard`  | Dashboard, UserDashboardNew, DoctorDashboard, ClinicDashboard, DoctorScheduleForm, ClinicDoctorForm, UserReservation | `demoData` | user, doctor, clinic |
| `consultation`| (components used by dashboard)                                         | `consultationApi`, `complaintApi`          | user, doctor, clinic      |
| `doctors`    | DoctorCard                                                              | `publicDoctorScheduleApi`, `doctorScheduleApi`, `adminDoctorScheduleApi` | all |
| `home`       | (landing sections)                                                      | -                                          | all                       |
| `marketing`  | Home, About, Doctors, Blog, Promo, Download, Contact, Help, legal       | `downloadApi`, `metaTags`                  | all                       |
| `membership` | Membership, MembershipUpgrade, AdminMembership                          | `membershipApi`                            | user, clinic              |
| `mobile`     | MobileHome, MobileBooking*, MobileKonsultasi, MobileRiwayat, MobileAkun | `mobileSyncManager`                        | all                       |
| `profile`    | Settings, Security                                                      | -                                          | user, doctor, clinic      |
| `reservation`| BookingNew, BookingStatus, BookingProposal, BookingRequestDetail        | `reservationApi`, `bookingDemo`            | user, clinic              |

## Route Protection

Protected routes wrap pages with `ProtectedRoute` (`shared/components/routing/ProtectedRoute.tsx`), which:

1. Checks session expiry (`sessionTtl`).
2. Resolves the session (demo or real backend).
3. Normalizes the role.
4. Uses `canActivate(role, allow)` + `getRedirectPath(role)` from `authorization/route-guard.ts`.

Pages are code-split with `React.lazy` in `app/App.tsx`.

## Menu

The sidebar menu is generated from `authorization/menu.ts` via `getMenuItems(role)`. Content submenu items (Blog, Promo, Pop Up, Galeri, Testimoni, Download App) come from `CONTENT_SUBMENU`. Mobile bottom-tab layouts keep their own role-specific item lists due to a different UX structure.

## Shared Module

`src/shared/` contains only reusable resources:

- `components/ui/` - Button, Input, Dialog, Card, Badge, Table, Tabs, etc.
- `components/layout/` - Header, Footer
- `components/routing/` - ProtectedRoute, ErrorBoundary, ScrollToTop, RouteTransition
- `components/pwa/` - PwaManager (service worker, offline, update banner)
- `components/notification/` - NotificationCenterModal
- `pages/` - `NotFoundPage` (404), `ForbiddenPage` (403)
- `lib/` - core services: `apiClient`, `apiConfig`, `apiError`, `logger`, `utils`, `analyticsApi`, `notificationApi`, `firebaseNotification`, `regionData`, `wilayahApi`, `indonesiaWilayah`, `guestSession`

Feature-specific services are owned by their feature's `services/` folder and must not live in `shared/`.

## Naming Convention

- Pages: `Xxx.tsx` / `XxxPage.tsx`
- Components: `Xxx.tsx` (PascalCase)
- Services: `kebab-caseApi.ts` or `kebab-caseManager.ts`
- Feature config: `feature.config.ts`
- Feature exports: `index.ts`

## Best Practices

- Keep feature modules isolated; features should not deep-import each other's internals.
- Only move a component/service to `shared/` when reused by 2+ features.
- Route guards and menu must read from `authorization/`, never hard-code role lists in pages.
- Do not change API contracts or business logic during refactors.

## How to Create a New Feature

1. Create `src/features/<name>/` with `components/`, `pages/`, `services/`.
2. Add `feature.config.ts` with name, description, roles, menu flag.
3. Add `README.md` describing responsibilities and used-by roles.
4. Add `index.ts` exporting public members.
5. Register `feature` in `authorization/feature-access.ts`.
6. Add menu items in `authorization/menu.ts` if the feature shows in the sidebar.
7. Add routes (lazy-loaded) in `app/App.tsx` and protect with `ProtectedRoute`.

## Validation

Run from `frontend-web/`:

```bash
npm install
npm run check   # builds into ../public_html (emptyOutDir)
npm run dev
```

The build must complete without errors. Path alias `@/*` resolves to `./src/*`.
