import { config as loadEnv } from "dotenv";
import { existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let loaded = false;

/**
 * Nạp `.env`: ưu tiên cwd, sau đó root project (src/cli hoặc dist/cli → ../..).
 * Các file khác không cần import module này — chỉ đọc `process.env`.
 * Entry (vd. `index.ts`): `import "./load-env.js"` (dòng import đầu tiên).
 */
export function loadProjectEnv(): void {
  if (loaded) return;
  loaded = true;
  const fromCwd = resolve(process.cwd(), ".env");
  const fromPackageRoot = resolve(__dirname, "..", "..", ".env");
  if (existsSync(fromCwd)) {
    loadEnv({ path: fromCwd });
  } else if (existsSync(fromPackageRoot)) {
    loadEnv({ path: fromPackageRoot });
  } else {
    loadEnv();
  }
}

loadProjectEnv();
