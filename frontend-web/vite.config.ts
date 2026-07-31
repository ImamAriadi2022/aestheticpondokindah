import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { mochaPlugins } from "@getmocha/vite-plugins";

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
	  plugins: [
	    ...mochaPlugins(process.env as any),
	    react(),
	  ],
	  server: {
	    port: 5173,
	    strictPort: true,
	    allowedHosts: true,
	  },
  build: {
    // `deploy.sh` continues publishing the repository-level webroot.
    outDir: "../public_html",
    emptyOutDir: true,
    chunkSizeWarningLimit: 5000,
  },
  resolve: {
    alias: {
      "@/components/dashboard": path.resolve(__dirname, "./src/features/dashboard/components"),
      "@/components/home": path.resolve(__dirname, "./src/features/home/components"),
      "@/components/chatbot": path.resolve(__dirname, "./src/features/consultation/components"),
      "@/components/DoctorCard": path.resolve(__dirname, "./src/features/doctors/DoctorCard.tsx"),
      "@/lib": path.resolve(__dirname, "./src/shared/lib"),
      "@/pages/booking": path.resolve(__dirname, "./src/features/reservation/pages/booking"),
      "@/pages/dashboard": path.resolve(__dirname, "./src/features/dashboard/pages/dashboard"),
      "@/pages/mobile": path.resolve(__dirname, "./src/features/mobile/pages/mobile"),
      "@/pages": path.resolve(__dirname, "./src/features/marketing/pages"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
