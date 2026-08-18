import React from "react";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import NewBookingFlow from "@/features/patient/reservation/components/NewBookingFlow";

export default function BookingNewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />
      <main className="flex-1">
        <NewBookingFlow initialStep="layanan" />
      </main>
      <Footer />
    </div>
  );
}
