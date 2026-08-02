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
      "@core": path.resolve(__dirname, "./src/core"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
