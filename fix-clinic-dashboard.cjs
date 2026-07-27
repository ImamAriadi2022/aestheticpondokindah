const fs = require('fs');
const path = 'src/react-app/pages/dashboard/ClinicDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix the corrupted fetchUsers that contains reservation code mixed in
const corruptedStart = `  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem("apident:token");
      const response = await fetch("http://localhost:8000/api/admin/users", {
        headers: {
          "Authorization": \`Bearer \${token}\`,
          "Accept": "application/json",
        }
      if (status) qs.set("status", status);`;

const corruptedEnd = `    } finally {
      setLoadingReservations(false);
    }
  };`;

const startIdx = content.indexOf(corruptedStart);
if (startIdx !== -1) {
  const endIdx = content.indexOf(corruptedEnd, startIdx);
  if (endIdx !== -1) {
    const before = content.slice(0, startIdx);
    const after = content.slice(endIdx + corruptedEnd.length);
    const replacement = `  const fetchReservations = async () => {
    setLoadingReservations(true);
    try {
      const status = reservationFilter !== "Semua" ? reservationFilter : "";
      const qs = new URLSearchParams();
      if (reservationSearch.trim()) qs.set("search", reservationSearch.trim());
      if (status) qs.set("status", status);
      const url = \`http://localhost:8000/api/admin/reservations\${qs.toString() ? \`?\${qs.toString()}\` : ""}\`;

      const res = await fetch(url, {
        headers: { "Authorization": \`Bearer \${token}\`, "Accept": "application/json" },
      });

      if (!res.ok) {
        console.error("Gagal fetch reservations", await res.text());
        return;
      }

      const data = (await res.json()) as any[];
      const mapped: Reservation[] = (Array.isArray(data) ? data : []).map((r) => ({
        id: String(r.id),
        name: r.name || "-",
        phone: r.phone || "-",
        date: r.date || "-",
        doctor: r.doctor || "-",
        complaint: r.complaint || "-",
        status: (r.status as ReservationStatus) || "Baru",
        paymentStatus: (r.paymentStatus as PaymentStatus) || "Belum Bayar",
        createdAt: r.createdAt || new Date().toISOString(),
        notes: r.notes || undefined,
      }));
      setReservations(mapped);
    } catch (e) {
      console.error("Gagal fetch reservations", e);
    } finally {
      setLoadingReservations(false);
    }
  };`;
    content = before + replacement + after;
    console.log('Fixed corrupted fetchReservations');
  }
}

// 2. Remove duplicate reservation state declarations (keep the ones before fetchReservations)
const resStates = `  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  const [reservationFilter, setReservationFilter] = useState<ReservationStatus | "Semua">("Semua");
  const [reservationSearch, setReservationSearch] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [editingPaymentStatus, setEditingPaymentStatus] = useState<PaymentStatus | "">("");
  const [isUpdating, setIsUpdating] = useState(false);`;

const firstIdx = content.indexOf(resStates);
if (firstIdx !== -1) {
  const secondIdx = content.indexOf(resStates, firstIdx + 1);
  if (secondIdx !== -1) {
    const before = content.slice(0, secondIdx);
    const after = content.slice(secondIdx + resStates.length);
    content = before + after;
    console.log('Removed duplicate reservation states');
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('File fixed.');
