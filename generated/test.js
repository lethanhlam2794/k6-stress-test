import http from 'k6/http';
import { check, sleep } from 'k6';

// ✅ options sinh từ config
export const options = {
  vus: 5,
  duration: '10s',
};

export default function () {
  // ✅ target từ config
  const res = http.get(__ENV.BASE_URL + '/blockchain-configs');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}