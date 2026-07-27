import { API_BASE } from './apiConfig';

export interface MembershipData {
  user: {
    id: number;
    name: string;
    email: string;
    whatsapp: string;
  };
  membership: {
    level: 'bronze' | 'gold' | 'platinum' | 'diamond';
    status: string;
    started_at: string;
    expires_at: string | null;
    points: number;
    total_transactions: number;
    completed_treatments: number;
    profile_completed: boolean;
    last_paid_level: 'gold' | 'platinum' | 'diamond' | null;
  };
  progress: {
    next_level: string | null;
    current_amount: number;
    required_amount: number;
    percentage: number;
    remaining: number;
  };
  benefits: {
    birthday_voucher: boolean;
    personalized_recommendation: boolean;
    special_promo: boolean;
    booking_history?: boolean;
    treatment_reminder?: boolean;
    priority_booking?: boolean;
    free_consultation?: boolean;
    point_reward?: boolean;
    exclusive_promo?: boolean;
    treatment_priority_reminder?: boolean;
    priority_doctor_schedule?: boolean;
    free_scaling_per_year?: number;
    premium_treatment_benefit?: boolean;
    early_access_promo?: boolean;
    fast_track_appointment?: boolean;
    birthday_special_voucher?: boolean;
    discount_percentage: number;
    point_multiplier: number;
    vip_priority?: boolean;
    dedicated_customer_care?: boolean;
    emergency_appointment_priority?: boolean;
    exclusive_treatment_offers?: boolean;
    annual_smile_evaluation?: boolean;
    exclusive_event_invitation?: boolean;
    personal_treatment_plan?: boolean;
    special_gift?: boolean;
  };
  profile: MembershipProfile | null;
}

export interface MembershipProfile {
  id: number;
  user_id: number;
  gender: 'male' | 'female' | 'other';
  date_of_birth: string;
  city: string;
  dental_concerns: string[];
  treatment_interests: string[];
  dental_conditions: string[];
  last_dental_visit: string;
  lifestyle_interests: string[];
  personal_goals: string[];
  communication_preferences: string[];
  content_preferences: string[];
}

export interface PointsData {
  current_balance: number;
  total_earned: number;
  total_redeemed: number;
  total_expired: number;
  history: {
    data: PointHistory[];
  };
}

export interface PointHistory {
  id: number;
  user_id: number;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  description: string;
  reference_id: string | null;
  reference_type: string | null;
  expires_at: string;
  created_at: string;
}

export interface MembershipHistory {
  id: number;
  user_id: number;
  old_level: 'bronze' | 'gold' | 'platinum' | 'diamond' | 'none';
  new_level: 'bronze' | 'gold' | 'platinum' | 'diamond';
  reason: string;
  changed_by: number | null;
  metadata: any;
  created_at: string;
}

export interface MembershipTransaction {
  id: number;
  user_id: number;
  amount: number;
  transaction_type: 'treatment' | 'upgrade' | 'refund' | 'adjustment';
  description: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  metadata: any;
  created_at: string;
}

export interface AnalyticsData {
  total_members: number;
  bronze_members: number;
  gold_members: number;
  platinum_members: number;
  diamond_members: number;
  total_points_issued: number;
  total_points_redeemed: number;
  total_revenue: number;
  most_active_members: any[];
  growth: {
    new_members_this_month: number;
    upgrades_this_month: number;
  };
  revenue_by_level: {
    bronze: number;
    gold: number;
    platinum: number;
    diamond: number;
  };
}

export interface MembershipTierInfo {
  label: string;
  price: number;
  threshold_transaction: number;
  benefits: Record<string, boolean | number>;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const userStr = localStorage.getItem('apident:user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.token || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Helper function to make API requests
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

// Membership API functions
export const membershipApi = {
  // Get user membership details
  getMembership: async (): Promise<MembershipData> => {
    return apiRequest('/membership');
  },

  // Get membership tiers info (public)
  getTiers: async (): Promise<Record<'bronze' | 'gold' | 'platinum' | 'diamond', MembershipTierInfo>> => {
    return apiRequest('/membership/tiers');
  },

  // Get membership profile
  getProfile: async (): Promise<MembershipProfile | null> => {
    const response = await apiRequest('/membership/profile');
    return response.data;
  },

  // Update membership profile
  updateProfile: async (data: Partial<MembershipProfile>): Promise<MembershipProfile> => {
    const response = await apiRequest('/membership/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Get membership points
  getPoints: async (): Promise<PointsData> => {
    return apiRequest('/membership/points');
  },

  // Get membership history
  getHistory: async (): Promise<{ data: MembershipHistory[] }> => {
    return apiRequest('/membership/history');
  },

  // Get membership transactions
  getTransactions: async (): Promise<{ data: MembershipTransaction[] }> => {
    return apiRequest('/membership/transactions');
  },

  // Upgrade membership
  upgrade: async (targetLevel: 'gold' | 'platinum' | 'diamond'): Promise<any> => {
    return apiRequest('/membership/upgrade', {
      method: 'POST',
      body: JSON.stringify({ target_level: targetLevel }),
    });
  },

  // Renew membership to last paid level
  renew: async (): Promise<any> => {
    return apiRequest('/membership/renew', {
      method: 'POST',
    });
  },

  // Redeem points
  redeemPoints: async (points: number, description: string): Promise<any> => {
    return apiRequest('/membership/redeem-points', {
      method: 'POST',
      body: JSON.stringify({ points, description }),
    });
  },
};

// Admin Membership API functions
export const adminMembershipApi = {
  // Get all members
  getMembers: async (params?: {
    level?: 'bronze' | 'gold' | 'platinum' | 'diamond';
    status?: string;
    min_transaction?: number;
    search?: string;
  }): Promise<{ data: any[] }> => {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`/admin/membership${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get specific member
  getMember: async (id: number): Promise<any> => {
    return apiRequest(`/admin/membership/${id}`);
  },

  // Update member level
  updateLevel: async (id: number, level: string, reason?: string): Promise<any> => {
    return apiRequest(`/admin/membership/${id}/level`, {
      method: 'PATCH',
      body: JSON.stringify({ level, reason }),
    });
  },

  // Update member points
  updatePoints: async (
    id: number,
    points: number,
    type?: string,
    description?: string
  ): Promise<any> => {
    return apiRequest(`/admin/membership/${id}/points`, {
      method: 'PATCH',
      body: JSON.stringify({ points, type, description }),
    });
  },

  // Get analytics
  getAnalytics: async (): Promise<AnalyticsData> => {
    return apiRequest('/admin/membership/analytics');
  },

  // Get level distribution
  getLevelDistribution: async (): Promise<{
    data: {
      counts: { bronze: number; gold: number; platinum: number; diamond: number };
      percentages: { bronze: number; gold: number; platinum: number; diamond: number };
      total: number;
    };
  }> => {
    return apiRequest('/admin/membership/level-distribution');
  },

  // Delete member
  deleteMember: async (id: number): Promise<any> => {
    return apiRequest(`/admin/membership/${id}`, {
      method: 'DELETE',
    });
  },
};
