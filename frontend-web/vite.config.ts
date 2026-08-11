import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { mochaPlugins } from "@getmocha/vite-plugins";

export default defineConfig({
  envDir: "../",
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
    // Plesk's document root must be Laravel's standard public/ directory.
    // Keep Laravel's index.php, .htaccess, storage link and existing uploads.
    outDir: "../public",
    emptyOutDir: false,
    chunkSizeWarningLimit: 5000,
  },
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "./src/core"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
