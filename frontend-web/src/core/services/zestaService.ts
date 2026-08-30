export interface ZestaVisitorMetadata {
  "Pilih Layanan"?: string;
  "Pilih Dokter"?: string;
  "Pilih Jadwal"?: string;
  "Kode Reservasi"?: string;
  "Tanggal"?: string;
  "Nama Dokter"?: string;
  "last_visit_date"?: string;
  "nama_faskes"?: string;
  [key: string]: any;
}

export interface ZestaVisitor {
  name?: string;
  email?: string;
  phone?: string;
  metadata?: ZestaVisitorMetadata;
}

export interface ZestaConfig {
  channelId: string;
  visitor?: ZestaVisitor;
}

declare global {
  interface Window {
    zestaConfig?: ZestaConfig;
    Zesta?: {
      setVisitor?: (visitor: ZestaVisitor) => void;
      [key: string]: any;
    };
  }
}

export const ZESTA_DEFAULT_CHANNEL_ID = "573eb7f7-b6f0-4957-9778-daf531cd967c";
const ZESTA_WIDGET_SCRIPT_ID = "zesta-widget-script";

/**
 * Initialize Zesta Live Chat Widget globally.
 */
export function initZestaWidget(visitor?: ZestaVisitor) {
  if (typeof window === "undefined") return;

  const currentVisitor = window.zestaConfig?.visitor || {};
  const mergedVisitor: ZestaVisitor = {
    ...currentVisitor,
    ...(visitor || {}),
    metadata: {
      "nama_faskes": "Aesthetic Pondok Indah Dental Clinic",
      ...(currentVisitor.metadata || {}),
      ...(visitor?.metadata || {}),
    },
  };

  window.zestaConfig = {
    channelId: ZESTA_DEFAULT_CHANNEL_ID,
    visitor: mergedVisitor,
  };

  if (window.Zesta?.setVisitor) {
    try {
      window.Zesta.setVisitor(mergedVisitor);
    } catch {
      // safe fallback
    }
  }

  // Inject widget script if not already present
  if (!document.getElementById(ZESTA_WIDGET_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = ZESTA_WIDGET_SCRIPT_ID;
    script.src = "https://zesta.id/widget.js?v=1";
    script.async = true;
    document.body.appendChild(script);
  }
}

/**
 * Updates Zesta visitor metadata with Reservation details.
 */
export function updateZestaReservationContext(data: {
  bookingCode?: string;
  serviceName?: string;
  doctorName?: string;
  date?: string;
  timeSlot?: string;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  lastVisitDate?: string;
}) {
  if (typeof window === "undefined") return;

  const normalizedPhone = data.patientPhone
    ? (data.patientPhone.startsWith("+") ? data.patientPhone : (data.patientPhone.startsWith("0") ? `+62${data.patientPhone.slice(1)}` : (data.patientPhone.startsWith("62") ? `+${data.patientPhone}` : `+62${data.patientPhone}`)))
    : window.zestaConfig?.visitor?.phone;

  const metadata: ZestaVisitorMetadata = {
    ...(window.zestaConfig?.visitor?.metadata || {}),
    "nama_faskes": "Aesthetic Pondok Indah Dental Clinic",
    ...(data.bookingCode && { "Kode Reservasi": data.bookingCode }),
    ...(data.serviceName && { "Pilih Layanan": data.serviceName }),
    ...(data.doctorName && {
      "Pilih Dokter": data.doctorName,
      "Nama Dokter": data.doctorName,
    }),
    ...(data.date && { "Tanggal": data.date }),
    ...(data.timeSlot && { "Pilih Jadwal": data.timeSlot }),
    ...(data.lastVisitDate && { "last_visit_date": data.lastVisitDate }),
  };

  const visitor: ZestaVisitor = {
    name: data.patientName || window.zestaConfig?.visitor?.name,
    email: data.patientEmail || window.zestaConfig?.visitor?.email,
    phone: normalizedPhone,
    metadata,
  };

  window.zestaConfig = {
    channelId: ZESTA_DEFAULT_CHANNEL_ID,
    visitor,
  };

  if (window.Zesta?.setVisitor) {
    try {
      window.Zesta.setVisitor(visitor);
    } catch {
      // safe
    }
  }
}
