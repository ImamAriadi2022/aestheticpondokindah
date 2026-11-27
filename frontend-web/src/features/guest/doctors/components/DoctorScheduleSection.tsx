import { useMemo } from "react";
import type { Doctor } from "./DoctorCard";

interface DoctorScheduleSectionProps {
  doctors: Doctor[];
}

interface DoctorScheduleRow {
  name: string;
  days: {
    Senin: boolean;
    Selasa: boolean;
    Rabu: boolean;
    Kamis: boolean;
    Jumat: boolean;
    Sabtu: boolean;
  };
}

const DAYS_HEADER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;

// Unified Doctor List (GP + SP)
const ALL_DOCTORS_BASE: Array<{
  name: string;
  days: Record<(typeof DAYS_HEADER)[number], boolean>;
}> = [
  // GP
  {
    name: "drg. Yulita Dora",
    days: { Senin: true, Selasa: false, Rabu: false, Kamis: true, Jumat: false, Sabtu: false },
  },
  {
    name: "drg. Della Sparringa",
    days: { Senin: true, Selasa: false, Rabu: false, Kamis: true, Jumat: false, Sabtu: false },
  },
  {
    name: "drg. Nona Lolita",
    days: { Senin: false, Selasa: true, Rabu: false, Kamis: false, Jumat: false, Sabtu: false },
  },
  {
    name: "drg. Ryan Jusuf",
    days: { Senin: false, Selasa: false, Rabu: true, Kamis: false, Jumat: true, Sabtu: false },
  },
  {
    name: "drg. Shilvy",
    days: { Senin: false, Selasa: false, Rabu: false, Kamis: false, Jumat: false, Sabtu: true },
  },
  // SP (Available Mon - Sat by appointment)
  {
    name: "drg. Sharah Syam, Sp. Ort",
    days: { Senin: true, Selasa: true, Rabu: true, Kamis: true, Jumat: true, Sabtu: true },
  },
  {
    name: "drg. Melati Putri, Sp. Pros",
    days: { Senin: true, Selasa: true, Rabu: true, Kamis: true, Jumat: true, Sabtu: true },
  },
  {
    name: "drg. Achmad Riwandy, Sp. Pros",
    days: { Senin: true, Selasa: true, Rabu: true, Kamis: true, Jumat: true, Sabtu: true },
  },
  {
    name: "drg. Eric Sulstyo, Sp. Perio",
    days: { Senin: true, Selasa: true, Rabu: true, Kamis: true, Jumat: true, Sabtu: true },
  },
  {
    name: "drg. Stevany, Sp. Perio",
    days: { Senin: true, Selasa: true, Rabu: true, Kamis: true, Jumat: true, Sabtu: true },
  },
  {
    name: "drg. Riesta Paluvi, Sp. KG",
    days: { Senin: true, Selasa: true, Rabu: true, Kamis: true, Jumat: true, Sabtu: true },
  },
  {
    name: "drg. Pramodanti, Sp. KG",
    days: { Senin: true, Selasa: true, Rabu: true, Kamis: true, Jumat: true, Sabtu: true },
  },
  {
    name: "drg. Yudy Ardila Utomo, Sp. BMM",
    days: { Senin: true, Selasa: true, Rabu: true, Kamis: true, Jumat: true, Sabtu: true },
  },
  {
    name: "drg. Hardi Sasono, Sp. BM",
    days: { Senin: true, Selasa: true, Rabu: true, Kamis: true, Jumat: true, Sabtu: true },
  },
];

export default function DoctorScheduleSection({ doctors }: DoctorScheduleSectionProps) {
  // Sync with dynamic admin schedule if exists
  const rows: DoctorScheduleRow[] = useMemo(() => {
    const dayMapIdx: Record<number, (typeof DAYS_HEADER)[number]> = {
      1: "Senin",
      2: "Selasa",
      3: "Rabu",
      4: "Kamis",
      5: "Jumat",
      6: "Sabtu",
    };

    const adminSchedulesByDoc: Record<string, Set<(typeof DAYS_HEADER)[number]>> = {};

    doctors.forEach((d) => {
      if (Array.isArray(d.schedules) && d.schedules.length > 0) {
        d.schedules.forEach((slot) => {
          if (!slot.date) return;
          try {
            const parts = slot.date.split("-").map(Number);
            const dt = new Date(parts[0], parts[1] - 1, parts[2]);
            const dayName = dayMapIdx[dt.getDay()];
            if (dayName) {
              if (!adminSchedulesByDoc[d.name]) {
                adminSchedulesByDoc[d.name] = new Set();
              }
              adminSchedulesByDoc[d.name].add(dayName);
            }
          } catch {
            // ignore
          }
        });
      }
    });

    const findDoc = (name: string) => {
      const clean = name.toLowerCase().replace(/[^a-z]/g, "");
      return doctors.find((d) => {
        const dClean = d.name.toLowerCase().replace(/[^a-z]/g, "");
        return dClean.includes(clean) || clean.includes(dClean);
      });
    };

    return ALL_DOCTORS_BASE.map((item) => {
      const doc = findDoc(item.name);
      const days = { ...item.days };

      // Override if admin has set explicit dates
      if (doc && adminSchedulesByDoc[doc.name] && adminSchedulesByDoc[doc.name].size > 0) {
        DAYS_HEADER.forEach((day) => {
          days[day] = adminSchedulesByDoc[doc.name].has(day);
        });
      }

      return {
        name: doc?.name || item.name,
        days,
      };
    });
  }, [doctors]);

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-black tracking-tight uppercase mb-6">
          JADWAL PRAKTIK DOKTER
        </h2>

        <div className="overflow-x-auto pb-2">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-3 pr-4 font-bold text-sm sm:text-base text-gray-900 w-[40%]">
                  Nama Dokter
                </th>
                {DAYS_HEADER.map((day) => (
                  <th
                    key={day}
                    className="py-3 px-3 text-center font-bold text-sm sm:text-base text-gray-900"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/80">
              {rows.map((doc, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 pr-4">
                    <span className="font-medium text-sm sm:text-base text-gray-800">
                      {doc.name}
                    </span>
                  </td>
                  {DAYS_HEADER.map((day) => (
                    <td key={day} className="py-3.5 px-3 text-center">
                      {doc.days[day] ? (
                        <span className="inline-flex items-center justify-center text-gray-800 font-semibold text-lg">
                          ✓
                        </span>
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs sm:text-sm text-gray-500 font-normal leading-relaxed">
          <span className="font-medium text-gray-600">Keterangan:</span> Jadwal dapat berubah
          sewaktu-waktu. Dokter juga dapat melayani pasien berdasarkan perjanjian (by appointment).
        </p>
      </div>
    </section>
  );
}
