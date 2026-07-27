import { User, Phone, Mail, MapPin, Check } from "lucide-react";

interface PatientCardProps {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  progress?: number;
}

export default function PatientCard({
  name = "Nama Pasien",
  phone = "",
  email = "",
  city = "",
  progress = 0,
}: PatientCardProps) {
  return (
    <div className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
      <div className="p-6 text-center">
        {/* Avatar */}
        <div className="relative mx-auto w-32 h-32 mb-4">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] p-1">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <User className="w-16 h-16 text-[#2563EB]" strokeWidth={1.2} />
            </div>
          </div>
        </div>

        {/* Name & status */}
        <h2 className="text-xl font-bold text-gray-900 mb-1">{name}</h2>
        <p className="text-sm text-gray-500 mb-4 flex items-center justify-center gap-1">
          <Check className="w-3 h-3 text-green-500" /> Pasien Aktif
        </p>

        {/* Contact rows */}
        <div className="space-y-3 text-left">
          {phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-[#2563EB]" />
              <span className="text-gray-600 truncate">{phone}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-[#2563EB]" />
              <span className="text-gray-600 truncate">{email}</span>
            </div>
          )}
          {city && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-[#2563EB]" />
              <span className="text-gray-600 truncate">{city}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Kelengkapan Profil</span>
            <span className="font-bold text-[#2563EB]">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2563EB] to-[#1E3A8A]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
