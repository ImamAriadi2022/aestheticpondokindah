import React from "react";
import NewBookingFlow from "./NewBookingFlow";

interface DesktopReservasiProps {
  initialView?: "services" | "history";
}

export default function DesktopReservasi({
  initialView = "services",
}: DesktopReservasiProps) {
  return (
    <NewBookingFlow
      initialStep={initialView === "history" ? "history" : "layanan"}
    />
  );
}
