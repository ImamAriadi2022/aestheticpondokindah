// API Base URL — Aesthetic Pondok Indah
// Production API: https://aestheticpondokindah.com/api
// Production Storage: https://aestheticpondokindah.com/storage

export const API_BASE = 'https://aestheticpondokindah.com/api';
export const STORAGE_BASE = 'https://aestheticpondokindah.com/storage';

export const getStorageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.includes('/storage/')) {
    const idx = path.indexOf('/storage/');
    return STORAGE_BASE.replace('/storage', '') + path.substring(idx);
  }
  return `${STORAGE_BASE}/${path}`;
};

// Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',
  LOGOUT: '/auth/logout',

  // User
  PROFILE: '/user/profile',
  PROFILE_UPDATE: '/user/profile',
  CHANGE_PASSWORD: '/user/password',

  // Membership
  MEMBERSHIP: '/membership',
  MEMBERSHIP_TIERS: '/membership/tiers',
  PUBLIC_MEMBERSHIP_TIERS: '/public/membership/tiers',
  MEMBERSHIP_PROFILE: '/membership/profile',
  MEMBERSHIP_UPGRADE: '/membership/upgrade',
  MEMBERSHIP_REQUEST_UPGRADE: '/membership/request-upgrade',
  MEMBERSHIP_RENEW: '/membership/renew',
  MEMBERSHIP_CANCEL: '/membership/cancel',
  MEMBERSHIP_HISTORY: '/membership/history',
  MEMBERSHIP_POINTS: '/membership/points',
  MEMBERSHIP_TRANSACTIONS: '/membership/transactions',
  MEMBERSHIP_REDEEM: '/membership/redeem-points',
  MEMBERSHIP_PAYMENT_OPTIONS: '/membership/payment/options',
  MEMBERSHIP_PAYMENT_CREATE: '/membership/payment/create',
  MEMBERSHIP_PAYMENT_SIMULATE: (id: string) => `/membership/payment/simulate/${id}`,

  // Reservations / Appointments
  PUBLIC_RESERVATIONS: '/public/reservations',
  PUBLIC_DOCTOR_SCHEDULES: '/public/doctor-schedules',
  RESERVATIONS: '/user/reservations',
  RESERVATION_CREATE: '/user/reservations',

  // Consultations (Patient)
  CONSULTATIONS: '/user/consultations',
  CONSULTATION_DETAIL: (id: string | number) => `/user/consultations/${id}`,
  CONSULTATION_MESSAGES: (id: string | number) => `/user/consultations/${id}/messages`,
  CONSULTATION_READ: (id: string | number) => `/user/consultations/${id}/read`,
  CONSULTATION_CLOSE: (id: string | number) => `/user/consultations/${id}/close`,
  CONSULTATION_MEETINGS: (id: string | number) => `/user/consultations/${id}/meetings`,

  // Notifications (User Scoped)
  NOTIFICATIONS: '/user/notifications',
  NOTIFICATIONS_UNREAD: '/user/notifications/unread-count',
  NOTIFICATIONS_READ: (id: string) => `/user/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/user/notifications/read-all',
  NOTIFICATIONS_DELETE: (id: string) => `/user/notifications/${id}`,
  NOTIFICATIONS_CLEAR: '/user/notifications',
  DEVICE_TOKENS: '/user/device-token',
  DEVICE_TOKENS_DELETE: '/user/device-token',

  // Content (Public)
  POSTS: '/public/posts',
  POST_DETAIL: (slug: string) => `/public/posts/${slug}`,
  GALLERY: '/public/gallery-items',
  PROMOS: '/public/promos',
  PROMO_DETAIL: (slug: string) => `/public/promos/${slug}`,
  TESTIMONIALS: '/public/testimonials',
  POPUPS: '/public/popup/active',

  // Doctor Schedules
  DOCTOR_SCHEDULES: '/doctor-schedules',

  // Services & Settings
  SERVICES: '/services',
  PUBLIC_SERVICES: '/public/services',
  BRANCHES: '/public/branches',
  SETTINGS: '/public/settings',
} as const;
