import { useState, useMemo } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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
  Send,
  X,
  MessageCircle,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import type { ReservationItem } from "../services/reservationService";
import { toast } from "@/shared/ui/toast";

type Props = {
  reservations: ReservationItem[];
  doctors?: any[];
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
  doctors = [],
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

  // State Modal Kirim Jadwal ke Dokter
  const [isSendDoctorModalOpen, setIsSendDoctorModalOpen] = useState(false);
  const [selectedDoctorToSend, setSelectedDoctorToSend] = useState<string>("");
  const [targetDoctorPhoneInput, setTargetDoctorPhoneInput] = useState<string>("");
  const [sendMethod, setSendMethod] = useState<"both" | "wa" | "pdf">("both");

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
    const periodLabel = `Minggu ${weekHeaderLabel}`;
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

  // Helper formatting nomor WhatsApp
  const formatWaPhone = (rawPhone: string) => {
    let clean = (rawPhone || "").replace(/\D/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    } else if (!clean.startsWith("62") && clean.length > 5) {
      clean = "62" + clean;
    }
    return clean;
  };

  // Daftar seluruh dokter untuk modal (kombinasi props doctors + dokter yang ada di jadwal)
  const allAvailableDoctors = useMemo(() => {
    const list: { name: string; phone: string; role?: string }[] = [];
    const seen = new Set<string>();

    doctors.forEach((doc) => {
      let rawName = (doc.name || "").trim();
      // Bersihkan suffix role seperti " - doctor", " - Dokter", dsb jika ada di string nama
      rawName = rawName.replace(/\s*[-–—]\s*(doctor|dokter|admin|staff)\s*$/i, "").trim();
      if (rawName && !seen.has(rawName.toLowerCase())) {
        seen.add(rawName.toLowerCase());
        list.push({
          name: rawName,
          phone: doc.phone || doc.whatsapp || "",
          role: "",
        });
      }
    });

    doctorsInWeek.forEach((docName) => {
      let cleanDoc = (docName || "").trim();
      cleanDoc = cleanDoc.replace(/\s*[-–—]\s*(doctor|dokter|admin|staff)\s*$/i, "").trim();
      if (cleanDoc && !seen.has(cleanDoc.toLowerCase())) {
        seen.add(cleanDoc.toLowerCase());
        list.push({
          name: cleanDoc,
          phone: "",
          role: "",
        });
      }
    });

    return list;
  }, [doctors, doctorsInWeek]);

  // Helper normalisasi pencocokan nama dokter
  const isDoctorMatch = (itemDoctor?: string | null, targetDoctor?: string | null) => {
    if (!itemDoctor || !targetDoctor) return false;
    const cleanItem = itemDoctor.toLowerCase().replace(/drg\.?|sp\.[a-z]+|\(.*?\)|,/gi, "").trim();
    const cleanTarget = targetDoctor.toLowerCase().replace(/drg\.?|sp\.[a-z]+|\(.*?\)|,/gi, "").trim();
    return (
      itemDoctor.trim().toLowerCase() === targetDoctor.trim().toLowerCase() ||
      (cleanItem.length > 2 && cleanTarget.length > 2 && (cleanItem.includes(cleanTarget) || cleanTarget.includes(cleanItem)))
    );
  };

  // Reservasi spesifik untuk dokter yang dipilih di modal kirim
  // Selalu mengambil seluruh data antrean real pada minggu aktif yang sedang dilihat
  const doctorTargetReservations = useMemo(() => {
    if (!selectedDoctorToSend) return [];
    const list: ReservationItem[] = [];
    weekDays.forEach((w) => {
      const dayList = reservationsByDate.get(w.isoDate) || [];
      list.push(...dayList);
    });
    return list.filter((r) => isDoctorMatch(r.doctor, selectedDoctorToSend));
  }, [selectedDoctorToSend, weekDays, reservationsByDate]);

  // Handler generate dan unduh file PDF real yang rapi menggunakan jsPDF & AutoTable
  const handleDownloadDoctorSchedulePdf = () => {
    if (doctorTargetReservations.length === 0) {
      toast({
        title: "Tidak Ada Data",
        message: "Tidak ada jadwal pasien untuk dokter ini pada periode terpilih.",
        variant: "warning",
      });
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const periodLabel = `Minggu ${weekHeaderLabel}`;
      const cleanDoctorName = selectedDoctorToSend.replace(/\s*[-–—]\s*(doctor|dokter|admin|staff)\s*$/i, "").trim();
      const printDateStr = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Header Banner / Aesthetic Header
      doc.setFillColor(250, 246, 238); // warm cream subtle #FAF6EE
      doc.roundedRect(30, 25, 535, 62, 6, 6, "F");

      // Clinic Brand Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(140, 107, 28); // Golden bronze #8C6B1C
      doc.text("AESTHETIC PONDOK INDAH DENTAL CLINIC", 45, 48);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 90, 80);
      doc.text("Agenda Praktik Dokter & Rekapitulasi Janji Temu Pasien", 45, 64);

      // Period & Info di kanan header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(44, 36, 22);
      doc.text("Jadwal Dokter", 550, 48, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(120, 110, 100);
      doc.text(periodLabel, 550, 64, { align: "right" });

      // Info metadata bar
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(231, 222, 203);
      doc.roundedRect(30, 95, 535, 34, 4, 4, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(44, 36, 22);
      doc.text("Dokter:", 42, 116);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(140, 107, 28);
      doc.text(cleanDoctorName, 85, 116);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(44, 36, 22);
      doc.text("Total Pasien:", 280, 116);
      doc.setFont("helvetica", "normal");
      doc.text(`${doctorTargetReservations.length} Orang`, 345, 116);

      doc.setFont("helvetica", "bold");
      doc.text("Waktu:", 430, 116);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 90, 80);
      doc.text(`${printDateStr} WIB`, 470, 116);

      // Siapkan rows tabel
      const tableRows = doctorTargetReservations.map((r, i) => {
        let scheduleDate = r.date || "-";
        try {
          if (r.date) {
            const d = new Date(r.date);
            if (!isNaN(d.getTime())) {
              scheduleDate = d.toLocaleDateString("id-ID", {
                weekday: "short",
                day: "numeric",
                month: "short",
              });
            }
          }
        } catch {
          // fallback
        }

        return [
          (i + 1).toString(),
          r.code || `RSV-${r.id}`,
          r.name || "-",
          r.treatment_interest || "Pemeriksaan Gigi",
          scheduleDate,
          r.preferred_time || "10:00",
          r.status || "Menunggu",
        ];
      });

      // Generate Table rapi dengan autoTable
      autoTable(doc, {
        startY: 140,
        margin: { left: 30, right: 30 },
        head: [["No", "Kode Booking", "Nama Pasien", "Layanan / Tindakan", "Jadwal", "Waktu", "Status"]],
        body: tableRows,
        theme: "plain",
        headStyles: {
          fillColor: [247, 244, 236],
          textColor: [44, 36, 22],
          font: "helvetica",
          fontStyle: "bold",
          fontSize: 8.5,
          halign: "left",
          lineColor: [231, 222, 203],
          lineWidth: { top: 0.5, bottom: 1 },
        },
        bodyStyles: {
          font: "helvetica",
          fontSize: 8.5,
          textColor: [50, 45, 40],
          cellPadding: { top: 7, bottom: 7, left: 6, right: 6 },
          lineColor: [240, 234, 225],
          lineWidth: { bottom: 0.5 },
        },
        columnStyles: {
          0: { cellWidth: 26, halign: "center", textColor: [120, 110, 100] },
          1: { cellWidth: 80, fontStyle: "bold", textColor: [60, 50, 40] },
          2: { cellWidth: 105, fontStyle: "bold", textColor: [20, 20, 20] },
          3: { cellWidth: 150 },
          4: { cellWidth: 70 },
          5: { cellWidth: 50 },
          6: { cellWidth: 54, halign: "center" },
        },
        alternateRowStyles: {
          fillColor: [253, 251, 247],
        },
        didDrawPage: (data) => {
          // Footer strip
          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setDrawColor(240, 234, 225);
          doc.line(30, pageHeight - 30, 565, pageHeight - 30);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(140, 130, 120);
          doc.text("Dokumen Resmi Front Desk AESPI - Jadwal Praktik Dokter Gigi", 30, pageHeight - 18);
          doc.text(`Halaman ${data.pageNumber}`, 565, pageHeight - 18, { align: "right" });
        },
      });

      // Download file PDF langsung ke komputer
      const safeDocFileName = `Jadwal_${cleanDoctorName.replace(/[\s.]+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(safeDocFileName);

      toast({
        title: "PDF Terunduh",
        message: `File PDF "${safeDocFileName}" berhasil diunduh dan siap dilampirkan ke chat.`,
        variant: "success",
      });
    } catch (err) {
      console.error("Gagal membuat file PDF:", err);
      // Fallback cetak print frame jika ada kendala
      handlePrintDoctorSchedulePdf();
    }
  };

  // Handler cetak browser PDF khusus dokter terpilih (opsi Cetak)
  const handlePrintDoctorSchedulePdf = () => {
    if (doctorTargetReservations.length === 0) {
      toast({
        title: "Tidak Ada Data",
        message: "Tidak ada jadwal pasien untuk dokter ini pada periode terpilih.",
        variant: "warning",
      });
      return;
    }

    const periodLabel = `Minggu ${weekHeaderLabel}`;
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

    const rowsHtml = doctorTargetReservations
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
            <td style="padding: 8px 6px; font-weight: bold; color: #1c1917; font-size: 10.5px;">${r.name || "-"}</td>
            <td style="padding: 8px 6px; color: #292524; font-size: 10.5px; font-weight: normal;">${r.treatment_interest || "-"}</td>
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
          <title>Jadwal_${selectedDoctorToSend.replace(/[\s.]+/g, "_")}</title>
          <style>
            @page { 
              size: A4 portrait; 
              margin: 12mm 15mm; 
            }
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; }
            body { 
              color: #1c1917; 
              background: #fff; 
              line-height: 1.4; 
              font-size: 11px; 
            }
            .header-box { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-end; 
              padding-bottom: 10px; 
              border-bottom: 2px solid #8c6b1c; 
              margin-bottom: 12px; 
            }
            .clinic-name { 
              font-size: 14px; 
              font-weight: bold; 
              color: #8c6b1c; 
              letter-spacing: -0.1px; 
            }
            .clinic-desc { 
              font-size: 10px; 
              color: #57534e; 
              margin-top: 2px; 
            }
            .doc-heading { 
              text-align: right; 
            }
            .doc-heading h2 { 
              font-size: 13px; 
              font-weight: bold; 
              color: #1c1917; 
              text-transform: uppercase; 
            }
            .doc-heading p { 
              font-size: 10px; 
              color: #57534e; 
              margin-top: 2px; 
            }
            .meta-strip { 
              background: #f7f4ec; 
              border: 1px solid #e7decb; 
              padding: 8px 12px; 
              border-radius: 6px; 
              margin-bottom: 12px; 
              font-size: 10.5px; 
              color: #44403c; 
              display: flex;
              justify-content: space-between;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              table-layout: auto; 
            }
            th { 
              background: #f7f4ec; 
              color: #292524; 
              font-weight: bold; 
              text-align: left; 
              padding: 7px 6px; 
              border-top: 1px solid #e7decb; 
              border-bottom: 1.5px solid #e7decb; 
              font-size: 10px; 
              text-transform: uppercase; 
            }
            .footer-strip { 
              margin-top: 20px; 
              padding-top: 8px; 
              border-top: 1px solid #e5e7eb; 
              display: flex; 
              justify-content: space-between; 
              font-size: 9px; 
              color: #78716c; 
            }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div>
              <div class="clinic-name">AESTHETIC PONDOK INDAH DENTAL CLINIC</div>
              <div class="clinic-desc">Agenda Praktik & Penjadwalan Janji Temu Pasien</div>
            </div>
            <div class="doc-heading">
              <h2>Jadwal Appointment Dokter</h2>
              <p>${periodLabel}</p>
            </div>
          </div>

          <div class="meta-strip">
            <span><strong>Dokter:</strong> ${selectedDoctorToSend}</span>
            <span><strong>Total Pasien:</strong> ${doctorTargetReservations.length} Orang</span>
            <span><strong>Waktu Cetak:</strong> ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB</span>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 28px; text-align: center;">No</th>
                <th style="width: 100px;">Kode Booking</th>
                <th style="width: 130px;">Nama Pasien</th>
                <th>Layanan / Tindakan</th>
                <th style="width: 80px;">Jadwal</th>
                <th style="width: 75px;">Waktu</th>
                <th style="width: 85px; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer-strip">
            <span>Dokumen Resmi Front Desk AESPI - Jadwal Praktik Dokter</span>
            <span>Konfirmasi kehadiran pasien divalidasi oleh sistem</span>
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

  // Handler kirim ke WhatsApp dokter
  const handleSendToDoctorWhatsApp = () => {
    if (!selectedDoctorToSend) {
      toast({
        title: "Pilih Dokter",
        message: "Silakan pilih dokter penerima terlebih dahulu.",
        variant: "warning",
      });
      return;
    }

    // Ambil nomor telp dari input manual atau profil dokter
    const docObj = allAvailableDoctors.find(
      (d) => d.name.trim().toLowerCase() === selectedDoctorToSend.trim().toLowerCase()
    );
    const rawTargetPhone = targetDoctorPhoneInput.trim() || docObj?.phone || "081990114949";
    const cleanPhone = formatWaPhone(rawTargetPhone);

    const periodLabel = `Minggu ${weekHeaderLabel}`;
    const listCount = doctorTargetReservations.length;

    // Helper format tanggal: "Kamis, 26 Nov 2026"
    const formatScheduleDate = (dateVal?: string | null) => {
      if (!dateVal) return "-";
      try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return dateVal;
        return d.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      } catch {
        return dateVal;
      }
    };

    let itemsSummary = "";
    if (listCount > 0) {
      itemsSummary = doctorTargetReservations
        .map((r, idx) => {
          const dateFormatted = formatScheduleDate(r.date);
          const time = r.preferred_time || "10:00";
          const treatment = r.treatment_interest || "Pemeriksaan";
          return `${idx + 1}. ${r.name || "Pasien"}\n📅 ${dateFormatted} \n⏰ ${time} | (${treatment})`;
        })
        .join("\n\n");
    } else {
      itemsSummary = "Tidak ada antrean pasien untuk jadwal ini.";
    }

    const waMessage = encodeURIComponent(
      `Halo Dokter ${selectedDoctorToSend},\n\n` +
      `Berikut adalah rincian jadwal penjadwalan janji temu (appointment) pasien Anda\n` +
      `di Aesthetic Pondok Indah Dental Clinic untuk ${periodLabel}:\n\n` +
      `Total Pasien Terjadwal: ${listCount} Pasien\n\n` +
      `Daftar Antrean Pasien:\n` +
      `${itemsSummary}\n\n` +
      `Mohon informasikan ke admin jika ada penyesuaian slot praktik dokter. Terima kasih banyak 🙏`
    );

    // Buka WhatsApp
    window.open(`https://wa.me/${cleanPhone}?text=${waMessage}`, "_blank");

    // Jika opsi mencakup PDF, otomatis buat & unduh file PDF real untuk siap dilampirkan
    if (sendMethod === "both") {
      setTimeout(() => {
        handleDownloadDoctorSchedulePdf();
      }, 400);
    } else if (sendMethod === "pdf") {
      setTimeout(() => {
        handlePrintDoctorSchedulePdf();
      }, 400);
    }

    toast({
      title: "Jadwal Terkirim",
      message: `Pesan rincian appointment berhasil diteruskan ke WhatsApp ${selectedDoctorToSend}`,
      variant: "success",
    });

    setIsSendDoctorModalOpen(false);
  };

  return (
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
            {/* Tombol Kirim Jadwal ke Dokter */}
            <button
              type="button"
              onClick={() => {
                // Pilih default dokter pertama atau dokter yang sedang difilter
                const initDoc =
                  selectedDoctorFilter !== "Semua"
                    ? selectedDoctorFilter
                    : doctorsInWeek[0] || (doctors[0]?.name ?? "");
                setSelectedDoctorToSend(initDoc);
                const found = allAvailableDoctors.find(
                  (d) => isDoctorMatch(d.name, initDoc)
                );
                if (found?.phone) {
                  setTargetDoctorPhoneInput(found.phone);
                } else {
                  setTargetDoctorPhoneInput("");
                }
                setIsSendDoctorModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D9CDB8] bg-[#FAF4E8] hover:bg-[#F3E7D0] text-xs font-bold text-[#8C6B1C] shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Kirim Jadwal Appointment ke WhatsApp Dokter"
            >
              <Send className="w-3.5 h-3.5 rotate-[-25deg]" />
              <span className="hidden sm:inline">Kirim ke Dokter</span>
            </button>

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
                {count > 0 ? (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#EF4444] text-white text-[10px] font-bold shadow-xs">
                    {count}
                  </span>
                ) : (
                  <span className="text-[#B8A99A] font-medium px-1">
                    0
                  </span>
                )}
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

      {/* Modal Kotak Dialog: Kirim Penjadwalan ke Dokter */}
      {isSendDoctorModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 pb-20 sm:pb-6 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div
            className="w-full max-w-4xl bg-white rounded-2xl border border-[#E8DFC8] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh] text-[#3D332A] animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header: Clean Typography & Pure Icon tanpa background shape/container */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#F0EAE1] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Send className="w-4 h-4 sm:w-5 sm:h-5 text-[#8C6B1C] rotate-[-20deg] shrink-0" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#2C2416] leading-snug">
                    Kirim Penjadwalan ke Dokter
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#7A6E5F] leading-tight">
                    Kirim rincian appointment berupa PDF & teks WhatsApp resmi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSendDoctorModalOpen(false)}
                className="text-[#998A78] hover:text-[#2C2416] p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-black/5 shrink-0"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Two-Column Layout (Kiri: Form Input | Kanan: Live Preview & Ringkasan Pasien) */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start">
                {/* Kolom Kiri: Inputan Pengiriman */}
                <div className="md:col-span-6 space-y-3.5 sm:space-y-4">
                  {/* Status Periode Terpilih */}
                  <div className="border-b border-[#F0EAE1] pb-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[#8A7B6B] block text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
                        Periode Jadwal Praktik
                      </span>
                      <span className="font-bold text-[#2C2416] text-xs sm:text-sm truncate block">
                        Minggu {weekHeaderLabel}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[#8A7B6B] block text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
                        Total Antrean
                      </span>
                      <span className="font-bold text-[#8C6B1C] text-xs sm:text-sm">
                        {doctorTargetReservations.length} Pasien
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Pilihan Dokter */}
                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs font-semibold text-[#4A3F33] block">
                      Pilih Dokter Penerima <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedDoctorToSend}
                      onChange={(e) => {
                        const newDoc = e.target.value;
                        setSelectedDoctorToSend(newDoc);
                        const found = allAvailableDoctors.find(
                          (d) => isDoctorMatch(d.name, newDoc)
                        );
                        if (found?.phone) {
                          setTargetDoctorPhoneInput(found.phone);
                        } else {
                          setTargetDoctorPhoneInput("");
                        }
                      }}
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-[#D9CEBA] bg-white text-xs sm:text-sm text-[#2C2416] focus:outline-hidden focus:border-[#8C6B1C] focus:ring-1 focus:ring-[#8C6B1C] transition-all cursor-pointer font-medium"
                    >
                      {allAvailableDoctors.map((doc) => (
                        <option key={doc.name} value={doc.name}>
                          {doc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nomor WhatsApp Dokter */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#4A3F33]">
                      <span>Nomor WhatsApp Dokter</span>
                      <span className="text-[10px] sm:text-[11px] text-[#8A7B6B] font-normal">Format: 08xx / 628xx</span>
                    </div>
                    <input
                      type="text"
                      value={targetDoctorPhoneInput}
                      onChange={(e) => setTargetDoctorPhoneInput(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-[#D9CEBA] bg-white text-xs sm:text-sm text-[#2C2416] placeholder-[#A89D8F] focus:outline-hidden focus:border-[#8C6B1C] focus:ring-1 focus:ring-[#8C6B1C] transition-all"
                    />
                  </div>

                  {/* Opsi Metode Pengiriman */}
                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs font-semibold text-[#4A3F33] block">
                      Metode Pengiriman
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => setSendMethod("both")}
                        className={`py-2 px-1.5 sm:px-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold text-center transition-all cursor-pointer ${
                          sendMethod === "both"
                            ? "border-[#8C6B1C] text-[#8C6B1C] bg-[#FAF6EE] font-bold"
                            : "border-[#E2D8C7] text-[#5C4D3C] bg-white hover:border-[#8C6B1C]"
                        }`}
                      >
                        WhatsApp + PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendMethod("wa")}
                        className={`py-2 px-1.5 sm:px-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold text-center transition-all cursor-pointer ${
                          sendMethod === "wa"
                            ? "border-[#8C6B1C] text-[#8C6B1C] bg-[#FAF6EE] font-bold"
                            : "border-[#E2D8C7] text-[#5C4D3C] bg-white hover:border-[#8C6B1C]"
                        }`}
                      >
                        Teks WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendMethod("pdf")}
                        className={`py-2 px-1.5 sm:px-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold text-center transition-all cursor-pointer ${
                          sendMethod === "pdf"
                            ? "border-[#8C6B1C] text-[#8C6B1C] bg-[#FAF6EE] font-bold"
                            : "border-[#E2D8C7] text-[#5C4D3C] bg-white hover:border-[#8C6B1C]"
                        }`}
                      >
                        Cetak PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Pratinjau Rincian Pasien & Format Dokumen */}
                <div className="md:col-span-6 space-y-2.5 border-t md:border-t-0 md:border-l border-[#F0EAE1] pt-3.5 md:pt-0 md:pl-6">
                  <div className="flex items-center justify-between pb-0.5">
                    <span className="text-[11px] sm:text-xs font-bold text-[#2C2416] tracking-tight">
                      Pratinjau Pasien Terjadwal ({doctorTargetReservations.length})
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-[#7A6E5F] truncate max-w-[130px] sm:max-w-none text-right">
                      {selectedDoctorToSend}
                    </span>
                  </div>

                  {doctorTargetReservations.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-[#E0D7C6] rounded-xl">
                      <p className="text-[11px] sm:text-xs text-[#8A7B6B]">
                        Belum ada antrean janji temu yang ditugaskan ke dokter ini pada periode terpilih.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[200px] sm:max-h-[280px] overflow-y-auto divide-y divide-[#F0EAE1] border border-[#E8DFC8] rounded-xl bg-white">
                      {doctorTargetReservations.map((r, i) => (
                        <div key={r.id} className="p-2.5 sm:p-3 flex items-start justify-between gap-2.5 text-xs hover:bg-[#FAF8F5] transition-colors">
                          <div className="min-w-0">
                            <span className="font-bold text-[#2C2416] block truncate text-xs">
                              {i + 1}. {r.name || "Pasien"}
                            </span>
                            <span className="text-[11px] text-[#6B5E4F] block truncate mt-0.5">
                              {r.treatment_interest || "Pemeriksaan Gigi"}
                            </span>
                            <span className="text-[10px] text-[#8C8272] font-mono mt-0.5 block">
                              {r.code || `RSV-${r.id}`}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-[#8C6B1C] block">
                              {r.preferred_time || "10:00"}
                            </span>
                            <span className="text-[10px] text-[#8A7B6B] block">
                              {r.date ? new Date(r.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[#F0EAE1] bg-white flex items-center justify-end gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsSendDoctorModalOpen(false)}
                className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold text-[#5C4D3C] hover:bg-[#FAF8F5] border border-[#E2D8C7] transition-all cursor-pointer"
              >
                Batal
              </button>
              {sendMethod === "pdf" ? (
                <button
                  type="button"
                  onClick={() => {
                    handlePrintDoctorSchedulePdf();
                    setIsSendDoctorModalOpen(false);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Cetak PDF</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSendToDoctorWhatsApp}
                  className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Kirim WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
