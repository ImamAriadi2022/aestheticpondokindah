export function generateMemberId(userId: string | number): string {
  const num = String(userId).replace(/\D/g, "") || "1";
  return `API-MBR-${num.padStart(4, "0")}`;
}

export function isMember(user: any): boolean {
  if (!user) return false;
  return Boolean(user.is_member || user.isMember || user.membership_tier_id || user.membershipTier);
}

export function tierOf(user: any): string {
  if (!user) return "Non-Member";
  if (user.membership_tier?.name) return user.membership_tier.name;
  if (user.membershipTier?.name) return user.membershipTier.name;
  if (user.tier) return String(user.tier);
  return isMember(user) ? "Bronze" : "Non-Member";
}
