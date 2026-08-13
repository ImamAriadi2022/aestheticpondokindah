import { useState } from "react";
import MessageTable from "../components/MessageTable";

type Props = {
  messages: any[];
  onSelectMessage?: (msg: any) => void;
};

export default function MessagesPage({ messages, onSelectMessage }: Props) {
  const [selected, setSelected] = useState<any | null>(null);

  const handleSelect = (msg: any) => {
    setSelected(msg);
    if (onSelectMessage) onSelectMessage(msg);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#4A3F35]">Pesan Masuk (Contact Form)</h2>
        <p className="text-sm text-[#8A7B6B] mt-1">Daftar pertanyaan dan pesan kontak dari pengunjung web klinik.</p>
      </div>

      <MessageTable messages={messages} onSelect={handleSelect} />
    </div>
  );
}
