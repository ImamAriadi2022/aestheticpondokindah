import { apiClient } from "@/core/api/apiClient";

export interface UserProfileData {
  id?: number | string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  gender?: "male" | "female" | string;
  birth_date?: string;
  address?: string;
  avatar_url?: string;
  membership?: {
    tier: string;
    points: number;
  };
}

export const getUserProfile = async (): Promise<UserProfileData> => {
  const res = await apiClient.get<{ user?: UserProfileData; data?: UserProfileData }>("/user/profile");
  return res.user || res.data || (res as any);
};

export const updateUserProfile = async (data: Partial<UserProfileData>): Promise<UserProfileData> => {
  const res = await apiClient.put<{ user?: UserProfileData; message?: string }>("/user/profile", data);
  return res.user || (res as any);
};
