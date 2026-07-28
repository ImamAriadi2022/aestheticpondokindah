// Types — Membership & Points

export interface MembershipTier {
  level: 'bronze' | 'gold' | 'platinum' | 'diamond';
  name: string;
  min_transactions: number;
  benefits: string[];
  color: string;
  price: number | null;
}

export interface MembershipProfile {
  id: number;
  user_id: number;
  level: 'bronze' | 'gold' | 'platinum' | 'diamond';
  status: 'active' | 'inactive' | 'expired';
  started_at: string | null;
  expires_at: string | null;
  total_points: number;
  lifetime_points: number;
  total_transactions: number;
}

export interface MembershipPoint {
  id: number;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  points: number;
  description: string;
  created_at: string;
}

export interface MembershipHistory {
  id: number;
  from_level: string;
  to_level: string;
  reason: string;
  created_at: string;
}

export interface MembershipTransaction {
  id: number;
  invoice_number: string;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  created_at: string;
}
