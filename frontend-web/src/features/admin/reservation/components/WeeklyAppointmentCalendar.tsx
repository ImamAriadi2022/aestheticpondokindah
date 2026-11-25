import { useState, useMemo } from "react";
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
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import type { ReservationItem } from "../services/reservationService";

type Props = {
  reservations: ReservationItem[];
  onSelectReservation?: (item: ReservationItem) => void;
};

const DAYS_NAME = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function getStatusBadge(status: string) {
  const raw = (status || "").toLowerCase();
  if (raw === "selesai" || raw === "completed") {
    return {
      bg: "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-500",
      label: "Selesai",
    };
  }
  if (raw === "dikonfirmasi" || raw === "confirmed") {
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

export default function WeeklyAppointmentCalendar({
  reservations,
  onSelectReservation,
}: Props) {
  // Base date for navigation (start of currently viewed week)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    // Monday as start of week
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

  // Default langsung aktifkan/select tanggal hari ini (misal 26 Nov 2026)
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(() => getLocalTodayIso());

  // Generate 6 days for the current week (Senin s/d Sabtu, Hari Minggu di-skip)
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

  // Group reservations by date (YYYY-MM-DD)
  const reservationsByDate = useMemo(() => {
    const map = new Map<string, ReservationItem[]>();
    reservations.forEach((item) => {
      if (!item.date) return;
      const dateKey = String(item.date).split("T")[0];
      const existing = map.get(dateKey) || [];
      existing.push(item);
      map.set(dateKey, existing);
    });
    return map;
  }, [reservations]);

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

  const handleCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
    setSelectedDateStr(null);
  };

  // Header display string e.g. "23 Nov – 28 Nov 2026"
  const weekHeaderLabel = useMemo(() => {
    if (!weekDays || weekDays.length === 0) return "";
    const first = weekDays[0];
    const last = weekDays[weekDays.length - 1];
    if (!first || !last) return "";
    return `${first.dayNumber} ${first.monthName.slice(0, 3)} – ${last.dayNumber} ${last.monthName.slice(0, 3)} ${last.date.getFullYear()}`;
  }, [weekDays]);

  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>("Semua");

  // Daftar dokter unik yang bertugas/memiliki booking di minggu yang sedang dilihat
  const doctorsInWeek = useMemo(() => {
    const docSet = new Set<string>();
    weekDays.forEach((w) => {
      const list = reservationsByDate.get(w.isoDate) || [];
      list.forEach((item) => {
        if (item.doctor) docSet.add(item.doctor.trim());
      });
    });
    return Array.from(docSet);
  }, [weekDays, reservationsByDate]);

  const activeReservations = useMemo(() => {
    let list: ReservationItem[] = [];
    if (selectedDateStr) {
      list = reservationsByDate.get(selectedDateStr) || [];
    } else {
      // All reservations in current week
      weekDays.forEach((w) => {
        const dayList = reservationsByDate.get(w.isoDate) || [];
        list.push(...dayList);
      });
    }

    // Filter dokter bila tombol "Tampilkan Semua Hari" aktif atau dokter dipilih
    if (!selectedDateStr && selectedDoctorFilter !== "Semua") {
      list = list.filter((r) => r.doctor?.trim() === selectedDoctorFilter);
    } else if (selectedDoctorFilter !== "Semua") {
      list = list.filter((r) => r.doctor?.trim() === selectedDoctorFilter);
    }

    return list;
  }, [selectedDateStr, weekDays, reservationsByDate, selectedDoctorFilter]);

  // Export ke Excel XML Spreadsheet (.xls) asli dengan table style autofit & rapi
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
          <Cell ss:StyleID="CellText"><Data ss:Type="String">${r.doctor || "-"}</Data></Cell>
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
 <Worksheet ss:Name="Rekap Reservasi">
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
    <Cell ss:MergeAcross="7" ss:StyleID="TitleStyle"><Data ss:Type="String">Aesthetic Pondok Indah Dental Clinic - Rekap Reservasi (${selectedDateStr ? selectedDateStr : weekHeaderLabel})</Data></Cell>
   </Row>
   <Row ss:Height="12"></Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">No</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Kode Booking</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Nama Pasien</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Layanan</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Dokter Spesialis</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Jadwal</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Waktu</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status</Data></Cell>
   </Row>
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([excelXml], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_Reservasi_${periodLabel}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Cetak & Unduh PDF Langsung via Native Print Engine (Tata letak presisi, font standar, anti-wrap sempit)
  const handleExportPDF = () => {
    if (activeReservations.length === 0) return;
    const periodLabel = selectedDateStr ? `Tanggal ${selectedDateStr}` : `Periode ${weekHeaderLabel}`;
    const cleanPeriodFile = (selectedDateStr || weekHeaderLabel).replace(/[\s–-]+/g, "_");

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) {
      window.print();
      return;
    }

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
            <td style="padding: 8px 6px; text-align: center; color: #57534e; font-size: 10px; font-weight: normal;">${i + 1}</td>
            <td style="padding: 8px 6px; font-weight: normal; color: #44403c; white-space: nowrap; font-size: 10.5px;">${r.code || `RSV-${r.id}`}</td>
            <td style="padding: 8px 6px; font-weight: normal; color: #1c1917; font-size: 10.5px;">${r.name || "-"}</td>
            <td style="padding: 8px 6px; color: #292524; font-size: 10.5px; font-weight: normal;">${r.treatment_interest || "-"}</td>
            <td style="padding: 8px 6px; color: #292524; font-size: 10.5px; font-weight: normal;">${r.doctor || "-"}</td>
            <td style="padding: 8px 6px; color: #44403c; white-space: nowrap; font-size: 10px; font-weight: normal;">${r.date || "-"}</td>
            <td style="padding: 8px 6px; color: #44403c; white-space: nowrap; font-size: 10px; font-weight: normal;">${r.preferred_time || "-"}</td>
            <td style="padding: 8px 6px; text-align: center; white-space: nowrap; font-weight: normal;">
              <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 9.5px; font-weight: normal; background: ${badgeBg}; color: ${badgeColor};">
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
            @page { 
              size: A4 landscape; 
              margin: 10mm 12mm; 
              margin-top: 6mm;
              margin-bottom: 6mm;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; font-weight: normal !important; }
            body { 
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
              color: #1c1917; 
              background: #fff; 
              line-height: 1.4; 
              font-size: 11px; 
              font-weight: normal !important;
            }
            .header-box { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-end; 
              padding-bottom: 10px; 
              border-bottom: 1.5px solid #8c6b1c; 
              margin-bottom: 12px; 
            }
            .clinic-name { 
              font-size: 15px; 
              font-weight: normal; 
              color: #1c1917; 
              letter-spacing: -0.1px; 
            }
            .clinic-desc { 
              font-size: 10.5px; 
              color: #57534e; 
              margin-top: 2px; 
              font-weight: normal;
            }
            .doc-heading { 
              text-align: right; 
            }
            .doc-heading h2 { 
              font-size: 13.5px; 
              font-weight: normal; 
              color: #8c6b1c; 
              text-transform: uppercase; 
              letter-spacing: 0.3px; 
            }
            .doc-heading p { 
              font-size: 10px; 
              color: #57534e; 
              margin-top: 2px; 
              font-weight: normal;
            }
            .meta-strip { 
              display: flex; 
              justify-content: space-between; 
              background: #f7f4ec; 
              border: 1px solid #e7decb; 
              padding: 6px 10px; 
              border-radius: 6px; 
              margin-bottom: 10px; 
              font-size: 10px; 
              font-weight: normal; 
              color: #44403c; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              table-layout: auto; 
              font-weight: normal;
            }
            th { 
              background: #f7f4ec; 
              color: #292524; 
              font-weight: normal; 
              text-align: left; 
              padding: 7px 6px; 
              border-top: 1px solid #e7decb; 
              border-bottom: 1.5px solid #e7decb; 
              font-size: 10px; 
              text-transform: uppercase; 
              letter-spacing: 0.2px; 
            }
            td {
              font-weight: normal;
            }
            .footer-strip { 
              margin-top: 16px; 
              padding-top: 8px; 
              border-top: 1px solid #e5e7eb; 
              display: flex; 
              justify-content: space-between; 
              font-size: 9px; 
              color: #78716c; 
              font-weight: normal;
            }
          </style>
        </head> 
              color: #292524; 
              font-weight: 700; 
              text-align: left; 
              padding: 8px; 
              border-top: 1px solid #e7decb; 
              border-bottom: 2px solid #e7decb; 
              font-size: 10px; 
              text-transform: uppercase; 
              letter-spacing: 0.3px; 
            }
            .footer-strip { 
              margin-top: 20px; 
              padding-top: 10px; 
              border-top: 1px solid #e5e7eb; 
              display: flex; 
              justify-content: space-between; 
              font-size: 9.5px; 
              color: #78716c; 
            }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div>
              <div class="clinic-name">AESTHETIC PONDOK INDAH DENTAL CLINIC</div>
              <div class="clinic-desc">Laporan Resmi Daftar Janji Temu Pasien</div>
            </div>
            <div class="doc-heading">
              <h2>Rekapitulasi Reservasi</h2>
              <p>${periodLabel}</p>
            </div>
          </div>

          <div class="meta-strip">
            <span>Filter Dokter: ${selectedDoctorFilter}</span>
            <span>Total Reservasi: ${activeReservations.length} Pasien</span>
            <span>Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB</span>
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

          <div class="footer-strip">
            <span>Dicetak otomatis oleh Sistem Manajemen Reservasi Klinik AESPI</span>
            <span>Dokumen Administrasi Front Desk</span>
          </div>
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
    <div className="bg-white rounded-3xl border border-[#F0E6D3] p-5 sm:p-6 shadow-xs space-y-5">
      {/* Calendar Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F7EFE2]">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="w-5 h-5 text-[#8C6B1C]" />
          <div>
            <h3 className="text-base font-bold text-[#3D332A]">
              Kalender Appointment
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
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
              className={`rounded-2xl p-3 border transition-all cursor-pointer text-left flex flex-col justify-between min-h-[105px] ${
                isSelected
                  ? "bg-[#FAF4E8] border-[#C9A24A] shadow-xs ring-2 ring-[#C9A24A]/20"
                  : isToday
                  ? "bg-white border-[#B8943F]/60 shadow-2xs hover:border-[#B8943F]"
                  : "bg-white border-[#F0E6D3] hover:border-[#D9CDB8] hover:bg-[#FCFAF7]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      isSelected || isToday ? "text-[#8C6B1C]" : "text-[#8A7B6B]"
                    }`}
                  >
                    {d.dayName}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8943F]" title="Hari ini" />
                  )}
                </div>
                <div className="text-xl font-bold text-[#3D332A] mt-0.5">
                  {d.dayNumber}
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-[#F5ECE0] flex items-center justify-between text-[11px]">
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

      {/* Selected Day / Active Appointments Summary Card with Conditional Sort & Export Actions */}
      <div className="pt-2 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <ListFilter className="w-4 h-4 text-[#8C6B1C]" />
            <h4 className="text-xs font-bold text-[#3D332A] uppercase tracking-wider">
              {selectedDateStr
                ? `Booking Terjadwal: ${selectedDateStr}`
                : "Booking Terjadwal Minggu Ini"}
            </h4>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAF4E8] text-[#8C6B1C] border border-[#E8DFC8]">
              {activeReservations.length} Pasien
            </span>

            {/* Saat per-hari aktif: Tampilkan tombol Tampilkan Semua Hari */}
            {selectedDateStr && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDateStr(null);
                  setSelectedDoctorFilter("Semua");
                }}
                className="text-xs font-semibold text-[#8C6B1C] hover:underline cursor-pointer ml-1"
              >
                Tampilkan Semua Hari
              </button>
            )}
          </div>

          {/* Sortir dan Export HANYA muncul ketika "Tampilkan Semua Hari" aktif (selectedDateStr === null) */}
          {!selectedDateStr && (
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Sortir Dokter dalam Minggu Ini */}
              <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E8DFC8] px-2.5 py-1 rounded-xl text-xs">
                <Filter className="w-3.5 h-3.5 text-[#8C6B1C]" />
                <span className="text-[#8A7B6B] font-medium hidden sm:inline">Dokter:</span>
                <select
                  value={selectedDoctorFilter}
                  onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#3D332A] focus:outline-hidden cursor-pointer"
                >
                  <option value="Semua">Semua Dokter ({doctorsInWeek.length})</option>
                  {doctorsInWeek.map((doc) => (
                    <option key={doc} value={doc}>
                      {doc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tombol Export XLSX */}
              <button
                type="button"
                onClick={handleExportXLSX}
                disabled={activeReservations.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DFC8] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#3D332A] shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                title="Export data ke format Spreadsheet (Excel/CSV)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export XLSX</span>
              </button>

              {/* Tombol Export PDF */}
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
                    <TableHead className="font-bold text-[#3D332A] py-3.5 pl-5 text-xs">Nama</TableHead>
                    <TableHead className="font-bold text-[#3D332A] py-3.5 text-xs">Layanan</TableHead>
                    <TableHead className="font-bold text-[#3D332A] py-3.5 text-xs">Dokter</TableHead>
                    <TableHead className="font-bold text-[#3D332A] py-3.5 text-xs">Jadwal</TableHead>
                    <TableHead className="font-bold text-[#3D332A] py-3.5 text-xs">Waktu</TableHead>
                    <TableHead className="font-bold text-[#3D332A] py-3.5 text-xs">Status</TableHead>
                    <TableHead className="font-bold text-[#3D332A] py-3.5 pr-5 text-right text-xs">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeReservations.map((item) => {
                    const status = getStatusBadge(item.status);
                    const bookingCode = item.code || `RSV-${String(item.id).padStart(6, "0")}`;
                    const pName = item.name || "Pasien";
                    const sName = item.treatment_interest || "Pemeriksaan Gigi";
                    const dName = item.doctor || "drg. Dokter Klinik";
                    const rawDate = item.date ? String(item.date).split("T")[0] : "-";
                    const rawTime = item.preferred_time || "10:00 WIB";

                    // Parse day name & format: 23 Nov 2026
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
                        <TableCell className="py-3.5 pl-5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#3D332A]">
                            <User className="w-3.5 h-3.5 text-[#B8943F] shrink-0" />
                            <span>{pName}</span>
                          </div>
                        </TableCell>

                        {/* Layanan */}
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3D332A] max-w-[200px] truncate">
                            <Sparkles className="w-3.5 h-3.5 text-[#C9A24A] shrink-0" />
                            <span className="truncate">{sName}</span>
                          </div>
                        </TableCell>

                        {/* Dokter */}
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-[#5C4D3C] max-w-[190px] truncate">
                            <Stethoscope className="w-3.5 h-3.5 text-[#B8943F] shrink-0" />
                            <span className="truncate font-medium">{dName}</span>
                          </div>
                        </TableCell>

                        {/* Jadwal */}
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3D332A]">
                            <CalendarIcon className="w-3.5 h-3.5 text-[#B8943F] shrink-0" />
                            <span>{dayFormatted}, {dateFormatted}</span>
                          </div>
                        </TableCell>

                        {/* Waktu */}
                        <TableCell className="py-3.5">
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
                        <TableCell className="py-3.5 pr-5 text-right">
                          <Button
                            size="sm"
                            onClick={() => onSelectReservation && onSelectReservation(item)}
                            className="h-7 w-7 p-0 bg-[#FAF4E8] hover:bg-[#F5E6C8] text-[#8A6B2B] rounded-xl border border-[#E8D4A2]/60 transition-all shadow-2xs inline-flex items-center justify-center cursor-pointer"
                            title="Lihat Detail Booking"
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
  );
}
