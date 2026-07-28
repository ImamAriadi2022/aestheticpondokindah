// Types — Auth & User
export interface LoginPayload {
  phone: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  email: string;
  password: string;
  password_confirmation: string;
  gender?: 'male' | 'female';
  birth_date?: string;
  address?: string;
}

export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  role: 'user' | 'clinic_admin' | 'doctor';
  membership_level: 'bronze' | 'gold' | 'platinum' | 'diamond';
  membership_status: 'active' | 'inactive' | 'expired';
  membership_expires_at: string | null;
  total_transactions: number;
  profile_photo_url: string | null;
  address: string | null;
  gender: 'male' | 'female' | null;
  birth_date: string | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
