import { useEffect, useState } from "react";
import { Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";

type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __pwaInstallPrompt?: DeferredInstallPrompt;
  }
}

export function PwaInstallButton({ className = "" }: { className?: string }) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(Boolean(window.__pwaInstallPrompt));

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setIsInstalled(standalone);
    const onAvailable = () => setIsInstallable(true);
    const onInstalled = () => setIsInstalled(true);
    window.addEventListener("pwa-install-available", onAvailable);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("pwa-install-available", onAvailable);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    const prompt = window.__pwaInstallPrompt;
    if (!prompt) {
      toast({ title: "Instal aplikasi", message: "Gunakan menu browser lalu pilih ‘Tambahkan ke layar utama’ untuk memasang PWA.", variant: "info" });
      return;
    }
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    window.__pwaInstallPrompt = undefined;
    setIsInstallable(false);
  };

  if (isInstalled) {
    return <Button type="button" variant="outline" disabled className={className}><CheckCircle2 className="w-4 h-4 mr-2" />PWA Terpasang</Button>;
  }

  return <Button type="button" onClick={install} className={className}><Download className="w-4 h-4 mr-2" />{isInstallable ? "Instal PWA" : "Pasang sebagai PWA"}</Button>;
}
