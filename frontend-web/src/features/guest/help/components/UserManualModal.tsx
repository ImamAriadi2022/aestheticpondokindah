import React from "react";
import { X, Printer } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import GuestGuideView from "./GuestGuideView";
import PatientGuideView from "./PatientGuideView";
import DoctorGuideView from "./DoctorGuideView";
import AdminGuideView from "./AdminGuideView";

interface UserManualModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: "admin" | "doctor" | "user" | "guest";
}

export default function UserManualModal({
  open,
  onOpenChange,
  role = "user",
}: UserManualModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-[#EADBBD] bg-[#FAF8F5] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[#EADBBD] flex items-center justify-between">
          <div className="space-y-0.5">
            <DialogTitle className="text-base sm:text-lg font-extrabold text-[#3D332A]">
              Buku Panduan & Dokumentasi Operasional
            </DialogTitle>
            <DialogDescription className="text-xs text-[#7A6E60]">
              {role === "admin"
                ? "Panduan Administrator & Manajemen Operasional Klinik"
                : role === "doctor"
                ? "Panduan Dokter Spesialis & Standar Praktik Medis"
                : role === "guest"
                ? "Panduan Pasien Tamu (Guest) & Alur Reservasi"
                : "Panduan Pasien Member & Tata Kelola Akun"}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-8 px-3 rounded-xl border-[#D9D0BC] text-[#6B5E4F] hover:bg-[#FAF5EA] font-semibold text-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1" /> Cetak
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {role === "admin" && <AdminGuideView />}
          {role === "doctor" && <DoctorGuideView />}
          {role === "user" && <PatientGuideView />}
          {role === "guest" && <GuestGuideView />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
