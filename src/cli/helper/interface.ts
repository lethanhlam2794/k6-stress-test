/**
 * HTTP method — gợi ý mở rộng: ../method/README.md
 */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

/**
 * Authorization — gợi ý mở rộng: ../authorization/README.md
 */
export type AuthorizationType = "none" | "bearer" | "basic" | "header";

export interface AuthorizationConfig {
  type?: AuthorizationType;
  /** Tên biến môi trường (vd. API_TOKEN) — k6 đọc qua __ENV */
  tokenEnv?: string;
  /** Khi type === "header": tên header (vd. X-Api-Key) */
  headerName?: string;
}

/** Một request trong kịch bản (path hoặc URL đầy đủ). */
export interface RequestConfig {
  url: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
}

export interface K6Config {
  /** Ít nhất một request mỗi vòng lặp */
  requests: RequestConfig[];
  /** Auth chung cho mọi request (ghi đè/ bổ sung trong script sinh ra) */
  authorization?: AuthorizationConfig;
  vus?: number;
  duration?: string | number;
}
