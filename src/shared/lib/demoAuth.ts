export type DemoRole = "user" | "doctor" | "clinic";

export type DemoSession = {
  id: string;
  role: DemoRole;
  name: string;
  email: string;
  phone: string;
  domicile: string;
  region?: string;
  gender?: string;
  bloodType?: string;
  job?: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  postalCode?: string;
  birthDate?: string;
  membershipStatus?: "none" | "active" | "pending";
};

type DemoCredential = DemoSession & { password: string };

const SESSION_KEY = "apident:demo_session_v1";
const USERS_KEY = "apident:demo_users_v1";

const demoUsers: DemoCredential[] = [
  {
    id: "AESPI_001",
    role: "user",
    name: "Dina Prameswari",
    email: "user@demo.com",
    password: "user123",
    phone: "+62 812-0000-0001",
    domicile: "DKI Jakarta",
    membershipStatus: "active",
  },
  {
    id: "d_001",
    role: "doctor",
    name: "drg. Andi Saputra",
    email: "doctor@aestheticpondokindah.local",
    password: "doctor123",
    phone: "+62887437525304",
    domicile: "DKI Jakarta",
  },
  {
    id: "c_001",
    role: "clinic",
    name: "Admin Klinik",
    email: "clinic@aestheticpondokindah.local",
    password: "admin123",
    phone: "+62887437525303",
    domicile: "DKI Jakarta",
  },
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "").trim();
}

function createPlaceholderEmail(id: string) {
  return `${id}@placeholder.local`;
}

function readStoredUsers(): DemoCredential[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DemoCredential[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeStoredUsers(users: DemoCredential[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getAllCredentials(): DemoCredential[] {
  const stored = readStoredUsers();
  const map = new Map<string, DemoCredential>();
  for (const u of demoUsers) map.set(normalizeEmail(u.email), u);
  for (const u of stored) map.set(normalizeEmail(u.email), u);
  return Array.from(map.values());
}

export function getDemoUsers() {
  return getAllCredentials().map(({ password: _pw, ...rest }) => rest);
}

export function getSession(): DemoSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as any;
      const role =
        parsed?.role === "clinic_admin"
          ? "clinic"
          : parsed?.role === "patient"
            ? "user"
            : parsed?.role;
      return { ...parsed, role } as DemoSession;
    }

    // Fallback ke login backend asli (apident:user)
    const storedUser = localStorage.getItem("apident:user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Map role backend ke role yang diharapkan frontend
      const role = user.role === "clinic_admin" ? "clinic" : 
                  user.role === "patient" ? "user" : user.role;
      return { ...user, role } as DemoSession;
    }

    return null;
  } catch {
    return null;
  }
}

export function setSession(session: DemoSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function updateSessionProfile(updates: Partial<Omit<DemoSession, "id" | "role">>) {
  const session = getSession();
  if (!session) return;

  const updatedSession = { ...session, ...updates };
  setSession(updatedSession);

  // Jika user login dari backend asli, beberapa halaman membaca dari apident:user.
  // Sinkronkan juga agar data profil tidak hilang setelah reload.
  try {
    const rawUser = localStorage.getItem("apident:user");
    if (!rawUser) return;
    const currentUser = JSON.parse(rawUser) as any;
    const nextUser = {
      ...currentUser,
      ...updates,
      // common aliases
      whatsapp: (updates as any)?.phone ?? currentUser?.whatsapp,
      phone: (updates as any)?.phone ?? currentUser?.phone,
      address_line: (updates as any)?.address ?? currentUser?.address_line,
      blood_type: (updates as any)?.bloodType ?? currentUser?.blood_type,
      postal_code: (updates as any)?.postalCode ?? currentUser?.postal_code,
      birth_date: (updates as any)?.birthDate ?? currentUser?.birth_date,
      source_info: (updates as any)?.sourceInfo ?? currentUser?.source_info,
      insurance_provider: (updates as any)?.insuranceProvider ?? currentUser?.insurance_provider,
      is_coffee_drinker: (updates as any)?.isCoffeeDrinker ?? currentUser?.is_coffee_drinker,
      is_smoker: (updates as any)?.isSmoker ?? currentUser?.is_smoker,
      consumption_habits: (updates as any)?.consumptionHabits ?? currentUser?.consumption_habits,
    };
    localStorage.setItem("apident:user", JSON.stringify(nextUser));
  } catch {
    // ignore localStorage parse error
  }
}

export function loginWithDemo(role: DemoRole, identifier: string, password: string) {
  const id = identifier.trim();
  const normalizedEmail = normalizeEmail(id);
  const normalizedPhone = normalizePhone(id);

  const match = getAllCredentials().find((u) => {
    if (u.role !== role) return false;
    if (u.password !== password) return false;

    // Cek kecocokan dengan WhatsApp (phone) atau Email
    return normalizePhone(u.phone) === normalizedPhone || normalizeEmail(u.email) === normalizedEmail;
  });
  
  if (!match) {
    return { ok: false as const, error: "Nomor WhatsApp/Email atau password salah." };
  }

  const { password: _pw, ...session } = match;
  setSession(session);
  return { ok: true as const, session };
}

export function registerDemoUser(input: {
  name: string;
  email: string;
  phone: string;
  domicile: string;
  password: string;
  gender?: string;
  bloodType?: string;
  job?: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  birthDate?: string;
}) {
  const emailInput = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  if (!phone) return { ok: false as const, error: "Nomor telepon tidak valid." };

  if (emailInput) {
    const existing = getAllCredentials().find((u) => normalizeEmail(u.email) === emailInput);
    if (existing) {
      return { ok: false as const, error: "Email sudah terdaftar." };
    }
  }

  const stored = readStoredUsers();
  const id = `AESPI_${Math.random().toString(16).slice(2, 10)}`;
  const email = emailInput || createPlaceholderEmail(id);
  const user: DemoCredential = {
    id,
    role: "user",
    name: input.name.trim() || "Pengguna",
    email,
    password: input.password,
    phone,
    domicile: input.domicile.trim() || "-",
    gender: input.gender,
    bloodType: input.bloodType,
    job: input.job,
    province: input.province,
    city: input.city,
    district: input.district,
    address: input.address,
    birthDate: input.birthDate,
    membershipStatus: "none",
  };
  stored.push(user);
  writeStoredUsers(stored);
  const { password: _pw, ...session } = user;
  setSession(session);
  return { ok: true as const, session };
}

export function signInWithGoogleDemo() {
  const stored = readStoredUsers();
  const email = "google.user@demo.com";
  const existing = getAllCredentials().find((u) => normalizeEmail(u.email) === normalizeEmail(email));

  const user: DemoCredential = existing
    ? { ...existing, role: "user" }
    : {
        id: `AESPI_${Math.random().toString(16).slice(2, 10)}`,
        role: "user",
        name: "Google Demo User",
        email,
        password: "google-demo",
        phone: "+62 811-2222-3333",
        domicile: "DKI Jakarta",
      };

  if (!existing) {
    stored.push(user);
    writeStoredUsers(stored);
  }

  const { password: _pw, ...session } = user;
  setSession(session);
  return { ok: true as const, session };
}

export function resetPasswordDemo(identifier: string, newPassword: string) {
  const id = identifier.trim();
  if (!id) return { ok: false as const, error: "Masukkan email atau nomor telepon." };
  if (!newPassword) return { ok: false as const, error: "Password baru tidak boleh kosong." };

  const emailNorm = normalizeEmail(id);
  const phoneNorm = normalizePhone(id);

  const all = getAllCredentials();
  const match = all.find(
    (u) => normalizeEmail(u.email) === emailNorm || normalizePhone(u.phone) === phoneNorm
  );

  if (!match) {
    return { ok: false as const, error: "Akun tidak ditemukan." };
  }

  const stored = readStoredUsers();
  const emailKey = normalizeEmail(match.email);
  const idx = stored.findIndex((u) => normalizeEmail(u.email) === emailKey);
  const updated: DemoCredential = { ...match, password: newPassword };

  if (idx >= 0) stored[idx] = updated;
  else stored.push(updated);
  writeStoredUsers(stored);

  return { ok: true as const };
}

export function getDefaultDashboardPath(role: DemoRole | string) {
  if (role === "user" || role === "patient") return "/dashboard/user";
  if (role === "doctor") return "/dashboard/doctor";
  if (role === "clinic" || role === "clinic_admin") return "/dashboard/clinic";
  return "/dashboard/user";
}
