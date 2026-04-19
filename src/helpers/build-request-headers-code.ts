import type { AuthorizationConfig } from "./interface.js";

/** Emits k6 script lines that build `requestHeaders` from YAML headers + optional auth. */
export function buildRequestHeadersCode(
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
