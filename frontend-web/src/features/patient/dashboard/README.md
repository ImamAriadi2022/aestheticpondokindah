# Dashboard

Role-based home dashboards and management panels.

## Used By

- User (Patient)
- Doctor
- Clinic (Admin)

## Pages

- `Dashboard.tsx` - routing hub
- `dashboard/UserDashboardNew.tsx`
- `dashboard/DoctorDashboard.tsx`
- `dashboard/ClinicDashboard.tsx`
- `dashboard/DoctorScheduleForm.tsx`
- `dashboard/ClinicDoctorForm.tsx`
- `dashboard/UserReservation.tsx`

## Components

- `DashboardLayout` - desktop sidebar layout (menu from `src/authorization/menu.ts`)
- `NewMobileDashboardLayout` - mobile layout with bottom nav
- `AccountSidebar`, `DashboardRightPanel`, `DashboardStats`, `AnalyticsDashboard`
- `DesktopUserHome`, `DesktopDoctorHome`, `DesktopClinicHome`
- `DesktopReservasi`, `DesktopKonsultasi`, `DesktopPengaduan`
- `BlogEditorPanel`, `WpEditor`, `Sparkline`

## Services

- `demoData` - demo visitor analytics for clinic dashboard
