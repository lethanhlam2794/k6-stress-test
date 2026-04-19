export function buildHttpCall(method: string, hasBody: boolean = false): string {
  switch (method) {
    case "GET":
      return `http.get(fullUrl, params);`;
    case "HEAD":
      return `http.head(fullUrl, params);`;
    case "POST":
      return `http.post(fullUrl, payload, params);`;
    case "PUT":
      return `http.put(fullUrl, payload, params);`;
    case "PATCH":
      return `http.patch(fullUrl, payload, params);`;
    case "DELETE":
      return `http.del(fullUrl, params);`;
    case "OPTIONS":
      return `http.options(fullUrl, null, params);`;
    default:
      return `http.get(fullUrl, params);`;
  }
}