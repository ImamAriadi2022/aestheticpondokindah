// Post-build verification script: Ensure all operational PHP tooling
// and progress dashboard files remain intact in the webroot (public/).
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");
const webroot = path.join(repoRoot, "public");

const OPERATIONAL_FILES = [
  "index.php",
  ".htaccess",
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

let verified = 0;
let missing = 0;
for (const file of OPERATIONAL_FILES) {
  const filePath = path.join(webroot, file);
  if (existsSync(filePath)) {
    verified++;
  } else {
    console.warn(`[postbuild] WARNING (missing in public/): ${file}`);
    missing++;
  }
}
console.log(`[postbuild] Verified webroot (public/): ${verified} file(s) present, ${missing} missing.`);
