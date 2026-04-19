/** @see ../method/README.md */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

/** @see ../authorization/README.md */
export type AuthorizationType = "none" | "bearer" | "basic" | "header";

export interface AuthorizationConfig {
  type?: AuthorizationType;
  /** Env var name; value is read in k6 as __ENV[tokenEnv] */
  tokenEnv?: string;
  /** When type is "header": header name (e.g. X-Api-Key) */
  headerName?: string;
}

export interface RequestConfig {
  url: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
}

export interface Stage {
  duration: string;
  target: number;
}

export interface K6Config {
  requests: RequestConfig[];
  /** Shared auth for all requests in the generated script */
  authorization?: AuthorizationConfig;
  vus?: number;
  duration?: string | number;
  /** When set, emitted as k6 \`stages\`; otherwise the preset for \`--scenario\` is used */
  stages?: Stage[];
}
