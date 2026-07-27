import { Card, CardHeader, CardContent, CardTitle } from "@/react-app/components/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

const notes = [
  { name: "Note 31.08.25", size: "56kb" },
  { name: "Note 23.06.25", size: "32kb" },
];

export default function NotesCard() {
  return (
    <Card className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-6 pb-4 flex items-center justify-between">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#2563EB]" /> Notes
        </CardTitle>
        <Button variant="ghost" size="xs" className="text-[#2563EB] hover:bg-[#2563EB]/10 px-2 py-1 rounded-full text-xs">
          DOWNLOAD
          <Download className="w-3 h-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-gray-100">
        {notes.map((n) => (
          <div key={n.name} className="flex items-center justify-between px-6 py-3 text-sm">
            <span className="flex-1 truncate text-gray-600">{n.name}</span>
            <span className="text-gray-400 text-xs mr-4">{n.size}</span>
            <Button variant="ghost" size="icon" className="text-[#2563EB] hover:bg-[#2563EB]/10">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
