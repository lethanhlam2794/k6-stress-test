import { mkdirSync, writeFileSync } from "fs";
import type {
  AuthorizationConfig,
  K6Config,
  RequestConfig,
} from "../helpers/interface.js";

function buildRequestHeadersCode(
  yamlHeaders: Record<string, string> | undefined,
  auth: AuthorizationConfig | undefined,
): string {
  const base = JSON.stringify(yamlHeaders ?? {});
  if (!auth || auth.type === "none" || !auth.type) {
    return `const requestHeaders = Object.assign({}, ${base});`;
  }
  const env = auth.tokenEnv ?? "";
  if (auth.type === "bearer") {
    return `
const requestHeaders = Object.assign({}, ${base});
requestHeaders["Authorization"] = "Bearer " + String(__ENV[${JSON.stringify(env)}] ?? "");
`.trim();
  }
  if (auth.type === "basic") {
    return `
const requestHeaders = Object.assign({}, ${base});
requestHeaders["Authorization"] = "Basic " + String(__ENV[${JSON.stringify(env)}] ?? "");
`.trim();
  }
  if (auth.type === "header" && auth.headerName) {
    const name = auth.headerName;
    return `
const requestHeaders = Object.assign({}, ${base});
requestHeaders[${JSON.stringify(name)}] = String(__ENV[${JSON.stringify(env)}] ?? "");
`.trim();
  }
  return `const requestHeaders = Object.assign({}, ${base});`;
}

function buildHttpCall(method: string): string {
  switch (method) {
    case "GET":
      return `http.get(fullUrl, params);`;
    case "HEAD":
      return `http.head(fullUrl, params);`;
    case "POST":
      return `http.post(fullUrl, "", params);`;
    case "PUT":
      return `http.put(fullUrl, "", params);`;
    case "PATCH":
      return `http.patch(fullUrl, "", params);`;
    case "DELETE":
      return `http.del(fullUrl, params);`;
    case "OPTIONS":
      return `http.options(fullUrl, null, params);`;
    default:
      return `http.get(fullUrl, params);`;
  }
}

function buildScopedRequest(
  req: RequestConfig,
  globalAuth: AuthorizationConfig | undefined,
): string {
  const method = (req.method ?? "GET").toUpperCase();
  const pathLiteral = JSON.stringify(req.url);

  const lines = [
    buildRequestHeadersCode(req.headers, globalAuth),
    `const pathOrFullUrl = ${pathLiteral};`,
    `const baseUrl = String(__ENV.BASE_URL || "").replace(/\\/+$/, "");`,
    `const fullUrl = pathOrFullUrl.startsWith("http") ? pathOrFullUrl : baseUrl + (pathOrFullUrl.startsWith("/") ? pathOrFullUrl : "/" + pathOrFullUrl);`,
    `const params = { headers: requestHeaders };`,
    `const res = ${buildHttpCall(method)}`,
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

  const body = blocks.join("\n");

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
