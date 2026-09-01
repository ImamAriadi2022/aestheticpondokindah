// Types — Appointments / Reservations

export interface Reservation {
  id: number;
  code: string;
  service_name: string;
  doctor_name: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  price: number | null;
  created_at: string;
}

export interface ReservationCreatePayload {
  service_id: number;
  doctor_id?: number;
  scheduled_date: string;
  scheduled_time: string;
  notes?: string;
}

export interface DoctorSchedule {
  id: number;
  doctor_id: number;
  doctor_name: string;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  start_time: string;
  end_time: string;
  is_available: boolean;
}

// Types — Notification

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  data: Record<string, any> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

// Types — Content

export interface Post {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string | null;
  content?: string;
  thumbnail_url?: string | null;
  cover_image_url?: string | null;
  published_at?: string | null;
  category?: string | null;
  reading_time_minutes?: number | null;
}

export interface GalleryItem {
  id: number;
  title: string | null;
  image_url: string;
  category: string | null;
}

export interface Promo {
  id: number;
  title: string;
  slug?: string;
  headline?: string | null;
  description?: string | null;
  discount_text?: string | null;
  category?: string | null;
  image_url?: string | null;
  thumbnail_url?: string | null;
  valid_until?: string | null;
}

export interface Popup {
  id: number;
  title?: string | null;
  headline?: string | null;
  message?: string | null;
  button_label?: string | null;
  cta_text?: string | null;
  image_url?: string | null;
}
