import { useState } from "react";
import MessageTable from "../components/MessageTable";
import { PageHeader } from "@/shared/ui/PageHeader";

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
    <div className="space-y-5">
      <PageHeader title="Pesan Masuk (Contact Form)" />

      <MessageTable messages={messages} onSelect={handleSelect} />
    </div>
  );
}
