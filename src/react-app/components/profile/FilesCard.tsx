import { Download, FileText } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";

const dummyFiles = [
  { name: "Check Up Result.pdf", size: "123kb" },
  { name: "Medical Prescriptions.pdf", size: "233kb" },
  { name: "X-Ray_2025_05.jpg", size: "512kb" },
];

export default function FilesCard() {
  return (
    <Card className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-6 pb-4 flex items-center justify-between">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#2563EB]" /> Files
        </CardTitle>
        <Button variant="ghost" size="xs" className="text-[#2563EB] hover:bg-[#2563EB]/10 px-2 py-1 rounded-full text-xs">
          DOWNLOAD ALL
          <Download className="w-3 h-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-gray-100">
        {dummyFiles.map((file) => (
          <div key={file.name} className="flex items-center justify-between px-6 py-3 text-sm">
            <span className="flex-1 truncate text-gray-600">{file.name}</span>
            <span className="text-gray-400 text-xs mr-4">{file.size}</span>
            <Button variant="ghost" size="icon" className="text-[#2563EB] hover:bg-[#2563EB]/10">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
