import React from "react";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import GuestGuideView from "../components/GuestGuideView";

export default function GuestGuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <GuestGuideView />
      </main>
      <Footer />
    </div>
  );
}
