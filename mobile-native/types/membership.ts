// Types — Membership & Loyalty Points (Web Parity)

export interface MembershipData {
  user: {
    id: number;
    name: string;
    email: string;
    whatsapp: string;
    phone?: string;
  };
  membership: {
    level: 'bronze' | 'gold' | 'platinum';
    status: string;
    started_at: string | null;
    expires_at: string | null;
    points: number;
    total_points?: number;
    total_transactions: number;
    completed_treatments: number;
    profile_completed: boolean;
    last_paid_level: 'gold' | 'platinum' | null;
  };
  progress: {
    next_level: string | null;
    current_amount: number;
    required_amount: number;
    percentage: number;
    remaining: number;
  };
  benefits: Record<string, any>;
  profile: MembershipProfile | null;
}

export interface MembershipTier {
  level: 'bronze' | 'gold' | 'platinum';
  name?: string;
  label?: string;
  price: number;
  price_formatted?: string;
  threshold_transaction?: number;
  min_transactions?: number;
  benefits: Record<string, any> | string[];
  color?: string;
}

export interface MembershipProfile {
  id?: number;
  user_id?: number;
  gender?: 'male' | 'female' | 'other';
  date_of_birth?: string;
  city?: string;
  dental_concerns?: string[];
  treatment_interests?: string[];
  dental_conditions?: string[];
  last_dental_visit?: string;
  lifestyle_interests?: string[];
  personal_goals?: string[];
  communication_preferences?: string[];
  content_preferences?: string[];
}

export interface MembershipPoint {
  id: number;
  user_id?: number;
  points: number;
  balance_before?: number;
  balance_after?: number;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted' | string;
  description: string;
  reference_id?: string | null;
  reference_type?: string | null;
  expires_at?: string;
  created_at: string;
}

export interface MembershipHistory {
  id: number;
  user_id?: number;
  old_level?: string;
  new_level?: string;
  from_level?: string;
  to_level?: string;
  reason?: string;
  changed_by?: number | null;
  created_at: string;
}

export interface MembershipTransaction {
  id: number;
  user_id?: number;
  amount: number;
  transaction_type?: 'treatment' | 'upgrade' | 'refund' | 'adjustment' | string;
  invoice_number?: string;
  description?: string;
  status: 'pending' | 'completed' | 'success' | 'failed' | 'cancelled' | 'refunded';
  created_at: string;
}

export interface UpgradeOption {
  level: 'bronze' | 'gold' | 'platinum';
  label: string;
  price: number;
  price_formatted: string;
  threshold_transaction?: number;
  benefits: {
    discount_percentage?: number;
    point_multiplier?: number;
    priority_booking?: boolean;
    free_scaling_per_year?: number;
    free_consultation?: boolean;
    birthday_voucher?: boolean;
    dedicated_customer_care?: boolean;
    [key: string]: any;
  };
}
