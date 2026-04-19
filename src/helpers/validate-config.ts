import type { HttpMethod, K6Config } from "./interface.js";

const HTTP_METHODS = new Set<HttpMethod>([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
]);

export function validateConfig(config: K6Config): string[] {
  const errors: string[] = [];

  if (!Array.isArray(config.requests) || config.requests.length === 0) {
    errors.push("config.requests must be a non-empty array");
  } else {
    config.requests.forEach((req, i) => {
      if (!req.url?.trim()) {
        errors.push(`requests[${i}].url is required`);
      }
      if (req.method !== undefined && !HTTP_METHODS.has(req.method)) {
        errors.push(`Invalid requests[${i}].method: ${req.method}`);
      }
    });
  }

  if (config.vus === undefined) {
    errors.push("Missing config.vus");
  }
  if (!config.duration) {
    errors.push("Missing config.duration");
  }

  const auth = config.authorization;
  if (auth?.type && auth.type !== "none") {
    if (auth.type === "bearer" || auth.type === "basic") {
      if (!auth.tokenEnv?.trim()) {
        errors.push(
          "config.authorization.tokenEnv is required when type is bearer or basic",
        );
      }
    }
    if (auth.type === "header") {
      if (!auth.headerName?.trim()) {
        errors.push(
          'config.authorization.headerName is required when type is "header"',
        );
      }
      if (!auth.tokenEnv?.trim()) {
        errors.push(
          'config.authorization.tokenEnv is required when type is "header" (value from env)',
        );
      }
    }
  }

  return errors;
}
