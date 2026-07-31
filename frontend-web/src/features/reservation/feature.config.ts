import type { AppRole } from "@/authorization";
import { ROLES } from "@/authorization";

export default {
  name: "Reservation",
  description: "Patient booking/reservation flow and demo booking data.",
  roles: [ROLES.USER, ROLES.CLINIC],
  menu: true,
} as const;

export type ReservationFeatureRole = AppRole;
