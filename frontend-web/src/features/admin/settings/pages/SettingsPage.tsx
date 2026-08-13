import GeneralSettingsForm from "../components/GeneralSettingsForm";

type Props = {
  settings?: any;
  onSaveSettings?: (data: any) => Promise<void>;
};

export default function SettingsPage({ settings, onSaveSettings }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#4A3F35]">Pengaturan Klinik</h2>
        <p className="text-sm text-[#8A7B6B] mt-1">Konfigurasi informasi resmi klinik, kontak WhatsApp, email, dan alamat operasional.</p>
      </div>

      <GeneralSettingsForm settings={settings} onSave={onSaveSettings} />
    </div>
  );
}
