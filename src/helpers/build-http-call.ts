/** Emits k6 `http.*` call expression (right-hand side of `const res = ...`). Uses `fullUrl` and `params`. */
export function buildHttpCall(method: string): string {
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
