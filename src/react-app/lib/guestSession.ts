const GUEST_ID_KEY = "apig_guest_id";

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export const getOrCreateGuestId = (): string => {
  const existing = window.localStorage.getItem(GUEST_ID_KEY);
  if (existing) return existing;
  const id = generateId();
  window.localStorage.setItem(GUEST_ID_KEY, id);
  return id;
};

export const clearGuestId = () => {
  window.localStorage.removeItem(GUEST_ID_KEY);
};
