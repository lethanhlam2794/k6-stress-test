# k6-stress-provider

Công cụ stress test dùng chung cho các project nội bộ — không cần viết k6 script tay, chỉ cần config YAML.

---

## Yêu cầu

- Node.js >= 18
- [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/)
- Docker (nếu dùng Grafana dashboard)

---

## Cài đặt

```bash
# Clone về
git clone <repo-url>
cd k6-stress-provider
npm install
```

---

## Cách dùng

### 1. Tạo file config

Tạo `k6.config.yml` ở root project:

```yaml
requests:
  - url: /api/users
    method: GET
  - url: /api/orders
    method: POST

vus: 50
duration: 30s
```

### 2. Chạy test

```bash
# Load test (mặc định)
npm run dev -- run

# Smoke test
npm run dev -- run --scenario smoke

# Spike test
npm run dev -- run --scenario spike

# Soak test
npm run dev -- run --scenario soak

# Breakpoint test
npm run dev -- run --scenario breakpoint

# Dùng config file khác
npm run dev -- run --config ./config/k6.config.yml
```

### 3. Xem Grafana dashboard (tuỳ chọn)

```bash
# Start InfluxDB + Grafana
cd infra
docker compose up -d

# Mở http://localhost:3001
# Login: admin / admin
# Import dashboard ID: 2587
```

---

## Cấu hình

### Cơ bản

```yaml
requests:
  - url: /health # path hoặc URL đầy đủ
    method: GET # GET | POST | PUT | PATCH | DELETE | HEAD | OPTIONS

vus: 5 # số user ảo
duration: 10s # thời gian chạy (chỉ dùng khi không có stages)
```

### Authorization

```yaml
requests:
  - url: /api/profile
    method: GET

authorization:
  type: bearer # none | bearer | basic | header
  tokenEnv: API_TOKEN # tên env var chứa token

vus: 10
duration: 30s
```

```bash
# Set env var trước khi chạy
export API_TOKEN=your-token-here
npm run dev -- run
```

### Custom header

```yaml
authorization:
  type: header
  headerName: X-Api-Key
  tokenEnv: API_KEY
```

---

## Scenarios

| Scenario     | Mô tả                      | Dùng khi                 |
| ------------ | -------------------------- | ------------------------ |
| `smoke`      | 1 VU, 30s                  | Kiểm tra API không crash |
| `load`       | Ramp up → hold → ramp down | Test tải bình thường     |
| `spike`      | Tăng đột ngột lên 500 VUs  | Test auto-scale          |
| `soak`       | 50 VUs trong 2 giờ         | Tìm memory leak          |
| `breakpoint` | Tăng dần đến 500 VUs       | Tìm giới hạn tối đa      |

---

## Biến môi trường

| Tên        | Mô tả               | Mặc định |
| ---------- | ------------------- | -------- |
| `BASE_URL` | URL server cần test | bắt buộc |

Tạo file `.env` từ template:

```bash
cp .env.example .env
```

---

## Thêm vào project mới

```bash
# Copy 2 file này vào project mới
cp k6.config.yml /path/to/new-project/
cp .env.example /path/to/new-project/.env

# Chạy từ k6-stress-provider
npm run dev -- run --config /path/to/new-project/k6.config.yml
```
