const fs = require('fs');
const path = 'src/react-app/pages/dashboard/ClinicDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove duplicate reservation states (the second occurrence)
const resStates = [
  '  const [reservations, setReservations] = useState<Reservation[]>([]);',
  '  const [loadingReservations, setLoadingReservations] = useState(false);',
  '',
  '  const [reservationFilter, setReservationFilter] = useState<ReservationStatus | "Semua">("Semua");',
  '  const [reservationSearch, setReservationSearch] = useState("");',
  '  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);',
  '  const [editingPaymentStatus, setEditingPaymentStatus] = useState<PaymentStatus | "">("");',
  '  const [isUpdating, setIsUpdating] = useState(false);',
].join('\n');

const firstIdx = content.indexOf(resStates);
if (firstIdx !== -1) {
  const secondIdx = content.indexOf(resStates, firstIdx + 1);
  if (secondIdx !== -1) {
    // Find the end of the duplicate block (includes the getEffectivePaymentStatus and fetchReservations after it)
    const after = content.slice(secondIdx);
    
    // We want to remove from secondIdx up to just before "// Konsultasi state"
    const consultMarker = '\n  // Konsultasi state (demo)\n';
    const consultIdx = after.indexOf(consultMarker);
    if (consultIdx !== -1) {
      const before = content.slice(0, secondIdx);
      const rest = content.slice(secondIdx + consultIdx);
      content = before + rest;
      console.log('Removed duplicate reservation states and simplified fetchReservations');
    } else {
      // fallback: just remove the states
      const before = content.slice(0, secondIdx);
      const after2 = content.slice(secondIdx + resStates.length);
      content = before + after2;
      console.log('Removed duplicate reservation states (fallback)');
    }
  }
}

// 2. Prefix unused variables with underscore to suppress TS6133 warnings
const unusedReplacements = [
  ['const [loadingContent, setLoadingContent]', 'const [_loadingContent, setLoadingContent]'],
  ['const [galleryItems, setGalleryItems]', 'const [_galleryItems, setGalleryItems]'],
  ['const [newGalleryDraft, setNewGalleryDraft]', 'const [_newGalleryDraft, setNewGalleryDraft]'],
  ['const [testimonials, setTestimonials]', 'const [_testimonials, setTestimonials]'],
  ['const [newTestimonialDraft, setNewTestimonialDraft]', 'const [_newTestimonialDraft, setNewTestimonialDraft]'],
];

for (const [old, neu] of unusedReplacements) {
  if (content.includes(old)) {
    content = content.replace(old, neu);
    console.log(`Replaced: ${old} -> ${neu}`);
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('File fixed (pass 2).');
