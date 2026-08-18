import React from "react";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import GuestBookingFlow from "../components/GuestBookingFlow";

export default function BookingNewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />
      <main className="flex-1">
        <GuestBookingFlow />
      </main>
      <Footer />
    </div>
  );
}
