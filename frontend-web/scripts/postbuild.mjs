// Post-build sync: restore operational PHP tooling & progress dashboard
// from repo-root public/ into the vite output dir (public_html).
// vite build uses emptyOutDir, which wipes outDir; without this step the
// deployment loses the DB setup / health-check / seed tools on every build.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");
const srcDir = path.join(repoRoot, "public");
const outDir = path.join(repoRoot, "public_html");

const OPERATIONAL_FILES = [
  "test_system.php",
  "setup_backend.php",
  "data_setup.php",
  "create_storage_link.php",
  "log_activity.php",
  "promo-meta.php",
  "progres.php",
  "activity_log.json",
  "favicon.ico",
];

mkdirSync(outDir, { recursive: true });

let copied = 0;
let skipped = 0;
for (const file of OPERATIONAL_FILES) {
  const src = path.join(srcDir, file);
  const dest = path.join(outDir, file);
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`[postbuild] copied ${file} -> public_html/`);
    copied++;
  } else {
    console.warn(`[postbuild] SKIP (missing in public/): ${file}`);
    skipped++;
  }
}
console.log(`[postbuild] synced ${copied} file(s), skipped ${skipped}.`);
