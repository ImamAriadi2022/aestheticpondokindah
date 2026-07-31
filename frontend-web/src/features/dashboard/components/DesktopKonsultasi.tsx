import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { 
  ChevronRight,
  MessageSquareText,
  Camera,
  Send,
  ArrowLeft,
  Stethoscope,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  Clock,
  Check,
  Zap,
  Calendar,
  FileText
} from "lucide-react";

const symptoms = [
  { id: "sakit", label: "Sakit Gigi", icon: Frown, color: "bg-red-100 text-red-600" },
  { id: "ngilu", label: "Gigi Ngilu", icon: Meh, color: "bg-orange-100 text-orange-600" },
  { id: "berdarah", label: "Gusi Berdarah", icon: AlertCircle, color: "bg-rose-100 text-rose-600" },
  { id: "bengkak", label: "Gusi Bengkak", icon: AlertCircle, color: "bg-pink-100 text-pink-600" },
  { id: "patah", label: "Gigi Patah", icon: AlertCircle, color: "bg-purple-100 text-purple-600" },
  { id: "goyang", label: "Gigi Goyang", icon: AlertCircle, color: "bg-blue-100 text-blue-600" },
  { id: "kuning", label: "Gigi Kuning", icon: Smile, color: "bg-yellow-100 text-yellow-600" },
  { id: "lainnya", label: "Lainnya", icon: Stethoscope, color: "bg-gray-100 text-gray-600" },
];

const painLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const consultationTypes = [
  { id: "quick", label: "Konsultasi Instan", icon: Zap, description: "Chat langsung dengan dokter untuk saran awal & penanganan cepat", color: "bg-[#c9a24a]" },
  { id: "scheduled", label: "Konsultasi Terjadwal", icon: Calendar, description: "Pilih tanggal & dokter untuk sesi konsultasi tatap muka", color: "bg-[#a8843a]" },
];

export default function DesktopKonsultasi() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"type" | "symptoms" | "pain" | "details" | "success">("type");
  const [selectedType, setSelectedType] = useState<string>("quick");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + attachments.length > 3) {
        toast({ title: "Maksimal 3 foto", message: "Anda hanya dapat mengupload maksimal 3 foto", variant: "error" });
        return;
      }
      setAttachments(prev => [...prev, ...files].slice(0, 3));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedSymptoms.length === 0) {
      toast({ title: "Pilih Gejala", message: "Silakan pilih minimal 1 gejala", variant: "error" });
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setStep("success");
  };

  const getStepNumber = () => {
    switch (step) {
      case "type": return 1;
      case "symptoms": return 2;
      case "pain": return 3;
      case "details": return 4;
      default: return 1;
    }
  };

  const getTotalSteps = () => 4;

  // Success Screen
  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Keluhan berhasil dikirim!
        </h1>
        <p className="text-base text-gray-500 text-center mb-8 max-w-md">
          Dokter akan segera menanggapi keluhan Anda dalam waktu 15-30 menit
        </p>
        
        <div className="w-full max-w-md bg-gray-50 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#c9a24a]/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#c9a24a]" />
            </div>
            <div>
              <p className="text-base font-medium text-gray-900">Estimasi Respon</p>
              <p className="text-sm text-gray-500">15 - 30 menit</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => navigate("/dashboard/user?tab=konsultasi")}
            className="h-12 px-6 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold rounded-xl"
          >
            <MessageSquareText className="w-5 h-5 mr-2" />
            Chat Admin
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/user")}
            className="h-12 px-6 rounded-xl"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {step !== "type" && (
          <button
            onClick={() => {
              if (step === "symptoms") setStep("type");
              else if (step === "pain") setStep("symptoms");
              else if (step === "details") setStep("pain");
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Konsultasi</h2>
          <p className="text-sm text-gray-500">
            {step === "type" && "Pilih jenis konsultasi yang Anda butuhkan"}
            {step === "symptoms" && "Pilih gejala yang Anda rasakan"}
            {step === "pain" && "Seberapa parah rasa sakitnya?"}
            {step === "details" && "Ceritakan keluhan Anda"}
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-3">
        {Array.from({ length: getTotalSteps() }).map((_, i) => (
          <div key={i} className="flex-1">
            <div className={`h-2 rounded-full transition-all ${
              i + 1 < getStepNumber() ? "bg-green-500" :
              i + 1 === getStepNumber() ? "bg-[#c9a24a]" : "bg-gray-200"
            }`} />
          </div>
        ))}
        <span className="text-sm text-gray-500 font-medium">
          Langkah {getStepNumber()} dari {getTotalSteps()}
        </span>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        {/* Consultation Type Step */}
        {step === "type" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Pilih Jenis Konsultasi
              </h3>
              <p className="text-sm text-gray-500">
                Pilih metode konsultasi yang paling nyaman untuk Anda
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {consultationTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all text-center ${
                      isSelected
                        ? "border-[#c9a24a] bg-[#c9a24a]/5 shadow-md shadow-[#c9a24a]/10"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <div className={`w-14 h-14 ${type.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-center">
                      <span className={`text-base font-semibold block mb-1 ${isSelected ? "text-[#c9a24a]" : "text-gray-700"}`}>
                        {type.label}
                      </span>
                      <span className="text-sm text-gray-500">{type.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              onClick={() => {
                if (selectedType === "scheduled") {
                  navigate("/dashboard/user?tab=reservasi");
                } else {
                  setStep("symptoms");
                }
              }}
              className="w-full max-w-2xl mx-auto flex h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold rounded-xl"
            >
              Selanjutnya
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Symptoms Step */}
        {step === "symptoms" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Apa Keluhan Utama Anda?
              </h3>
              <p className="text-sm text-gray-500">
                Pilih satu atau lebih gejala yang Anda rasakan saat ini
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {symptoms.map((symptom) => {
                const Icon = symptom.icon;
                const isSelected = selectedSymptoms.includes(symptom.id);
                
                return (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      isSelected
                        ? "border-[#c9a24a] bg-[#c9a24a]/5"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${symptom.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-medium text-center ${isSelected ? "text-[#c9a24a]" : "text-gray-700"}`}>
                      {symptom.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <Button
              onClick={() => setStep("pain")}
              disabled={selectedSymptoms.length === 0}
              className="w-full h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold rounded-xl disabled:opacity-50"
            >
              Selanjutnya
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Pain Level Step */}
        {step === "pain" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tingkat Nyeri
              </h3>
              <p className="text-sm text-gray-500">
                Pada skala 1-10, seberapa parah rasa sakitnya?
              </p>
            </div>

            <div className="flex justify-center gap-3 flex-wrap mb-6">
              {painLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setPainLevel(level)}
                  className={`w-12 h-12 rounded-full font-semibold text-base transition-all ${
                    painLevel === level
                      ? "bg-[#c9a24a] text-white shadow-lg shadow-[#c9a24a]/30"
                      : level <= 3
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : level <= 6
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            {painLevel && (
              <div className="text-center mb-6">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  painLevel <= 3
                    ? "bg-green-100 text-green-700"
                    : painLevel <= 6
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {painLevel <= 3 ? "Nyeri Ringan" : painLevel <= 6 ? "Nyeri Sedang" : "Nyeri Berat"}
                </span>
              </div>
            )}

            <Button
              onClick={() => setStep("details")}
              className="w-full h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold rounded-xl"
            >
              Selanjutnya
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Details Step */}
        {step === "details" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Detail Keluhan
              </h3>
              <p className="text-sm text-gray-500">
                Ceritakan lebih detail tentang kondisi gigi Anda
              </p>
            </div>

            {/* Selected Symptoms Summary */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-3">Gejala Terpilih:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedSymptoms.map(id => {
                  const symptom = symptoms.find(s => s.id === id);
                  return symptom ? (
                    <span 
                      key={id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200"
                    >
                      {symptom.label}
                    </span>
                  ) : null;
                })}
              </div>
              {painLevel && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Tingkat nyeri:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    painLevel <= 3
                      ? "bg-green-100 text-green-700"
                      : painLevel <= 6
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {painLevel}/10
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Keterangan (Opsional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan kapan gejala mulai terasa, apa yang memperparah/memperbaiki, dll..."
                className="w-full h-32 p-4 bg-gray-50 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/30 resize-none border border-gray-200"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Lampiran Foto (Opsional)
              </label>
              <div className="flex gap-3">
                {attachments.map((file, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {attachments.length < 3 && (
                  <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#c9a24a] transition-colors">
                    <Camera className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-400">Tambah</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">Maksimal 3 foto</p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? "Mengirim..." : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Kirim Konsultasi
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
