import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
  {
    "duration": "2m",
    "target": 50
  },
  {
    "duration": "5m",
    "target": 50
  },
  {
    "duration": "2m",
    "target": 0
  }
],
};

export default function () {
  {
    const requestHeaders = Object.assign({}, {});
    const pathOrFullUrl = "/blockchain-configs";
    const baseUrl = String(__ENV.BASE_URL || "").replace(/\/+$/, "");
    const fullUrl = pathOrFullUrl.startsWith("http") ? pathOrFullUrl : baseUrl + (pathOrFullUrl.startsWith("/") ? pathOrFullUrl : "/" + pathOrFullUrl);
    const params = { headers: requestHeaders };
    const res = http.get(fullUrl, params);
    check(res, { "status is 2xx": (r) => r.status >= 200 && r.status < 300 });
  }

  sleep(1);
}