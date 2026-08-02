import { getOrCreateGuestId } from "@/core/auth/services/guestSession";

export type BookingRequestStatus =
  | "pending_review"
  | "proposal_sent"
  | "confirmed"
  | "cancelled"
  | "expired";

export type BookingProposalStatus = "awaiting_patient_confirmation" | "accepted" | "rejected" | "expired";

export type Branch = {
  id: string;
  name: string;
  address: string;
  whatsapp: string;
  mapLink: string;
};

export type Doctor = {
  id: string;
  name: string;
  branchId: string;
};

export type BookingProposal = {
  token: string;
  requestId: string;
  branch: Branch;
  doctor: Doctor;
  proposedDate: string;
  proposedTime: string;
  expiresAt: string;
  status: BookingProposalStatus;
};

export type BookingRequest = {
  id: string;
  guestId: string;
  branch: Branch;
  preferredDate: string;
  preferredStartTime: string;
  preferredEndTime: string;
  patientName: string;
  phone: string;
  note?: string;
  status: BookingRequestStatus;
  createdAt: string;
  proposal?: BookingProposal;
};

const STORAGE_KEY = "apig_booking_requests";
const PROPOSAL_STORAGE_KEY = "apig_booking_proposals";

const nowIso = () => new Date().toISOString();

const randomId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export const getDemoBranches = (): Branch[] => [
  {
    id: "b_pindah",
    name: "Aesthetic Pondok Indah",
    address: "Jl. Niaga Hijau Raya No.49, Pd. Pinang, Kec. Kby. Lama, Kota Jakarta Selatan, DKI Jakarta 12310",
    whatsapp: "+6281990114949",
    mapLink: "https://maps.app.goo.gl/DDRkJMn5S1M5fqYC7",
  },
  {
    id: "b_kemang",
    name: "Aesthetic Kemang",
    address: "Kemang, Jakarta Selatan (contoh alamat)",
    whatsapp: "+6281990114949",
    mapLink: "https://maps.google.com",
  },
  {
    id: "b_bsd",
    name: "Aesthetic BSD",
    address: "BSD City, Tangerang Selatan (contoh alamat)",
    whatsapp: "+6281990114949",
    mapLink: "https://maps.google.com",
  },
];

export const getDemoDoctors = (): Doctor[] => [
  { id: "d_1", name: "drg. Yulita Dora", branchId: "b_pindah" },
  { id: "d_2", name: "drg. Della Sparringa", branchId: "b_pindah" },
  { id: "d_3", name: "drg. Ryan Jusuf", branchId: "b_kemang" },
  { id: "d_4", name: "drg. Nona Lolita T", branchId: "b_bsd" },
];

const readAllRequests = (): BookingRequest[] => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as BookingRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAllRequests = (requests: BookingRequest[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
};

const readAllProposals = (): BookingProposal[] => {
  const raw = window.localStorage.getItem(PROPOSAL_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as BookingProposal[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAllProposals = (proposals: BookingProposal[]) => {
  window.localStorage.setItem(PROPOSAL_STORAGE_KEY, JSON.stringify(proposals));
};

export const createBookingRequestDemo = (input: {
  branchId: string;
  doctorId?: string;
  preferredDate: string;
  preferredStartTime: string;
  preferredEndTime: string;
  patientName: string;
  phone: string;
  note?: string;
}): { ok: true; request: BookingRequest } | { ok: false; error: string } => {
  const guestId = getOrCreateGuestId();
  const branches = getDemoBranches();
  const doctors = getDemoDoctors();
  const branch = branches.find((b) => b.id === input.branchId);
  if (!branch) return { ok: false, error: "Cabang tidak ditemukan." };

  const request: BookingRequest = {
    id: randomId(),
    guestId,
    branch,
    preferredDate: input.preferredDate,
    preferredStartTime: input.preferredStartTime,
    preferredEndTime: input.preferredEndTime,
    patientName: input.patientName,
    phone: input.phone,
    note: input.note,
    status: "pending_review",
    createdAt: nowIso(),
  };

  const next = [request, ...readAllRequests()];
  writeAllRequests(next);

  // Optional: create a sample proposal for demo purposes (so status page feels alive)
  // Here we create it randomly to illustrate the flow.
  if (Math.random() < 0.65) {
    const doctor = input.doctorId ? doctors.find((d) => d.id === input.doctorId) : doctors.find((d) => d.branchId === branch.id);
    if (doctor) {
      const token = randomId();
      const proposal: BookingProposal = {
        token,
        requestId: request.id,
        branch,
        doctor,
        proposedDate: input.preferredDate,
        proposedTime: input.preferredStartTime,
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        status: "awaiting_patient_confirmation",
      };

      const proposals = [proposal, ...readAllProposals()];
      writeAllProposals(proposals);

      request.status = "proposal_sent";
      request.proposal = proposal;
      writeAllRequests([request, ...readAllRequests().filter((r) => r.id !== request.id)]);
    }
  }

  return { ok: true, request };
};

export const listMyBookingRequestsDemo = (): BookingRequest[] => {
  const guestId = getOrCreateGuestId();
  const requests = readAllRequests().filter((r) => r.guestId === guestId);
  const proposals = readAllProposals();

  // attach proposal
  return requests
    .map((r) => {
      const proposal = proposals.find((p) => p.requestId === r.id && p.status === "awaiting_patient_confirmation");
      if (!proposal) return r;
      return { ...r, status: "proposal_sent" as const, proposal };
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
};

export const getProposalByTokenDemo = (token: string): BookingProposal | null => {
  const proposal = readAllProposals().find((p) => p.token === token) ?? null;
  if (!proposal) return null;
  const expired = new Date(proposal.expiresAt).getTime() < Date.now();
  if (expired && proposal.status === "awaiting_patient_confirmation") {
    // mark expired
    const proposals = readAllProposals().map((p) => (p.token === token ? { ...p, status: "expired" as const } : p));
    writeAllProposals(proposals);
    return { ...proposal, status: "expired" };
  }
  return proposal;
};

export const acceptProposalDemo = (token: string): { ok: true; requestId: string } | { ok: false; error: string } => {
  const proposal = getProposalByTokenDemo(token);
  if (!proposal) return { ok: false, error: "Proposal tidak ditemukan." };
  if (proposal.status !== "awaiting_patient_confirmation") {
    return { ok: false, error: proposal.status === "expired" ? "Proposal sudah kedaluwarsa." : "Proposal sudah diproses." };
  }

  const proposals = readAllProposals().map((p) => (p.token === token ? { ...p, status: "accepted" as const } : p));
  writeAllProposals(proposals);

  const requests = readAllRequests().map((r) => (r.id === proposal.requestId ? { ...r, status: "confirmed" as const } : r));
  writeAllRequests(requests);

  return { ok: true, requestId: proposal.requestId };
};

export const requestChangeProposalDemo = (
  token: string,
  input: { reason: string; preferredStartTime: string; preferredEndTime: string }
): { ok: true; requestId: string } | { ok: false; error: string } => {
  const proposal = getProposalByTokenDemo(token);
  if (!proposal) return { ok: false, error: "Proposal tidak ditemukan." };
  if (proposal.status !== "awaiting_patient_confirmation") {
    return { ok: false, error: proposal.status === "expired" ? "Proposal sudah kedaluwarsa." : "Proposal sudah diproses." };
  }

  // Mark proposal rejected (needs revision)
  const proposals = readAllProposals().map((p) => (p.token === token ? { ...p, status: "rejected" as const } : p));
  writeAllProposals(proposals);

  // Keep request in pending_review, store note for demo (append into note)
  const requests = readAllRequests().map((r) => {
    if (r.id !== proposal.requestId) return r;
    const note = `${r.note ? `${r.note}\n\n` : ""}Permintaan ubah jadwal: ${input.reason}. Range baru: ${input.preferredStartTime}-${input.preferredEndTime}`;
    return {
      ...r,
      status: "pending_review" as const,
      note,
      preferredStartTime: input.preferredStartTime,
      preferredEndTime: input.preferredEndTime,
      proposal: undefined,
    };
  });
  writeAllRequests(requests);

  return { ok: true, requestId: proposal.requestId };
};
