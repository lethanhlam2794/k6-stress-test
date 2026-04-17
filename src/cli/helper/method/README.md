# Method (bạn tự code)

Hướng dẫn gợi ý — không có implementation ở đây.

- Đồng bộ với `HttpMethod` và `K6Config.method` trong `../interface.ts`.
- Khi mở rộng: map method → lệnh k6 (`http.get`, `http.post`, …) trong `../../../generator/index.ts`.
- Có thể thêm sau: body JSON, query string, `multipart/form-data`, v.v.
