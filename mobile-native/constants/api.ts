// API Base URL — Aesthetic Pondok Indah
// Production: https://aestheticpondokindah.com/backend/public/api

export const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://10.0.2.2:8000/api' // Android emulator localhost alias
    : 'https://aestheticpondokindah.com/backend/public/api';

export const STORAGE_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://10.0.2.2:8000/storage'
    : 'https://aestheticpondokindah.com/backend/public/storage';

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
  CHANGE_PASSWORD: '/user/change-password',

  // Membership
  MEMBERSHIP: '/membership',
  MEMBERSHIP_TIERS: '/membership/tiers',
  MEMBERSHIP_UPGRADE: '/membership/upgrade',
  MEMBERSHIP_RENEW: '/membership/renew',
  MEMBERSHIP_CANCEL: '/membership/cancel',
  MEMBERSHIP_HISTORY: '/membership/history',
  MEMBERSHIP_POINTS: '/membership/points',
  MEMBERSHIP_REDEEM: '/membership/redeem-points',
  MEMBERSHIP_PAYMENT_CREATE: '/membership/payment/create',
  MEMBERSHIP_PAYMENT_SIMULATE: (id: string) => `/membership/payment/simulate/${id}`,

  // Reservations / Appointments
  PUBLIC_RESERVATIONS: '/public/reservations',
  PUBLIC_DOCTOR_SCHEDULES: '/public/doctor-schedules',
  RESERVATIONS: '/user/reservations',
  RESERVATION_CREATE: '/user/reservations',

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_UNREAD: '/notifications/unread-count',
  NOTIFICATIONS_READ: (id: string) => `/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/notifications/read-all',
  NOTIFICATIONS_DELETE: (id: string) => `/notifications/${id}`,
  NOTIFICATIONS_CLEAR: '/notifications/clear',
  DEVICE_TOKENS: '/notifications/device-token',
  DEVICE_TOKENS_DELETE: (token: string) => `/notifications/device-token/${token}`,

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

  // Services
  SERVICES: '/services',
} as const;
