import { Activity } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/react-app/components/ui/card";

export default function AnamnesisCard() {
  const rows = [
    { label: "Alergi", value: "Nuts, pollen" },
    { label: "Penyakit kronis", value: "Asthma" },
    { label: "Golongan darah", value: "A+" },
    { label: "Penyakit / operasi", value: "Corona virus" },
  ];

  return (
    <Card className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-6 pb-4">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#2563EB]" /> Anamnesis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
            <span className="text-gray-500">{row.label}</span>
            <span className="font-medium text-gray-900 text-right max-w-[60%] truncate">
              {row.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
