// Pre-build cleanup script: Removes stale Vite hashed bundles in ../public/assets
// while preserving Laravel webroot files (index.php, .htaccess, storage, uploads, media).
import { existsSync, rmSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");
const assetsDir = path.join(repoRoot, "public", "assets");

if (existsSync(assetsDir)) {
  rmSync(assetsDir, { recursive: true, force: true });
}
mkdirSync(assetsDir, { recursive: true });
console.log("[prebuild] Cleaned stale Vite assets in public/assets/");
