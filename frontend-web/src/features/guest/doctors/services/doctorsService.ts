import { API_BASE } from "@/core/api/apiConfig";
import { getPublicDoctorSchedules, type PublicDoctorScheduleItem } from "./publicDoctorScheduleApi";

export interface DoctorProfile {
  id: number | string;
  name: string;
  role: string;
  image: string;
  education: string;
  description: string;
}

export const CLINIC_DOCTORS: DoctorProfile[] = [
  {
    id: 1,
    name: "drg. Yulita Dora",
    role: "Aesthetic Dentistry (Veneers)",
    image: "/dokter/drg. Yulita Dora.webp",
    education: "Faculty of Dentistry, Trisakti University",
    description: "Spesialis dalam perawatan estetika gigi dan veneer untuk senyum sempurna.",
  },
  {
    id: 2,
    name: "drg. Della Sparringa",
    role: "Aesthetic Dentistry & Pediatric Dentistry",
    image: "/dokter/drg. Della Sparringa.webp",
    education: "Faculty of Dentistry, Airlangga University",
    description: "Ahli dalam perawatan estetika gigi dan kesehatan gigi anak.",
  },
  {
    id: 3,
    name: "drg. Ryan Jusuf",
    role: "Aesthetic Dentistry & Pediatric Dentistry",
    image: "/dokter/drg. Ryan Jusuf.webp",
    education: "Faculty of Dentistry, Andalas University",
    description: "Spesialis estetika dan perawatan gigi anak dengan pendekatan gentle.",
  },
  {
    id: 4,
    name: "drg. Nona Lolita T",
    role: "Aesthetic Dentistry",
    image: "/dokter/drg. Nona Lolita T.webp",
    education: "Faculty of Dentistry, Airlangga University",
    description: "Fokus pada perawatan estetika gigi untuk senyum yang menawan.",
  },
  {
    id: 5,
    name: "drg. Melati Putri, Sp. Pros",
    role: "Prosthodontist, Full Mouth Rehabilitations, Aesthetic Dentistry",
    image: "/dokter/drg. Melati Putri, Sp. Pros.webp",
    education: "Faculty of Dentistry, Trisakti University & Prosthodontics Specialist Faculty of Dentistry, University of Indonesia",
    description: "Spesialis rehabilitasi mulut penuh dan estetika gigi tingkat lanjut.",
  },
  {
    id: 6,
    name: "drg. Shilvy",
    role: "Aesthetic Dentistry & Pediatric Dentistry",
    image: "/dokter/drg. Shilvy.webp",
    education: "Faculty of Dentistry, University of Indonesia & Professional Doctor of Dentistry Education",
    description: "Kombinasi keahlian estetika dan perawatan gigi anak yang komprehensif.",
  },
  {
    id: 7,
    name: "drg. Achmad Riwandy",
    role: "Full Denture, Partial Denture, Prosthodontist, Full Mouth Rehabilitations",
    image: "/dokter/drg. Achmad Riwandy.webp",
    education: "Faculty of Dentistry, Lambung Mangkurat & Prosthodontics Specialist Faculty of Dentistry, University of Indonesia",
    description: "Ahli dalam pembuatan gigi tiruan lengkap dan rehabilitasi mulut kompleks.",
  },
  {
    id: 8,
    name: "drg. Ramayani Ramli",
    role: "Cosmetic Dentistry",
    image: "/dokter/drg. Ramayani Ramli.webp",
    education: "Faculty of Dentistry, Hasanuddin University",
    description: "Spesialis dalam perawatan kosmetik gigi untuk tampilan yang memukau.",
  },
  {
    id: 9,
    name: "drg. Sharah Syam, Sp. Ort",
    role: "Orthodontist",
    image: "/dokter/drg. Sharah Syam, Sp. Ort.webp",
    education: "Faculty of Dentistry, University of Indonesia & Orthodontist Specialist Faculty of Dentistry, University of Indonesia",
    description: "Ahli dalam koreksi gigitan dan perawatan kawat gigi untuk semua usia.",
  },
  {
    id: 10,
    name: "drg. Eric Sulistio, Sp. Perio",
    role: "Periodontist, Full Mouth Rehabilitation, Crown Lengthening, Frenectomy",
    image: "/dokter/drg. Eric Sulistio, Sp. Perio.webp",
    education: "Faculty of Dentistry, University Pasundan Bandung & Periodontist Specialist Faculty of Dentistry, University of Indonesia",
    description: "Spesialis perawatan gusi dan jaringan pendukung gigi tingkat lanjut.",
  },
  {
    id: 11,
    name: "drg. Pramodanti Jiwanakusuma, Sp.KG",
    role: "Root Canal Treatment & Conservation",
    image: "/dokter/drg. Pramodanti Jiwanakusuma, Sp.KG.webp",
    education: "Faculty of Dentistry, University of Indonesia & Dental Conservation Specialist Faculty of Dentistry, University of Indonesia",
    description: "Ahli dalam perawatan saluran akar dan konservasi gigi.",
  },
  {
    id: 12,
    name: "drg. Riesta Paluvi, Sp.KG",
    role: "Oral Examination, Oral Health Education, Preventive Restoration, Resin infiltration, in office / home / walking bleaching, Root Canal Treatment, Micro Dentistry Services, Microsurgery endodontic, Retreatment endodontic, minimally invasive restoration",
    image: "/dokter/drg. Riesta Paluvi, Sp.KG.webp",
    education: "Bachelor of Dentistry, Faculty of Dentistry Trisakti University, Profession Dentistry Program, Faculty of Dentistry Trisakti University, Postgraduate Dental Specialist of Conservative Dentistry, Faculty of Dentistry Trisakti University",
    description: "Spesialis konservasi gigi komprehensif dengan teknik mikroskopik canggih.",
  },
  {
    id: 13,
    name: "drg. Yudy Ardila Utomo, Sp.BMM, Subsp.I.DM.(K)",
    role: "Oral Surgeon Consultant",
    image: "/dokter/drg. Yudy Ardila Utomo, Sp.BMM, Subsp.I.DM.(K).webp",
    education: "Bachelor of Dentistry, Faculty of Dentistry Airlangga University, Program in Dental Surgery Specialty (PPDGS) in Oral and Maxillofacial Surgery, University of Indonesia, Oral and Maxillofacial Surgeon Faculty of Dentistry, University of Indonesia, Doctor of Dental Medicine, Faculty of Dentistry University of Indonesia",
    description: "Konsultan ahli bedah mulut dan maksilofasial untuk kasus kompleks.",
  },
];

export { getPublicDoctorSchedules, type PublicDoctorScheduleItem };
