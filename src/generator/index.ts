import { mkdirSync, writeFileSync } from "fs";
import type { AuthorizationConfig, K6Config, RequestConfig } from "../cli/helper/interface.js";

function buildHeadersInit(
  headers: Record<string, string> | undefined,
  auth: AuthorizationConfig | undefined,
): string {
  const base = JSON.stringify(headers ?? {});
  if (!auth || auth.type === "none" || !auth.type) {
    return `const __hdr = Object.assign({}, ${base});`;
  }
  const env = auth.tokenEnv ?? "";
  if (auth.type === "bearer") {
    return `
const __hdr = Object.assign({}, ${base});
__hdr["Authorization"] = "Bearer " + String(__ENV[${JSON.stringify(env)}] ?? "");
`.trim();
  }
  if (auth.type === "basic") {
    return `
const __hdr = Object.assign({}, ${base});
__hdr["Authorization"] = "Basic " + String(__ENV[${JSON.stringify(env)}] ?? "");
`.trim();
  }
  if (auth.type === "header" && auth.headerName) {
    const name = auth.headerName;
    return `
const __hdr = Object.assign({}, ${base});
__hdr[${JSON.stringify(name)}] = String(__ENV[${JSON.stringify(env)}] ?? "");
`.trim();
  }
  return `const __hdr = Object.assign({}, ${base});`;
}

function buildHttpCall(method: string): string {
  switch (method) {
    case "GET":
      return `res = http.get(__url, __params);`;
    case "HEAD":
      return `res = http.head(__url, __params);`;
    case "POST":
      return `res = http.post(__url, "", __params);`;
    case "PUT":
      return `res = http.put(__url, "", __params);`;
    case "PATCH":
      return `res = http.patch(__url, "", __params);`;
    case "DELETE":
      return `res = http.del(__url, __params);`;
    case "OPTIONS":
      return `res = http.options(__url, null, __params);`;
    default:
      return `res = http.get(__url, __params);`;
  }
}

function buildScopedRequest(
  req: RequestConfig,
  globalAuth: AuthorizationConfig | undefined,
): string {
  const method = (req.method ?? "GET").toUpperCase();
  const pathLiteral = JSON.stringify(req.url);

  const lines = [
    buildHeadersInit(req.headers, globalAuth),
    `const __path = ${pathLiteral};`,
    `const __base = String(__ENV.BASE_URL || "").replace(/\\/+$/, "");`,
    `const __url = __path.startsWith("http") ? __path : __base + (__path.startsWith("/") ? __path : "/" + __path);`,
    `const __params = { headers: __hdr };`,
    buildHttpCall(method),
    `check(res, { "status is 2xx": (r) => r.status >= 200 && r.status < 300 });`,
  ];

  const inner = lines.map((line) => `  ${line}`).join("\n");
  return `{\n${inner}\n}`;
}

function generateScript(config: K6Config): string {
  const duration =
    typeof config.duration === "number"
      ? `${config.duration}s`
      : String(config.duration ?? "30s");

  const blocks = config.requests.map((req) =>
    buildScopedRequest(req, config.authorization),
  );

  const body = [`let res;`, ...blocks].join("\n");

  return `
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: ${config.vus ?? 1},
  duration: ${JSON.stringify(duration)},
};

export default function () {
${body
    .split("\n")
    .map((line) => (line ? `  ${line}` : ""))
    .join("\n")}

  sleep(1);
}
`.trim();
}

export function generateK6Script(
  config: K6Config,
  outputPath = "generated/test.js",
): void {
  const script = generateScript(config);
  mkdirSync("generated", { recursive: true });
  writeFileSync(outputPath, script, "utf8");
  console.log(`✅ Script generated: ${outputPath}`);
}
