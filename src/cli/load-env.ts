import { config as loadEnv } from "dotenv";
import { existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let loaded = false;

/** Loads `.env` from cwd, else from package root (two levels up from this file). */
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
