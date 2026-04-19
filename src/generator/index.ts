import { mkdirSync, writeFileSync } from "fs";
import { buildHttpCall } from "../helpers/build-http-call.js";
import { buildRequestHeadersCode } from "../helpers/build-request-headers-code.js";
import type {
  AuthorizationConfig,
  K6Config,
  RequestConfig,
  Stage,
} from "../helpers/interface.js";
import {
  breakpointStages,
  smokeStages,
  loadStages,
  soakStages,
  spikeStages,
} from "../scenarios/index.js";

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

function generateScript(config: K6Config, scenario: string): string {
  const SCENARIO_STAGES: Record<string, Stage[]> = {
    smoke: smokeStages,
    load: loadStages,
    spike: spikeStages,
    soak: soakStages,
    breakpoint: breakpointStages,
  };

  const stages =
    config.stages && config.stages.length > 0
      ? config.stages
      : SCENARIO_STAGES[scenario];

  const duration =
    typeof config.duration === "number"
      ? `${config.duration}s`
      : String(config.duration ?? "30s");

  const optionsBlock = stages
    ? `stages: ${JSON.stringify(stages, null, 2)}`
    : `vus: ${config.vus ?? 1}, duration: ${JSON.stringify(duration)}`;

  const blocks = config.requests.map((req) =>
    buildScopedRequest(req, config.authorization),
  );

  const body = blocks.join("\n");

  return `
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  ${optionsBlock},
};

export default function () {
${body
  .split("\n")
  .map((line: string) => (line ? `  ${line}` : ""))
  .join("\n")}

  sleep(1);
}
`.trim();
}

export function generateK6Script(
  config: K6Config,
  scenario: string,
  outputPath = "generated/test.js",
): void {
  const script = generateScript(config, scenario);
  mkdirSync("generated", { recursive: true });
  writeFileSync(outputPath, script, "utf8");
  console.log(`✅ Script generated: ${outputPath}`);
}
