import type { AppRole } from "@/authorization";
import { ROLES } from "@/authorization";

export default {
  name: "Consultation",
  description: "Patient consultation and complaint (pengaduan) management.",
  roles: [ROLES.USER, ROLES.DOCTOR, ROLES.CLINIC],
  menu: true,
} as const;

export type ConsultationFeatureRole = AppRole;
