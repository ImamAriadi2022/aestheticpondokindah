export interface PatientDashboardTabItem {
  id: string;
  label: string;
  iconName: string;
  badgeCount?: number;
}

export interface PatientDashboardSummary {
  activeReservationsCount: number;
  consultationsCount: number;
  complaintsCount: number;
  membershipTier: string;
  membershipPoints: number;
}
