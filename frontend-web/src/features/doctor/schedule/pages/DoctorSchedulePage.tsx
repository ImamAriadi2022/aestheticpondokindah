import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Stethoscope,
  CalendarDays,
  ListFilter,
  Eye,
  User,
  FileSpreadsheet,
  FileText,
  Filter,
  Phone,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { getSession } from "@/core/auth/services/session";
import { getDoctorQueue } from "@/features/doctor/dashboard/services/doctorDashboardService";
import { DUMMY_WEEKLY_RESERVATIONS } from "@/features/admin/reservation/services/dummyReservations";
import { type ReservationItem } from "@/features/admin/reservation/services/reservationService";
import { scrollPageToTop } from "@/core/router/ScrollToTop";
import { PageTransition } from "@/core/router/RouteTransition";
import { usePageRefresh } from "@/core/events/refreshEvents";

const STORAGE_KEY = "apig_doctor_cached_patients";

const DAYS_NAME = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function getStatusBadge(status?: string) {
  const raw = (status || "").toLowerCase();
  if (raw === "selesai" || raw === "completed") {
    return {
      bg: "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-500",
      label: "Selesai",
    };
  }
  if (raw === "dikonfirmasi" || raw === "confirmed" || raw === "dalam konsultasi") {
    return {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      label: "Dikonfirmasi",
    };
  }
  if (raw === "dibatalkan" || raw === "cancelled") {
    return {
      bg: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
      label: "Batal",
    };
  }
  return {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    label: "Menunggu",
  };
}

function cleanDocName(name?: string | null): string {
  if (!name) return "";
  return name.toLowerCase().replace(/^(drg\.|dr\.|drg|dr)\s*/i, "").trim();
}

interface DoctorSchedulePageProps {
  schedules?: any[];
  onRefresh?: () => void;
}

export default function DoctorSchedulePage({ onRefresh }: DoctorSchedulePageProps) {
  const session = getSession();
  const currentDoctorName = session?.name || "";
  const cleanCurrentDoctor = cleanDocName(currentDoctorName);

  // Read cached reservations immediately (0ms instant display)
  const [reservations, setReservations] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const isFetchingRef = useRef(false);

  // Fetch queue from backend
  const fetchReservations = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const queue = await getDoctorQueue();
      if (Array.isArray(queue)) {
        setReservations(queue);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
        } catch {}
      }
      if (onRefresh) onRefresh();
    } catch {
      // keep cache on error
    } finally {
      isFetchingRef.current = false;
    }
  }, [onRefresh]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  usePageRefresh(() => fetchReservations());

  // Base date for navigation (start of currently viewed week)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Format YYYY-MM-DD lokal
  const getLocalTodayIso = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Default tanggal hari ini (misal 2026-11-25)
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(() => getLocalTodayIso());

  // Generate 6 days for the current week (Senin s/d Sabtu)
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const isoDate = `${year}-${month}-${day}`;
      days.push({
        date: d,
        isoDate,
        dayName: DAYS_NAME[d.getDay()],
        dayNumber: d.getDate(),
        monthName: MONTH_NAMES[d.getMonth()],
      });
    }
    return days;
  }, [currentWeekStart]);

  // Combine backend reservations and sample dummy reservations filtered specifically for THIS doctor
  const myReservationsList = useMemo(() => {
    const list: ReservationItem[] = [];
    const seenCodes = new Set<string>();

    // 1. From backend (already scoped to current logged in doctor via backend DoctorQueueController)
    if (Array.isArray(reservations)) {
      reservations.forEach((r: any) => {
        const item: ReservationItem = {
          id: r.id,
          code: r.code || `RSV-${String(r.id).padStart(6, "0")}`,
          name: r.patient_name || r.name || "Pasien",
          phone: r.patient_phone || r.phone || "",
          treatment_interest: r.treatment_interest || "Pemeriksaan Gigi",
          doctor: r.doctor || currentDoctorName,
          date: r.date,
          preferred_time: r.preferred_time || "10:00 WIB",
          branch_name: r.branch_name || "Aesthetic Pondok Indah Main Branch",
          status: r.status || "Dikonfirmasi",
          complaint: r.complaint || "",
          createdAt: r.created_at || r.createdAt,
        };
        if (!seenCodes.has(item.code)) {
          seenCodes.add(item.code);
          list.push(item);
        }
      });
    }

    // 2. Dummy reservations matching current doctor name
    DUMMY_WEEKLY_RESERVATIONS.forEach((dummy) => {
      const dummyDocClean = cleanDocName(dummy.doctor);
      const isMatch =
        !cleanCurrentDoctor ||
        dummyDocClean.includes(cleanCurrentDoctor) ||
        cleanCurrentDoctor.includes(dummyDocClean);

      // If doctor is matches or if list is empty (fallback to populate doctor's schedule demo)
      if (isMatch && !seenCodes.has(dummy.code)) {
        seenCodes.add(dummy.code);
        list.push({
          ...dummy,
          doctor: currentDoctorName || dummy.doctor,
        });
      }
    });

    // If still empty (e.g. fresh doctor account), adapt existing dummy items with this doctor's name
    if (list.length === 0) {
      DUMMY_WEEKLY_RESERVATIONS.slice(0, 3).forEach((dummy) => {
        if (!seenCodes.has(dummy.code)) {
          seenCodes.add(dummy.code);
          list.push({
            ...dummy,
            doctor: currentDoctorName || dummy.doctor,
          });
        }
      });
    }

    return list;
  }, [reservations, cleanCurrentDoctor, currentDoctorName]);

  // Group reservations by date (YYYY-MM-DD)
  const reservationsByDate = useMemo(() => {
    const map = new Map<string, ReservationItem[]>();
    myReservationsList.forEach((item) => {
      if (!item.date) return;
      const dateKey = String(item.date).split("T")[0];
      const existing = map.get(dateKey) || [];
      existing.push(item);
      map.set(dateKey, existing);
    });
    return map;
  }, [myReservationsList]);

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
    setSelectedDateStr(null);
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
    setSelectedDateStr(null);
  };

  const weekHeaderLabel = useMemo(() => {
    if (!weekDays || weekDays.length === 0) return "";
    const first = weekDays[0];
    const last = weekDays[weekDays.length - 1];
    if (!first || !last) return "";
    return `${first.dayNumber} ${first.monthName.slice(0, 3)} – ${last.dayNumber} ${last.monthName.slice(0, 3)} ${last.date.getFullYear()}`;
  }, [weekDays]);

  const activeReservations = useMemo(() => {
    let list: ReservationItem[] = [];
    if (selectedDateStr) {
      list = reservationsByDate.get(selectedDateStr) || [];
    } else {
      weekDays.forEach((w) => {
        const dayList = reservationsByDate.get(w.isoDate) || [];
        list.push(...dayList);
      });
    }
    return list;
  }, [selectedDateStr, weekDays, reservationsByDate]);

  // Quick stats calculation for Doctor's summary
  const totalCount = myReservationsList.length;
  const newCount = myReservationsList.filter(
    (r) => r.status === "Baru" || r.status === "pending"
  ).length;
  const confirmedCount = myReservationsList.filter(
    (r) => r.status === "Dikonfirmasi" || r.status === "confirmed" || r.status === "Dalam Konsultasi"
  ).length;
  const completedCount = myReservationsList.filter(
    (r) => r.status === "Selesai" || r.status === "completed"
  ).length;

  const handleSelectReservation = (item: any) => {
    setSelectedPatient(item);
    scrollPageToTop();
  };

  const handleCloseDetail = () => {
    setSelectedPatient(null);
    scrollPageToTop();
  };

  // Export ke Excel XML Spreadsheet (.xls)
  const handleExportXLSX = () => {
    if (activeReservations.length === 0) return;
    const periodLabel = selectedDateStr ? selectedDateStr : `Minggu_${weekHeaderLabel.replace(/[\s–-]+/g, "_")}`;

    const rowsXml = activeReservations
      .map(
        (r, i) => `
        <Row>
          <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${i + 1}</Data></Cell>
          <Cell ss:StyleID="CellBold"><Data ss:Type="String">${r.code || `RSV-${r.id}`}</Data></Cell>
          <Cell ss:StyleID="CellText"><Data ss:Type="String">${r.name || "-"}</Data></Cell>
          <Cell ss:StyleID="CellText"><Data ss:Type="String">${r.treatment_interest || "-"}</Data></Cell>
          <Cell ss:StyleID="CellText"><Data ss:Type="String">${r.doctor || currentDoctorName}</Data></Cell>
          <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${r.date || "-"}</Data></Cell>
          <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${r.preferred_time || "-"}</Data></Cell>
          <Cell ss:StyleID="CellStatus"><Data ss:Type="String">${r.status || "Menunggu"}</Data></Cell>
        </Row>`
      )
      .join("");

    const excelXml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#2C2416"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9CDB8"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9CDB8"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9CDB8"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9CDB8"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#2C2416" ss:Bold="1"/>
   <Interior ss:Color="#FAF4E8" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="14" ss:Color="#8C6B1C" ss:Bold="1"/>
  </Style>
  <Style ss:ID="CellText">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#2C2416"/>
  </Style>
  <Style ss:ID="CellBold">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#8C6B1C" ss:Bold="1"/>
  </Style>
  <Style ss:ID="CellCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#4A3F35"/>
  </Style>
  <Style ss:ID="CellStatus">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE6D5"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#2C2416" ss:Bold="1"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Rekap Jadwal Praktik">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="35"/>
   <Column ss:Width="105"/>
   <Column ss:Width="160"/>
   <Column ss:Width="200"/>
   <Column ss:Width="180"/>
   <Column ss:Width="95"/>
   <Column ss:Width="85"/>
   <Column ss:Width="105"/>
   <Row ss:Height="26">
    <Cell ss:MergeAcross="7" ss:StyleID="TitleStyle"><Data ss:Type="String">Aesthetic Pondok Indah Dental Clinic - Jadwal Praktik Dokter (${currentDoctorName})</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">No</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Kode Booking</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Nama Pasien</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Layanan / Tindakan</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Dokter Pemeriksa</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Tanggal</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Waktu</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status</Data></Cell>
   </Row>
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([excelXml], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Jadwal_Praktik_Dokter_${currentDoctorName.replace(/[^a-zA-Z0-9]/g, "_")}_${periodLabel}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export ke PDF
  const handleExportPDF = () => {
    if (activeReservations.length === 0) return;
    const periodLabel = selectedDateStr ? selectedDateStr : `Minggu (${weekHeaderLabel})`;

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "none";
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) return;

    const rowsHtml = activeReservations
      .map((r, i) => {
        const st = (r.status || "").toLowerCase();
        let badgeBg = "#fef3c7";
        let badgeColor = "#92400e";
        if (st.includes("selesai")) {
          badgeBg = "#f3e8ff";
          badgeColor = "#6b21a8";
        } else if (st.includes("konfirmasi")) {
          badgeBg = "#d1fae5";
          badgeColor = "#065f46";
        } else if (st.includes("batal")) {
          badgeBg = "#fee2e2";
          badgeColor = "#991b1b";
        }

        return `
          <tr style="border-bottom: 1px solid #e5e7eb; ${i % 2 === 1 ? "background: #fafaf9;" : ""}">
            <td style="padding: 8px 6px; text-align: center; color: #57534e; font-size: 10px;">${i + 1}</td>
            <td style="padding: 8px 6px; color: #44403c; white-space: nowrap; font-size: 10.5px;">${r.code || `RSV-${r.id}`}</td>
            <td style="padding: 8px 6px; color: #1c1917; font-size: 10.5px;">${r.name || "-"}</td>
            <td style="padding: 8px 6px; color: #292524; font-size: 10.5px;">${r.treatment_interest || "-"}</td>
            <td style="padding: 8px 6px; color: #292524; font-size: 10.5px;">${r.doctor || currentDoctorName}</td>
            <td style="padding: 8px 6px; color: #44403c; white-space: nowrap; font-size: 10px;">${r.date || "-"}</td>
            <td style="padding: 8px 6px; color: #44403c; white-space: nowrap; font-size: 10px;">${r.preferred_time || "-"}</td>
            <td style="padding: 8px 6px; text-align: center; white-space: nowrap;">
              <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 9.5px; background: ${badgeBg}; color: ${badgeColor};">
                ${r.status || "Menunggu"}
              </span>
            </td>
          </tr>
        `;
      })
      .join("");

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title></title>
          <style>
            @page { size: A4 landscape; margin: 10mm 12mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; }
            body { color: #1c1917; background: #fff; line-height: 1.4; font-size: 11px; }
            .header-box { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 10px; border-bottom: 1.5px solid #8c6b1c; margin-bottom: 12px; }
            .clinic-name { font-size: 15px; font-weight: bold; color: #1c1917; }
            .clinic-desc { font-size: 10.5px; color: #57534e; margin-top: 2px; }
            .doc-heading { text-align: right; }
            .doc-heading h2 { font-size: 13.5px; font-weight: bold; color: #8c6b1c; text-transform: uppercase; }
            .meta-strip { display: flex; justify-content: space-between; background: #f7f4ec; border: 1px solid #e7decb; padding: 6px 10px; border-radius: 6px; margin-bottom: 10px; font-size: 10px; color: #44403c; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f5ece0; border-bottom: 1.5px solid #d9cdb8; padding: 7px 6px; text-align: left; font-size: 10.5px; font-weight: bold; color: #2c2416; }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div>
              <div class="clinic-name">AESTHETIC PONDOK INDAH DENTAL CLINIC</div>
              <div class="clinic-desc">Laporan Resmi Daftar Janji Temu Dokter</div>
            </div>
            <div class="doc-heading">
              <h2>Jadwal Praktik & Appointment</h2>
              <p>${currentDoctorName}</p>
            </div>
          </div>
          <div class="meta-strip">
            <span>Periode: ${periodLabel}</span>
            <span>Total Pasien: ${activeReservations.length}</span>
            <span>Waktu Cetak: ${new Date().toLocaleDateString("id-ID")}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 32px; text-align: center;">No</th>
                <th style="width: 110px;">Kode</th>
                <th style="width: 140px;">Nama Pasien</th>
                <th>Layanan / Tindakan</th>
                <th style="width: 190px;">Dokter Spesialis</th>
                <th style="width: 85px;">Jadwal</th>
                <th style="width: 80px;">Waktu</th>
                <th style="width: 95px; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);
    frameDoc.close();

    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 1500);
    }, 300);
  };

  return (
    <div className="space-y-5 text-left">
      <PageTransition transitionKey={selectedPatient ? `detail_${selectedPatient.id}` : "list"}>
        {selectedPatient ? (
          /* In-Page Booking Detail View (No Modal Dialog) */
          <div className="space-y-6 text-left animate-in fade-in duration-150">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-3xl border border-[#EADBBD] shadow-xs">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-[#4A3F35]">
                    Detail Data Pasien
                  </h2>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#8C6B1C]/10 text-[#8C6B1C] border border-[#8C6B1C]/20">
                    #{selectedPatient.code || `RSV-${selectedPatient.id}`}
                  </span>
                </div>
                <p className="hidden sm:block text-xs text-[#8A7B6B] mt-0.5">
                  Informasi reservasi janji temu klinik Aesthetic Pondok Indah
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDetail}
                  className="rounded-xl text-xs font-bold px-4 py-2 h-9 border-[#EADBBD] text-[#4A3F35] hover:bg-[#FAF8F5] cursor-pointer"
                >
                  ← Kembali ke Jadwal
                </Button>
              </div>
            </div>

            {/* Patient Detail Cards */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 rounded-2xl bg-[#FAF5EA]/80 border border-[#EADBBD]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#8C6B1C]" />
                  <span className="text-xs text-[#8A7B6B]">Cabang:</span>
                  <span className="text-xs font-bold text-[#4A3F35]">
                    {selectedPatient.branch_name || "Aesthetic Pondok Indah Main Branch"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8A7B6B]">Status:</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedPatient.status === "Selesai"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : selectedPatient.status === "Dikonfirmasi" || selectedPatient.status === "Dalam Konsultasi"
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {selectedPatient.status || "Menunggu"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-[#F0E6D3] shadow-xs space-y-3">
                  <div className="flex items-center gap-1.5 pb-2.5 border-b border-[#F5F0E8] text-[#8C6B1C] font-bold text-xs">
                    <User className="w-4 h-4" />
                    <span>Data Pasien</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[#8A7B6B] block text-[11px]">Nama Lengkap</span>
                      <span className="font-bold text-[#4A3F35] text-sm truncate block mt-0.5">
                        {selectedPatient.patient_name || selectedPatient.name || "-"}
                      </span>
                    </div>
                    {selectedPatient.phone && (
                      <div>
                        <span className="text-[#8A7B6B] block text-[11px]">No. Telepon / WhatsApp</span>
                        <div className="flex items-center gap-1.5 font-bold text-[#4A3F35] mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-[#C9A24A]" />
                          <span>{selectedPatient.phone}</span>
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-[#8A7B6B] block text-[11px]">Dokter Pemeriksa</span>
                      <span className="font-semibold text-[#8C6B1C] text-xs block mt-0.5">
                        {selectedPatient.doctor || currentDoctorName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#F0E6D3] shadow-xs space-y-3">
                  <div className="flex items-center gap-1.5 pb-2.5 border-b border-[#F5F0E8] text-[#8C6B1C] font-bold text-xs">
                    <CalendarDays className="w-4 h-4" />
                    <span>Jadwal & Layanan</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[#8A7B6B] block text-[11px]">Tanggal Periksa</span>
                      <div className="flex items-center gap-1.5 font-bold text-[#4A3F35] mt-0.5">
                        <CalendarIcon className="w-4 h-4 text-[#C9A24A]" />
                        <span>{selectedPatient.date || "-"}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[#8A7B6B] block text-[11px]">Jam Praktik</span>
                      <div className="flex items-center gap-1.5 font-bold text-[#8C6B1C] mt-0.5">
                        <Clock className="w-4 h-4 text-[#C9A24A]" />
                        <span>{String(selectedPatient.preferred_time || "Sesuai Jadwal").replace(/\s*WIB\s*$/i, "")} WIB</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[#8A7B6B] block text-[11px]">Perawatan yang Dipilih</span>
                      <span className="font-semibold text-[#4A3F35] block text-xs mt-0.5">
                        {selectedPatient.treatment_interest || "Pemeriksaan Dokter Gigi"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Kalender Appointment Box */}
            <div className="bg-white rounded-3xl border border-[#F0E6D3] p-5 sm:p-6 shadow-xs space-y-5">
              {/* Calendar Header with Controls */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#F7EFE2]">
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="w-5 h-5 text-[#8C6B1C]" />
                  <div>
                    <h3 className="text-base font-bold text-[#3D332A]">
                      Kalender Appointment
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevWeek}
                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#E8DFC8] hover:bg-[#FAF4E8] text-[#5C4D3C] transition-all cursor-pointer"
                    title="Minggu Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextWeek}
                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#E8DFC8] hover:bg-[#FAF4E8] text-[#5C4D3C] transition-all cursor-pointer"
                    title="Minggu Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 6 Days Grid (Senin - Sabtu) */}
              <div className="grid grid-cols-6 gap-1 sm:gap-2.5">
                {weekDays.map((d) => {
                  const list = reservationsByDate.get(d.isoDate) || [];
                  const count = list.length;
                  const isSelected = selectedDateStr === d.isoDate;
                  const isToday = getLocalTodayIso() === d.isoDate;

                  return (
                    <div
                      key={d.isoDate}
                      onClick={() =>
                        setSelectedDateStr((prev) => (prev === d.isoDate ? null : d.isoDate))
                      }
                      className={`rounded-xl sm:rounded-2xl p-1.5 sm:p-3 border transition-all cursor-pointer text-center sm:text-left flex flex-col justify-center sm:justify-between min-h-[58px] sm:min-h-[105px] ${
                        isSelected
                          ? "bg-[#FAF4E8] border-[#C9A24A] shadow-xs ring-2 ring-[#C9A24A]/20"
                          : isToday
                          ? "bg-white border-[#B8943F]/60 shadow-2xs hover:border-[#B8943F]"
                          : "bg-white border-[#F0E6D3] hover:border-[#D9CDB8] hover:bg-[#FCFAF7]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-center sm:justify-between">
                          <span
                            className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
                              isSelected || isToday ? "text-[#8C6B1C]" : "text-[#8A7B6B]"
                            }`}
                          >
                            {d.dayName}
                          </span>
                          {isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B8943F] hidden sm:inline-block" title="Hari ini" />
                          )}
                        </div>
                        <div className="text-sm sm:text-xl font-bold text-[#3D332A] mt-0.5">
                          {d.dayNumber}
                        </div>
                      </div>

                      <div className="hidden sm:flex mt-2 pt-2 border-t border-[#F5ECE0] items-center justify-between text-[11px]">
                        <span className="text-[#8A7B6B] font-medium">Janji:</span>
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded-md ${
                            count > 0
                              ? "bg-[#FAF4E8] text-[#8C6B1C] border border-[#E8DFC8]"
                              : "text-[#B8A99A]"
                          }`}
                        >
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Day / Active Appointments Summary Header & Table */}
              <div className="pt-2 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <ListFilter className="w-4 h-4 text-[#8C6B1C]" />
                    <h4 className="text-xs font-bold text-[#3D332A] uppercase tracking-wider">
                      {selectedDateStr
                        ? `BOOKING TERJADWAL: ${selectedDateStr}`
                        : "BOOKING TERJADWAL MINGGU INI"}
                    </h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAF4E8] text-[#8C6B1C] border border-[#E8DFC8]">
                      {activeReservations.length} Pasien
                    </span>

                    {/* Tombol Tampilkan Semua Hari */}
                    {selectedDateStr && (
                      <button
                        type="button"
                        onClick={() => setSelectedDateStr(null)}
                        className="text-xs font-semibold text-[#8C6B1C] hover:underline cursor-pointer ml-1"
                      >
                        Tampilkan Semua Hari
                      </button>
                    )}
                  </div>

                  {/* Tombol Export */}
                  {!selectedDateStr && (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleExportXLSX}
                        disabled={activeReservations.length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DFC8] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#3D332A] shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                        title="Export data ke format Spreadsheet (Excel)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Export XLSX</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportPDF}
                        disabled={activeReservations.length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DFC8] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#3D332A] shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                        title="Cetak atau simpan sebagai dokumen PDF resmi"
                      >
                        <FileText className="w-3.5 h-3.5 text-red-600" />
                        <span>Export PDF</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Appointment Table in Week */}
                {activeReservations.length === 0 ? (
                  <div className="py-8 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E8DFC8] text-[#8A7B6B]">
                    <CalendarIcon className="w-7 h-7 mx-auto mb-1.5 opacity-40 text-[#8C6B1C]" />
                    <p className="text-xs font-medium">Tidak ada booking janji temu pada periode ini.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#FAF8F5] border-b border-[#F0E6D3]">
                            <TableHead className="font-bold text-[#3D332A] py-3.5 pl-3 sm:pl-5 text-xs">Nama</TableHead>
                            <TableHead className="hidden md:table-cell font-bold text-[#3D332A] py-3.5 text-xs">Layanan</TableHead>
                            <TableHead className="hidden md:table-cell font-bold text-[#3D332A] py-3.5 text-xs">Dokter</TableHead>
                            <TableHead className="hidden md:table-cell font-bold text-[#3D332A] py-3.5 text-xs">Jadwal</TableHead>
                            <TableHead className="hidden md:table-cell font-bold text-[#3D332A] py-3.5 text-xs">Waktu</TableHead>
                            <TableHead className="font-bold text-[#3D332A] py-3.5 text-xs">Status</TableHead>
                            <TableHead className="font-bold text-[#3D332A] py-3.5 pr-3 sm:pr-5 text-right text-xs">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeReservations.map((item) => {
                            const status = getStatusBadge(item.status);
                            const pName = item.name || "Pasien";
                            const sName = item.treatment_interest || "Pemeriksaan Gigi";
                            const dName = item.doctor || currentDoctorName;
                            const rawDate = item.date ? String(item.date).split("T")[0] : "-";
                            const rawTime = item.preferred_time || "10:00 WIB";

                            let dayFormatted = "-";
                            let dateFormatted = rawDate;
                            if (rawDate !== "-") {
                              const dt = new Date(rawDate);
                              const dayIdx = dt.getDay();
                              dayFormatted = DAYS_NAME[dayIdx] || "";
                              const dayNum = dt.getDate();
                              const monthShort = MONTH_NAMES[dt.getMonth()]?.slice(0, 3) || "";
                              const yearNum = dt.getFullYear();
                              dateFormatted = `${dayNum} ${monthShort} ${yearNum}`;
                            }

                            return (
                              <TableRow
                                key={item.id}
                                className="hover:bg-[#FDFBF7] transition-colors border-b border-[#F5ECE0]"
                              >
                                {/* Nama */}
                                <TableCell className="py-3.5 pl-3 sm:pl-5">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#3D332A]">
                                    <User className="w-3.5 h-3.5 text-[#B8943F] shrink-0" />
                                    <span>{pName}</span>
                                  </div>
                                </TableCell>

                                {/* Layanan */}
                                <TableCell className="hidden md:table-cell py-3.5">
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3D332A] max-w-[200px] truncate">
                                    <Sparkles className="w-3.5 h-3.5 text-[#C9A24A] shrink-0" />
                                    <span className="truncate">{sName}</span>
                                  </div>
                                </TableCell>

                                {/* Dokter */}
                                <TableCell className="hidden md:table-cell py-3.5">
                                  <div className="flex items-center gap-1.5 text-xs text-[#5C4D3C] max-w-[190px] truncate">
                                    <Stethoscope className="w-3.5 h-3.5 text-[#B8943F] shrink-0" />
                                    <span className="truncate font-medium">{dName}</span>
                                  </div>
                                </TableCell>

                                {/* Jadwal */}
                                <TableCell className="hidden md:table-cell py-3.5">
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3D332A]">
                                    <CalendarIcon className="w-3.5 h-3.5 text-[#B8943F] shrink-0" />
                                    <span>{dayFormatted}, {dateFormatted}</span>
                                  </div>
                                </TableCell>

                                {/* Waktu */}
                                <TableCell className="hidden md:table-cell py-3.5">
                                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#5C4D3C]">
                                    <Clock className="w-3.5 h-3.5 text-[#B8943F] shrink-0" />
                                    <span>{rawTime}</span>
                                  </div>
                                </TableCell>

                                {/* Status */}
                                <TableCell className="py-3.5">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.bg}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                    {status.label}
                                  </span>
                                </TableCell>

                                {/* Aksi */}
                                <TableCell className="py-3.5 pr-3 sm:pr-5 text-right">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSelectReservation(item)}
                                    className="h-7 w-7 p-0 bg-[#FAF4E8] hover:bg-[#F5E6C8] text-[#8A6B2B] rounded-xl border border-[#E8D4A2]/60 transition-all shadow-2xs inline-flex items-center justify-center cursor-pointer"
                                    title="Lihat Detail Pasien"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ringkasan Status 4 Kolom di Bawah (Persis seperti Gambar 2) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Total Reservasi */}
              <div className="bg-white rounded-2xl p-4 border border-[#EADBBD] shadow-2xs flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full border-2 border-[#8C6B1C] flex items-center justify-center mb-2">
                  <span className="text-sm font-bold text-[#3D332A]">{totalCount}</span>
                </div>
                <span className="text-xs font-semibold text-[#4A3F35]">Total Reservasi</span>
              </div>

              {/* Perlu Konfirmasi */}
              <div className="bg-white rounded-2xl p-4 border border-[#EADBBD] shadow-2xs flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full border-2 border-[#E5A024] flex items-center justify-center mb-2">
                  <span className="text-sm font-bold text-[#3D332A]">{newCount}</span>
                </div>
                <span className="text-xs font-semibold text-[#4A3F35]">Perlu Konfirmasi</span>
              </div>

              {/* Dikonfirmasi */}
              <div className="bg-white rounded-2xl p-4 border border-[#EADBBD] shadow-2xs flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full border-2 border-[#10B981] flex items-center justify-center mb-2">
                  <span className="text-sm font-bold text-[#3D332A]">{confirmedCount}</span>
                </div>
                <span className="text-xs font-semibold text-[#4A3F35]">Dikonfirmasi</span>
              </div>

              {/* Selesai Dirawat */}
              <div className="bg-white rounded-2xl p-4 border border-[#EADBBD] shadow-2xs flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full border-2 border-[#8B5CF6] flex items-center justify-center mb-2">
                  <span className="text-sm font-bold text-[#3D332A]">{completedCount}</span>
                </div>
                <span className="text-xs font-semibold text-[#4A3F35]">Selesai Dirawat</span>
              </div>
            </div>
          </div>
        )}
      </PageTransition>
    </div>
  );
}
